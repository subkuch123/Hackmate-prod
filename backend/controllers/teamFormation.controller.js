// controllers/teamFormation.controller.js
import mongoose from "mongoose";
import { sendTeamNotification } from "../services/sendTeamEmail.service.js";
import Hackathon from "../models/hackthon.model.js";
import Team from "../models/team.model.js";
import TeamMember from "../models/teamMember.model.js";
import User from "../models/user.model.js";
import logger from "../utils/logger.js";

// Error types for better handling
const ErrorTypes = {
  TRANSIENT: "TRANSIENT",
  VALIDATION: "VALIDATION",
  BUSINESS: "BUSINESS",
  FATAL: "FATAL",
};

class TeamFormationError extends Error {
  constructor(message, type, code, retryable = false) {
    super(message);
    this.name = "TeamFormationError";
    this.type = type;
    this.code = code;
    this.retryable = retryable;
    this.timestamp = new Date().toISOString();
  }
}

// Error classification function
const classifyError = (error) => {
  if (error.code === 112 || error.codeName === "WriteConflict") {
    return new TeamFormationError(
      error.message,
      ErrorTypes.TRANSIENT,
      error.code,
      true
    );
  }

  if (error.code === 11000) {
    return new TeamFormationError(
      "Duplicate key error",
      ErrorTypes.VALIDATION,
      error.code,
      false
    );
  }

  if (error.name === "ValidationError") {
    return new TeamFormationError(
      `Validation error: ${error.message}`,
      ErrorTypes.VALIDATION,
      "VALIDATION_ERROR",
      false
    );
  }

  if (error.name === "CastError") {
    return new TeamFormationError(
      `Invalid data format: ${error.message}`,
      ErrorTypes.VALIDATION,
      "CAST_ERROR",
      false
    );
  }

  if (
    error.message.includes("No participants") ||
    error.message.includes("No problem statements") ||
    error.message.includes("Not enough participants") ||
    error.message.includes("Hackathon already started")
  ) {
    return new TeamFormationError(
      error.message,
      ErrorTypes.BUSINESS,
      "BUSINESS_RULE",
      false
    );
  }

  return new TeamFormationError(
    error.message,
    ErrorTypes.FATAL,
    "UNKNOWN_ERROR",
    false
  );
};

// Retry mechanism with exponential backoff
const retryOperation = async (operation, maxRetries = 3, baseDelay = 500) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = classifyError(error);

      if (!lastError.retryable || attempt === maxRetries) {
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      logger.warn(`Attempt ${attempt} failed. Retrying in ${delay}ms...`, {
        error: lastError.message,
        type: lastError.type,
        code: lastError.code,
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// Function to cancel hackathon and cleanup
const cancelHackathon = async (hackathon, reason = "Technical issues", io) => {
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    const { _id, title, participants } = hackathon;

    logger.info(`Cancelling hackathon: ${title}`, {
      hackathonId: _id,
      reason,
      participantCount: participants?.length || 0,
    });

    // Update hackathon status to cancelled
    await Hackathon.findByIdAndUpdate(
      _id,
      {
        $set: {
          status: "cancelled",
          isActive: false,
          reason: reason,
        },
      },
      { session }
    );

    // Clear currentHackathonId for all participants
    if (participants && participants.length > 0) {
      const userUpdatePromises = participants.map((participantId) =>
        User.findByIdAndUpdate(
          participantId,
          {
            $unset: { currentHackathonId: null },
          },
          { session }
        )
      );

      await Promise.all(userUpdatePromises);
      logger.info(
        `Cleared currentHackathonId for ${participants.length} participants`
      );
    }

    // Delete any teams that were created for this hackathon
    const teamsDeleted = await Team.deleteMany(
      { hackathonId: _id },
      { session }
    );

    // Delete team members associated with those teams
    if (teamsDeleted.deletedCount > 0) {
      const teamIds = (
        await Team.find({ hackathonId: _id }).session(session)
      ).map((team) => team._id);
      await TeamMember.deleteMany({ teamId: { $in: teamIds } }, { session });
      logger.info(
        `Deleted ${teamsDeleted.deletedCount} teams and their members`
      );
    }

    await session.commitTransaction();

    logger.info(`Successfully cancelled hackathon: ${title}`, {
      hackathonId: _id,
      participantsCleared: participants?.length || 0,
      teamsDeleted: teamsDeleted.deletedCount || 0,
    });

    // Notify clients about hackathon cancellation
    if (io) {
      io.to(_id.toString()).emit("hackathon-cancelled", {
        hackathonId: _id,
        hackathonTitle: title,
        reason: reason,
        cancelledAt: new Date().toISOString(),
      });
    }

    return {
      success: true,
      hackathonId: _id,
      hackathonTitle: title,
      participantsCleared: participants?.length || 0,
      teamsDeleted: teamsDeleted.deletedCount || 0,
      reason: reason,
    };
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Failed to cancel hackathon ${hackathon.title}:`, error);
    throw error;
  } finally {
    session.endSession();
  }
};

// Manual team formation function
export const manualTeamFormation = async (req, res) => {
  const { hackathonId } = req.params;
  const session = await mongoose.startSession();
  let transactionCommitted = false;

  try {
    await session.startTransaction();

    // Find the hackathon
    const hackathon = await Hackathon.findById(hackathonId).populate({
      path: "participants",
      select: "name email skills",
    });

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    const {
      participants,
      maxTeamSize,
      problemStatements,
      minParticipantsToFormTeam,
      _id,
      title,
      status,
    } = hackathon;

    // Check if teams are already formed
    const existingTeams = await Team.find({ hackathonId: _id });
    if (existingTeams.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Teams have already been formed for this hackathon",
        teamsCount: existingTeams.length,
      });
    }

    // Check if hackathon is in correct state
    if (status !== "registration_open") {
      return res.status(400).json({
        success: false,
        message: `Cannot form teams when hackathon status is '${status}'. Status must be 'registration_open'`,
      });
    }

    // Validation checks
    if (!participants || participants.length === 0) {
      return res.status(400).json({
        success: false,
        message: `No participants registered for hackathon: ${title}`,
      });
    }

    if (!problemStatements || problemStatements.length === 0) {
      return res.status(400).json({
        success: false,
        message: `No problem statements defined for hackathon: ${title}`,
      });
    }

    if (participants.length < minParticipantsToFormTeam) {
      return res.status(400).json({
        success: false,
        message: `Not enough participants to form teams. Need at least ${minParticipantsToFormTeam}, have ${participants.length}`,
      });
    }

    // Check if hackathon has already started
    const now = new Date();
    if (hackathon.startDate <= now) {
      return res.status(400).json({
        success: false,
        message: `Hackathon ${title} has already started. Cannot form teams.`,
      });
    }

    // Calculate optimal team distribution
    const totalParticipants = participants.length;
    const optimalTeamCount = Math.ceil(totalParticipants / maxTeamSize);
    const baseTeamSize = Math.floor(totalParticipants / optimalTeamCount);
    const remainder = totalParticipants % optimalTeamCount;

    logger.info(`Manually creating teams for hackathon: ${title}`, {
      totalParticipants,
      optimalTeamCount,
      baseTeamSize,
      remainder,
      minParticipantsToFormTeam,
      maxTeamSize,
    });

    // Shuffle participants randomly
    const shuffledParticipants = [...participants];
    for (let i = shuffledParticipants.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledParticipants[i], shuffledParticipants[j]] = [
        shuffledParticipants[j],
        shuffledParticipants[i],
      ];
    }

    const createdTeams = [];
    const emailPromises = [];
    let participantIndex = 0;

    // Create teams with optimal distribution
    for (let teamIndex = 0; teamIndex < optimalTeamCount; teamIndex++) {
      const currentTeamSize =
        teamIndex < remainder ? baseTeamSize + 1 : baseTeamSize;

      if (participantIndex >= shuffledParticipants.length) break;

      const teamMembers = shuffledParticipants.slice(
        participantIndex,
        participantIndex + currentTeamSize
      );
      participantIndex += currentTeamSize;

      // Pick random problem statement
      const randomProblemIndex = Math.floor(
        Math.random() * problemStatements.length
      );
      const randomProblem = problemStatements[randomProblemIndex];

      // Generate unique team name
      const teamName = `Team-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;

      // Create team document
      const team = await Team.create(
        [
          {
            hackathonId: _id,
            name: teamName,
            problemStatement: randomProblem,
            submissionStatus: "not_submitted",
            teamSize: currentTeamSize,
            teamMember: teamMembers,
          },
        ],
        { session }
      );

      // Create team members and update users
      const teamMemberPromises = teamMembers.map((memberId, index) => {
        const role = index === 0 ? "leader" : "developer";
        return TeamMember.create(
          [
            {
              teamId: team[0]._id,
              userId: memberId,
              role: role,
              status: "active",
            },
          ],
          { session }
        );
      });

      // Update users' current hackathon
      const userUpdatePromises = teamMembers.map((memberId) =>
        User.findByIdAndUpdate(
          memberId,
          { currentHackathonId: _id },
          { session }
        )
      );

      await Promise.all([...teamMemberPromises, ...userUpdatePromises]);

      // Populate team details
      const populatedTeam = await Team.findById(team[0]._id)
        .populate({
          path: "teamMember",
          select: "id name email skills",
        })
        .populate({
          path: "members",
          populate: {
            path: "userId",
            select: "id name email skills",
          },
        })
        .session(session);

      createdTeams.push(populatedTeam);

      // Prepare email notifications (outside transaction)
      for (const memberId of teamMembers) {
        const user = await User.findById(memberId).session(session);
        if (!user) continue;

        const teammates = teamMembers
          .filter((mId) => mId.toString() !== memberId.toString())
          .map(async (mId) => {
            const teammate = await User.findById(mId).session(session);
            return teammate ? teammate.name : "Teammate";
          });

        const teammateNames = await Promise.all(teammates);

        emailPromises.push(
          sendTeamNotification({
            email: user.email,
            name: user.name,
            hackathonTitle: title,
            teammates: teammateNames,
            problemStatement: randomProblem,
            teamName: teamName,
          }).catch((emailError) => {
            logger.error(`Failed to send email to ${user.email}:`, emailError);
            return null;
          })
        );
      }
    }

    // Update hackathon status
    await Hackathon.findByIdAndUpdate(
      _id,
      {
        $set: {
          status: "registration_closed",
        },
      },
      { session }
    );

    await session.commitTransaction();
    transactionCommitted = true;
    logger.info(`Transaction committed successfully for hackathon: ${title}`);

    // Send emails outside transaction
    if (emailPromises.length > 0) {
      const emailResults = await Promise.allSettled(emailPromises);
      const successfulEmails = emailResults.filter(
        (r) => r.status === "fulfilled"
      ).length;
      const failedEmails = emailResults.filter(
        (r) => r.status === "rejected"
      ).length;

      logger.info(
        `Emails sent: ${successfulEmails} successful, ${failedEmails} failed`
      );
    }

    logger.info(
      `Successfully created ${createdTeams.length} teams for ${title}`
    );

    return res.status(200).json({
      success: true,
      message: `Successfully formed ${createdTeams.length} teams for hackathon: ${title}`,
      data: {
        teamsCreated: createdTeams.length,
        hackathonId: _id,
        hackathonTitle: title,
        totalParticipants: totalParticipants,
      },
    });
  } catch (error) {
    // Only abort transaction if it hasn't been committed
    if (!transactionCommitted) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        logger.warn(`Error aborting transaction: ${abortError.message}`);
      }
    }

    logger.error(`Error in manual team formation:`, error);

    return res.status(500).json({
      success: false,
      message: "Failed to form teams",
      error: error.message,
    });
  } finally {
    try {
      session.endSession();
    } catch (sessionError) {
      logger.warn(`Error ending session: ${sessionError.message}`);
    }
  }
};

// Manual hackathon completion function
export const manualCompleteHackathon = async (req, res) => {
  const { hackathonId } = req.params;
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    // Find the hackathon
    const hackathon = await Hackathon.findById(hackathonId);

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    const { _id, title, status, participants } = hackathon;

    // Check if hackathon is already completed
    if (status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Hackathon is already completed",
      });
    }

    logger.info(`Manually completing hackathon: ${title}`, {
      hackathonId: _id,
      currentStatus: status,
    });

    // Update hackathon status to completed
    await Hackathon.findByIdAndUpdate(
      _id,
      {
        $set: {
          status: "completed",
          isActive: false,
        },
      },
      { session }
    );

    // Find all teams for this hackathon
    const teams = await Team.find({ hackathonId: _id }).session(session);
    logger.info(
      `Found ${teams.length} teams to process for hackathon: ${title}`
    );

    // Update team statuses to completed
    const teamUpdatePromises = teams.map((team) =>
      Team.findByIdAndUpdate(
        team._id,
        {
          $set: {
            status: "completed",
          },
        },
        { session }
      )
    );

    // Clear currentHackathonId for all participants
    const userUpdatePromises = participants.map((participantId) =>
      User.findByIdAndUpdate(
        participantId,
        {
          $unset: { currentHackathonId: null },
        },
        { session }
      )
    );

    await Promise.all([...teamUpdatePromises, ...userUpdatePromises]);
    await session.commitTransaction();

    logger.info(`Successfully completed hackathon: ${title}`);

    return res.status(200).json({
      success: true,
      message: `Successfully completed hackathon: ${title}`,
      data: {
        hackathonId: _id,
        hackathonTitle: title,
        teamsProcessed: teams.length,
        participantsProcessed: participants.length,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Failed to complete hackathon:`, error);

    return res.status(500).json({
      success: false,
      message: "Failed to complete hackathon",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// Manual hackathon cancellation function
export const manualCancelHackathon = async (req, res) => {
  const { hackathonId } = req.params;
  const { reason = "Administrative decision" } = req.body;

  try {
    // Find the hackathon
    const hackathon = await Hackathon.findById(hackathonId);

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    // Check if hackathon is already cancelled
    if (hackathon.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Hackathon is already cancelled",
      });
    }

    const result = await cancelHackathon(hackathon, reason, req.app.get("io"));

    return res.status(200).json({
      success: true,
      message: `Successfully cancelled hackathon: ${hackathon.title}`,
      data: result,
    });
  } catch (error) {
    logger.error(`Failed to cancel hackathon:`, error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel hackathon",
      error: error.message,
    });
  }
};

// Manual status update function
export const manualUpdateHackathonStatus = async (req, res) => {
  const { hackathonId } = req.params;
  const { status } = req.body;

  const allowedStatuses = [
    "registration_open",
    "registration_closed",
    "ongoing",
    "winner_to_announced",
    "completed",
    "cancelled",
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Allowed statuses: ${allowedStatuses.join(
        ", "
      )}`,
    });
  }

  try {
    const hackathon = await Hackathon.findById(hackathonId);

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    // Additional validation based on current status
    if (
      status === "registration_closed" &&
      hackathon.status !== "registration_open"
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot change to 'registration_closed' from current status '${hackathon.status}'`,
      });
    }

    const updatedHackathon = await Hackathon.findByIdAndUpdate(
      hackathonId,
      {
        $set: { status },
        ...(status === "completed" || status === "cancelled"
          ? { isActive: false }
          : {}),
      },
      { new: true }
    );

    logger.info(
      `Manually updated hackathon status: ${hackathon.title} -> ${status}`
    );

    return res.status(200).json({
      success: true,
      message: `Successfully updated hackathon status to: ${status}`,
      data: {
        hackathonId: updatedHackathon._id,
        hackathonTitle: updatedHackathon.title,
        previousStatus: hackathon.status,
        newStatus: updatedHackathon.status,
        isActive: updatedHackathon.isActive,
      },
    });
  } catch (error) {
    logger.error(`Failed to update hackathon status:`, error);

    return res.status(500).json({
      success: false,
      message: "Failed to update hackathon status",
      error: error.message,
    });
  }
};

export {
  ErrorTypes,
  TeamFormationError,
  classifyError,
  retryOperation,
  cancelHackathon,
};
