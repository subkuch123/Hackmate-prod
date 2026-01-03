import mongoose from "mongoose";
import { sendTeamNotification } from "../services/sendTeamEmail.service.js";
import Hackathon from "../models/hackthon.model.js";
import Team from "../models/team.model.js";
import TeamMember from "../models/teamMember.model.js";
import User from "../models/user.model.js";
import logger from "../utils/logger.js";

// Enhanced Error types with more specific categories
const ErrorTypes = {
  TRANSIENT: "TRANSIENT", // Network, database connection issues
  VALIDATION: "VALIDATION", // Data validation errors
  BUSINESS: "BUSINESS", // Business rule violations
  EMAIL: "EMAIL", // Email sending failures
  DATABASE: "DATABASE", // Database operation failures
  EXTERNAL: "EXTERNAL", // External service failures
  FATAL: "FATAL", // Unrecoverable errors
};

// Operation steps for detailed tracking
const OperationSteps = {
  VALIDATION: "VALIDATION",
  PARTICIPANT_CHECK: "PARTICIPANT_CHECK",
  PROBLEM_STATEMENT_CHECK: "PROBLEM_STATEMENT_CHECK",
  TEAM_FORMATION: "TEAM_FORMATION",
  TEAM_CREATION: "TEAM_CREATION",
  TEAM_MEMBER_ASSIGNMENT: "TEAM_MEMBER_ASSIGNMENT",
  USER_UPDATE: "USER_UPDATE",
  EMAIL_NOTIFICATION: "EMAIL_NOTIFICATION",
  HACKATHON_STATUS_UPDATE: "HACKATHON_STATUS_UPDATE",
  CLEANUP: "CLEANUP",
  CANCELLATION: "CANCELLATION",
};

class SchedulerError extends Error {
  constructor(
    message,
    type,
    code,
    retryable = false,
    step = null,
    details = null
  ) {
    super(message);
    this.name = "SchedulerError";
    this.type = type;
    this.code = code;
    this.retryable = retryable;
    this.step = step;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toResponse() {
    return {
      message: this.message,
      type: this.type,
      code: this.code,
      step: this.step,
      details: this.details,
      timestamp: this.timestamp,
      retryable: this.retryable,
    };
  }
}

// Enhanced error classification
const classifyError = (error, step = null) => {
  // MongoDB duplicate key error
  if (error.code === 11000) {
    return new SchedulerError(
      "Duplicate key error - resource already exists",
      ErrorTypes.VALIDATION,
      error.code,
      false,
      step,
      { duplicatedFields: error.keyValue }
    );
  }

  // MongoDB write conflict
  if (error.code === 112 || error.codeName === "WriteConflict") {
    return new SchedulerError(
      "Database write conflict - please retry",
      ErrorTypes.TRANSIENT,
      error.code,
      true,
      step
    );
  }

  // MongoDB connection errors
  if (
    error.name === "MongoNetworkError" ||
    error.message.includes("ECONNREFUSED")
  ) {
    return new SchedulerError(
      "Database connection failed",
      ErrorTypes.TRANSIENT,
      "DB_CONNECTION_ERROR",
      true,
      step
    );
  }

  // Validation errors
  if (error.name === "ValidationError") {
    const validationDetails = {};
    if (error.errors) {
      Object.keys(error.errors).forEach((field) => {
        validationDetails[field] = error.errors[field].message;
      });
    }
    return new SchedulerError(
      `Data validation failed: ${error.message}`,
      ErrorTypes.VALIDATION,
      "VALIDATION_ERROR",
      false,
      step,
      validationDetails
    );
  }

  // Cast errors
  if (error.name === "CastError") {
    return new SchedulerError(
      `Invalid data format: ${error.message}`,
      ErrorTypes.VALIDATION,
      "CAST_ERROR",
      false,
      step,
      { value: error.value, kind: error.kind, path: error.path }
    );
  }

  // Business rule errors (from our application)
  if (
    error.message.includes("No participants") ||
    error.message.includes("No problem statements") ||
    error.message.includes("Not enough participants") ||
    error.message.includes("Hackathon already started") ||
    error.message.includes("Registration deadline has not passed")
  ) {
    return new SchedulerError(
      error.message,
      ErrorTypes.BUSINESS,
      "BUSINESS_RULE_VIOLATION",
      false,
      step
    );
  }

  // Email errors
  if (
    error.message.includes("Email") ||
    error.message.includes("SMTP") ||
    error.message.includes("send")
  ) {
    return new SchedulerError(
      error.message,
      ErrorTypes.EMAIL,
      "EMAIL_SEND_FAILED",
      true, // Email failures are retryable
      step
    );
  }

  // Default to fatal error
  return new SchedulerError(
    error.message || "Unknown error occurred",
    ErrorTypes.FATAL,
    "UNKNOWN_ERROR",
    false,
    step
  );
};

// Enhanced retry mechanism with step tracking
const retryOperation = async (
  operation,
  operationName,
  maxRetries = 3,
  baseDelay = 500
) => {
  let lastError;
  const retryStats = {
    attempts: 0,
    successful: false,
    errors: [],
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    retryStats.attempts = attempt;
    try {
      const result = await operation();
      retryStats.successful = true;
      logger.info(
        `Operation ${operationName} succeeded on attempt ${attempt}`,
        {
          operation: operationName,
          attempt,
          maxRetries,
        }
      );
      return result;
    } catch (error) {
      const classifiedError = classifyError(error);
      lastError = classifiedError;
      retryStats.errors.push({
        attempt,
        error: classifiedError.toResponse(),
        timestamp: new Date().toISOString(),
      });

      if (!classifiedError.retryable || attempt === maxRetries) {
        logger.warn(
          `Operation ${operationName} failed permanently after ${attempt} attempts`,
          {
            operation: operationName,
            attempt,
            maxRetries,
            finalError: classifiedError.toResponse(),
          }
        );
        break;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      logger.warn(
        `Operation ${operationName} failed on attempt ${attempt}. Retrying in ${delay}ms...`,
        {
          operation: operationName,
          attempt,
          maxRetries,
          error: classifiedError.toResponse(),
          nextRetryDelay: delay,
        }
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// Enhanced operation tracker
class OperationTracker {
  constructor(operationName, hackathonId) {
    this.operationName = operationName;
    this.hackathonId = hackathonId;
    this.startTime = new Date().toISOString();
    this.steps = [];
    this.errors = [];
    this.warnings = [];
    this.result = null;
  }

  addStep(step, status, details = null) {
    const stepInfo = {
      step,
      status,
      timestamp: new Date().toISOString(),
      details,
    };
    this.steps.push(stepInfo);

    if (status === "failed") {
      this.errors.push(stepInfo);
    } else if (status === "warning") {
      this.warnings.push(stepInfo);
    }

    return stepInfo;
  }

  setResult(result) {
    this.result = result;
    this.endTime = new Date().toISOString();
    this.duration = new Date(this.endTime) - new Date(this.startTime);
  }

  toResponse() {
    return {
      operation: this.operationName,
      hackathonId: this.hackathonId,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration,
      steps: this.steps,
      errors: this.errors,
      warnings: this.warnings,
      result: this.result,
      success: this.errors.length === 0,
    };
  }
}

// Enhanced cancelHackathon function
const cancelHackathon = async (
  hackathon,
  reason = "Technical issues",
  io,
  tracker = null
) => {
  const session = await mongoose.startSession();
  const operationTracker =
    tracker ||
    new OperationTracker("cancelHackathon", hackathon._id.toString());

  try {
    operationTracker.addStep(OperationSteps.VALIDATION, "started");
    await session.startTransaction();

    const { _id, title, participants } = hackathon;

    logger.info(`Cancelling hackathon: ${title}`, {
      hackathonId: _id,
      reason,
      participantCount: participants?.length || 0,
    });

    operationTracker.addStep(OperationSteps.VALIDATION, "completed", {
      hackathonTitle: title,
      participantCount: participants?.length || 0,
      reason,
    });

    // Update hackathon status to cancelled
    operationTracker.addStep(OperationSteps.HACKATHON_STATUS_UPDATE, "started");
    await Hackathon.findByIdAndUpdate(
      _id,
      {
        $set: {
          status: "cancelled",
          isActive: false,
          reason: reason,
          cancelledAt: new Date(),
        },
      },
      { session }
    );
    operationTracker.addStep(
      OperationSteps.HACKATHON_STATUS_UPDATE,
      "completed"
    );

    // Clear currentHackathonId for all participants
    operationTracker.addStep(OperationSteps.USER_UPDATE, "started");
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
      operationTracker.addStep(OperationSteps.USER_UPDATE, "completed", {
        participantsCleared: participants.length,
      });
      logger.info(
        `Cleared currentHackathonId for ${participants.length} participants`
      );
    } else {
      operationTracker.addStep(OperationSteps.USER_UPDATE, "skipped", {
        reason: "No participants",
      });
    }

    // Delete any teams that were created for this hackathon
    operationTracker.addStep(OperationSteps.CLEANUP, "started");
    const teamsDeleted = await Team.deleteMany(
      { hackathonId: _id },
      { session }
    );

    // Delete team members associated with those teams
    let teamMembersDeleted = 0;
    if (teamsDeleted.deletedCount > 0) {
      const teamIds = (
        await Team.find({ hackathonId: _id }).session(session)
      ).map((team) => team._id);
      const deleteResult = await TeamMember.deleteMany(
        { teamId: { $in: teamIds } },
        { session }
      );
      teamMembersDeleted = deleteResult.deletedCount;
      operationTracker.addStep(OperationSteps.CLEANUP, "completed", {
        teamsDeleted: teamsDeleted.deletedCount,
        teamMembersDeleted,
      });
      logger.info(
        `Deleted ${teamsDeleted.deletedCount} teams and ${teamMembersDeleted} team members`
      );
    } else {
      operationTracker.addStep(OperationSteps.CLEANUP, "skipped", {
        reason: "No teams found",
      });
    }

    await session.commitTransaction();
    operationTracker.addStep("TRANSACTION", "committed");

    logger.info(`Successfully cancelled hackathon: ${title}`, {
      hackathonId: _id,
      participantsCleared: participants?.length || 0,
      teamsDeleted: teamsDeleted.deletedCount || 0,
      teamMembersDeleted,
    });

    // Notify clients about hackathon cancellation
    if (io) {
      io.to(_id.toString()).emit("hackathon-cancelled", {
        hackathonId: _id,
        hackathonTitle: title,
        reason: reason,
        cancelledAt: new Date().toISOString(),
      });
      operationTracker.addStep("NOTIFICATION", "sent", {
        channel: "websocket",
      });
    }

    const result = {
      success: true,
      hackathonId: _id,
      hackathonTitle: title,
      participantsCleared: participants?.length || 0,
      teamsDeleted: teamsDeleted.deletedCount || 0,
      teamMembersDeleted,
      reason: reason,
    };

    operationTracker.setResult(result);
    return result;
  } catch (error) {
    await session.abortTransaction();
    operationTracker.addStep("TRANSACTION", "aborted");

    const classifiedError = classifyError(error, OperationSteps.CANCELLATION);
    operationTracker.addStep(
      OperationSteps.CANCELLATION,
      "failed",
      classifiedError.toResponse()
    );

    logger.error(`Failed to cancel hackathon ${hackathon.title}:`, error);
    throw classifiedError;
  } finally {
    session.endSession();
  }
};

// Enhanced team creation logic with comprehensive tracking
const createTeamsForHackathon = async (hackathon, io, tracker = null) => {
  const session = await mongoose.startSession();
  const operationTracker =
    tracker ||
    new OperationTracker("createTeamsForHackathon", hackathon._id.toString());
  let transactionCommitted = false;

  try {
    operationTracker.addStep("SESSION", "started");
    await session.startTransaction();

    const {
      participants,
      maxTeamSize,
      problemStatements,
      minParticipantsToFormTeam,
      _id,
      title,
    } = hackathon;

    // Enhanced validation checks with detailed tracking
    operationTracker.addStep(OperationSteps.VALIDATION, "started");

    if (!participants || participants.length === 0) {
      const errorMsg = `No participants registered for hackathon: ${title}`;
      operationTracker.addStep(OperationSteps.VALIDATION, "failed", {
        error: errorMsg,
      });
      throw new SchedulerError(
        errorMsg,
        ErrorTypes.BUSINESS,
        "NO_PARTICIPANTS",
        false,
        OperationSteps.VALIDATION
      );
    }

    if (!problemStatements || problemStatements.length === 0) {
      const errorMsg = `No problem statements defined for hackathon: ${title}`;
      operationTracker.addStep(OperationSteps.VALIDATION, "failed", {
        error: errorMsg,
      });
      throw new SchedulerError(
        errorMsg,
        ErrorTypes.BUSINESS,
        "NO_PROBLEM_STATEMENTS",
        false,
        OperationSteps.VALIDATION
      );
    }

    if (participants.length < minParticipantsToFormTeam) {
      const errorMsg = `Not enough participants to form teams. Need at least ${minParticipantsToFormTeam}, have ${participants.length}`;
      operationTracker.addStep(OperationSteps.VALIDATION, "failed", {
        error: errorMsg,
        required: minParticipantsToFormTeam,
        available: participants.length,
      });
      throw new SchedulerError(
        errorMsg,
        ErrorTypes.BUSINESS,
        "INSUFFICIENT_PARTICIPANTS",
        false,
        OperationSteps.VALIDATION
      );
    }

    // Check if hackathon has already started
    const now = new Date();
    if (hackathon.startDate <= now) {
      const errorMsg = `Hackathon ${title} has already started. Cannot form teams.`;
      operationTracker.addStep(OperationSteps.VALIDATION, "failed", {
        error: errorMsg,
        startDate: hackathon.startDate,
        currentTime: now,
      });
      throw new SchedulerError(
        errorMsg,
        ErrorTypes.BUSINESS,
        "HACKATHON_STARTED",
        false,
        OperationSteps.VALIDATION
      );
    }

    operationTracker.addStep(OperationSteps.VALIDATION, "completed", {
      participantCount: participants.length,
      problemStatementCount: problemStatements.length,
      minParticipantsToFormTeam,
      maxTeamSize,
    });

    // Calculate optimal team distribution
    operationTracker.addStep(OperationSteps.TEAM_FORMATION, "started");
    const totalParticipants = participants.length;
    const optimalTeamCount = Math.ceil(totalParticipants / maxTeamSize);
    const baseTeamSize = Math.floor(totalParticipants / optimalTeamCount);
    const remainder = totalParticipants % optimalTeamCount;

    operationTracker.addStep(OperationSteps.TEAM_FORMATION, "completed", {
      totalParticipants,
      optimalTeamCount,
      baseTeamSize,
      remainder,
      minParticipantsToFormTeam,
      maxTeamSize,
    });

    logger.info(`Creating teams for hackathon: ${title}`, {
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
    const emailResults = {
      successful: [],
      failed: [],
    };
    let participantIndex = 0;

    operationTracker.addStep(OperationSteps.TEAM_CREATION, "started");

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

      operationTracker.addStep(
        OperationSteps.TEAM_MEMBER_ASSIGNMENT,
        "started",
        {
          teamIndex: teamIndex + 1,
          teamName,
          teamSize: currentTeamSize,
          problemStatement: randomProblem,
        }
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
      operationTracker.addStep(
        OperationSteps.TEAM_MEMBER_ASSIGNMENT,
        "completed",
        {
          teamIndex: teamIndex + 1,
          membersAssigned: teamMembers.length,
        }
      );

      // Populate team details
      const populatedTeam = await Team.findById(team[0]._id)
        .populate({
          path: "teamMember",
          select: "id name email skills",
        })       
        .session(session);

      createdTeams.push(populatedTeam);

      // Prepare email notifications (outside transaction)
      operationTracker.addStep(OperationSteps.EMAIL_NOTIFICATION, "preparing", {
        teamIndex: teamIndex + 1,
        membersToNotify: teamMembers.length,
      });

      for (const memberId of teamMembers) {
        const user = await User.findById(memberId).session(session);
        if (!user) continue;

        // Get all teammate names (excluding current user)
        const teammatePromises = teamMembers
          .filter((mId) => mId.toString() !== memberId.toString())
          .map(async (mId) => {
            const teammate = await User.findById(mId).session(session);
            return teammate ? teammate.name : "Teammate";
          });

        const teammateNames = await Promise.all(teammatePromises);

        // Include current user as first in the list (typically team lead)
        const allTeamMembers = [user.name, ...teammateNames];

        emailPromises.push(
          sendTeamNotification({
            email: user.email,
            name: user.name,
            hackathonTitle: title,
            teammates: allTeamMembers, // This will show current user as first (team lead)
            problemStatement: randomProblem,
            teamName: teamName,
          })
            .then(() => {
              emailResults.successful.push({
                email: user.email,
                name: user.name,
                teamName,
              });
              return { success: true, email: user.email };
            })
            .catch((emailError) => {
              const errorDetails = {
                email: user.email,
                name: user.name,
                teamName,
                error: emailError.message,
              };
              emailResults.failed.push(errorDetails);
              logger.error(
                `Failed to send email to ${user.email}:`,
                emailError
              );
              return { success: false, ...errorDetails };
            })
        );
      }
    }

    operationTracker.addStep(OperationSteps.TEAM_CREATION, "completed", {
      teamsCreated: createdTeams.length,
      totalParticipantsAssigned: participantIndex,
    });

    // Update hackathon status
    operationTracker.addStep(OperationSteps.HACKATHON_STATUS_UPDATE, "started");
    await Hackathon.findByIdAndUpdate(
      _id,
      {
        $set: {
          status: "registration_closed",
          teamsFormedAt: new Date(),
        },
      },
      { session }
    );
    operationTracker.addStep(
      OperationSteps.HACKATHON_STATUS_UPDATE,
      "completed"
    );

    await session.commitTransaction();
    transactionCommitted = true;
    operationTracker.addStep("TRANSACTION", "committed");

    logger.info(`Transaction committed successfully for hackathon: ${title}`);

    // Send emails outside transaction
    if (emailPromises.length > 0) {
      operationTracker.addStep(OperationSteps.EMAIL_NOTIFICATION, "sending", {
        totalEmails: emailPromises.length,
      });

      const emailSettledResults = await Promise.allSettled(emailPromises);
      const fulfilledResults = emailSettledResults
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value);

      const successfulEmails = fulfilledResults.filter((r) => r.success).length;
      const failedEmails = fulfilledResults.filter((r) => !r.success).length;

      operationTracker.addStep(OperationSteps.EMAIL_NOTIFICATION, "completed", {
        successful: successfulEmails,
        failed: failedEmails,
        details: {
          successful: emailResults.successful,
          failed: emailResults.failed,
        },
      });

      logger.info(
        `Emails sent: ${successfulEmails} successful, ${failedEmails} failed`
      );

      if (failedEmails > 0) {
        operationTracker.addStep(OperationSteps.EMAIL_NOTIFICATION, "warning", {
          message: `${failedEmails} emails failed to send`,
          failedEmails: emailResults.failed.map((f) => ({
            email: f.email,
            error: f.error,
          })),
        });
      }
    }

    logger.info(
      `Successfully created ${createdTeams.length} teams for ${title}`
    );

    const result = {
      success: true,
      teamsCreated: createdTeams.length,
      hackathonId: _id,
      hackathonTitle: title,
      teams: createdTeams,
      emailSummary: {
        successful: emailResults.successful.length,
        failed: emailResults.failed.length,
        details: emailResults,
      },
      participantDistribution: {
        totalParticipants,
        teamsFormed: createdTeams.length,
        participantsAssigned: participantIndex,
      },
    };

    operationTracker.setResult(result);
    return result;
  } catch (error) {
    // Only abort transaction if it hasn't been committed
    if (!transactionCommitted) {
      try {
        await session.abortTransaction();
        operationTracker.addStep("TRANSACTION", "aborted");
      } catch (abortError) {
        logger.warn(`Error aborting transaction: ${abortError.message}`);
        operationTracker.addStep("TRANSACTION", "abort_failed", {
          error: abortError.message,
        });
      }
    }

    const classifiedError = classifyError(
      error,
      operationTracker.steps[operationTracker.steps.length - 1]?.step
    );
    operationTracker.addStep(
      classifiedError.step || "UNKNOWN",
      "failed",
      classifiedError.toResponse()
    );

    // If team formation fails due to business rules and hackathon hasn't started, cancel it
    const now = new Date();
    if (
      hackathon.startDate > now &&
      classifiedError.type === ErrorTypes.BUSINESS
    ) {
      logger.warn(
        `Team formation failed for hackathon ${hackathon.title} due to business rules, cancelling hackathon: ${classifiedError.message}`
      );
      try {
        operationTracker.addStep(OperationSteps.CANCELLATION, "triggered", {
          reason: `Team formation failed: ${classifiedError.message}`,
        });

        // Use a separate session for cancellation
        const cancellationResult = await cancelHackathon(
          hackathon,
          `Team formation failed: ${classifiedError.message}`,
          io,
          operationTracker
        );

        // Return a success result for cancellation case instead of throwing error
        const result = {
          success: true,
          teamsCreated: 0,
          hackathonId: hackathon._id,
          hackathonTitle: hackathon.title,
          cancelled: true,
          reason: classifiedError.message,
          cancellationDetails: cancellationResult,
        };

        operationTracker.setResult(result);
        return result;
      } catch (cancelError) {
        logger.error(
          `Failed to cancel hackathon after team formation failure:`,
          cancelError
        );
        operationTracker.addStep(OperationSteps.CANCELLATION, "failed", {
          error: cancelError.message,
        });
        // Re-throw the original business error, not the cancellation error
        throw classifiedError;
      }
    } else if (classifiedError.type === ErrorTypes.FATAL) {
      logger.error(
        `Fatal error during team formation for hackathon ${hackathon.title}:`,
        classifiedError
      );
    }

    throw classifiedError;
  } finally {
    try {
      session.endSession();
      operationTracker.addStep("SESSION", "ended");
    } catch (sessionError) {
      logger.warn(`Error ending session: ${sessionError.message}`);
      operationTracker.addStep("SESSION", "end_failed", {
        error: sessionError.message,
      });
    }
  }
};

// Enhanced manual team formation API with comprehensive response
export const manualTeamFormation = async (req, res) => {
  const tracker = new OperationTracker(
    "manualTeamFormation",
    req.params.hackathonId
  );

  try {
    const { hackathonId } = req.params;
    const io = req.app.get("io");

    tracker.addStep("REQUEST_RECEIVED", "started", {
      hackathonId,
      timestamp: new Date().toISOString(),
    });

    logger.info(
      `Manual team formation requested for hackathon: ${hackathonId}`
    );

    // Find the hackathon
    tracker.addStep("HACKATHON_FETCH", "started");
    const hackathon = await Hackathon.findById(hackathonId).populate({
      path: "participants",
      select: "name email skills",
    });

    if (!hackathon) {
      tracker.addStep("HACKATHON_FETCH", "failed", {
        error: "Hackathon not found",
      });
      return res.status(404).json({
        success: false,
        error: "Hackathon not found",
        hackathonId,
        operation: tracker.toResponse(),
      });
    }
    tracker.addStep("HACKATHON_FETCH", "completed", {
      hackathonTitle: hackathon.title,
      participantCount: hackathon.participants?.length || 0,
    });

    // Validate hackathon status
    tracker.addStep("STATUS_VALIDATION", "started");
    if (hackathon.status !== "registration_closed") {
      tracker.addStep("STATUS_VALIDATION", "failed", {
        error: `Invalid status: ${hackathon.status}`,
        currentStatus: hackathon.status,
        requiredStatus: "registration_closed",
      });
      return res.status(400).json({
        success: false,
        error: `Hackathon status is '${hackathon.status}'. Team formation can only be performed when status is 'registration_closed'`,
        currentStatus: hackathon.status,
        hackathonId,
        operation: tracker.toResponse(),
      });
    }

    // Check if registration deadline has passed
    const now = new Date();
    if (hackathon.registrationDeadline > now) {
      tracker.addStep("DEADLINE_VALIDATION", "failed", {
        error: "Registration deadline not passed",
        registrationDeadline: hackathon.registrationDeadline,
        currentTime: now,
      });
      return res.status(400).json({
        success: false,
        error: "Registration deadline has not passed yet",
        registrationDeadline: hackathon.registrationDeadline,
        currentTime: now,
        hackathonId,
        operation: tracker.toResponse(),
      });
    }

    // Check if hackathon has already started
    if (hackathon.startDate <= now) {
      tracker.addStep("START_DATE_VALIDATION", "failed", {
        error: "Hackathon already started",
        startDate: hackathon.startDate,
        currentTime: now,
      });
      return res.status(400).json({
        success: false,
        error: "Hackathon has already started. Cannot form teams.",
        startDate: hackathon.startDate,
        currentTime: now,
        hackathonId,
        operation: tracker.toResponse(),
      });
    }
    tracker.addStep("VALIDATION", "completed");

    // Perform team formation with retry mechanism
    tracker.addStep("TEAM_FORMATION_PROCESS", "started");
    const result = await retryOperation(
      () => createTeamsForHackathon(hackathon, io, tracker),
      "createTeamsForHackathon",
      3,
      500
    );

    tracker.setResult(result);
    tracker.addStep("TEAM_FORMATION_PROCESS", "completed");

    logger.info(
      `Manual team formation completed successfully for hackathon: ${hackathon.title}`,
      result
    );

    res.json({
      success: true,
      message: "Team formation completed successfully",
      ...result,
      operation: tracker.toResponse(),
    });
  } catch (error) {
    tracker.addStep(
      "OPERATION",
      "failed",
      error.toResponse ? error.toResponse() : { message: error.message }
    );
    tracker.setResult({ success: false, error: error.message });

    logger.error(`Manual team formation failed:`, error);

    const statusCode = error.type === ErrorTypes.BUSINESS ? 400 : 500;

    res.status(statusCode).json({
      success: false,
      error: error.message,
      errorType: error.type,
      errorCode: error.code,
      errorDetails: error.details,
      stepFailed: error.step,
      hackathonId: tracker.hackathonId,
      operation: tracker.toResponse(),
    });
  }
};
// Enhanced completeHackathon function
const completeHackathon = async (hackathon, io, tracker = null) => {
  const session = await mongoose.startSession();
  const operationTracker =
    tracker ||
    new OperationTracker("completeHackathon", hackathon._id.toString());

  try {
    operationTracker.addStep("SESSION", "started");
    await session.startTransaction();

    const { _id, title, status, participants } = hackathon;

    operationTracker.addStep(OperationSteps.VALIDATION, "started", {
      hackathonTitle: title,
      currentStatus: status,
      participantCount: participants?.length || 0,
    });

    logger.info(`Completing hackathon: ${title}`, {
      hackathonId: _id,
      currentStatus: status,
    });

    operationTracker.addStep(OperationSteps.VALIDATION, "completed");

    // Update hackathon status to completed
    operationTracker.addStep(OperationSteps.HACKATHON_STATUS_UPDATE, "started");
    await Hackathon.findByIdAndUpdate(
      _id,
      {
        $set: {
          status: "completed",
          isActive: false,
          completedAt: new Date(),
        },
      },
      { session }
    );
    operationTracker.addStep(
      OperationSteps.HACKATHON_STATUS_UPDATE,
      "completed"
    );

    // Find all teams for this hackathon
    operationTracker.addStep("TEAM_FETCH", "started");
    const teams = await Team.find({ hackathonId: _id }).session(session);
    operationTracker.addStep("TEAM_FETCH", "completed", {
      teamsFound: teams.length,
    });

    logger.info(
      `Found ${teams.length} teams to process for hackathon: ${title}`
    );

    // Update team statuses to completed
    operationTracker.addStep("TEAM_STATUS_UPDATE", "started");
    const teamUpdatePromises = teams.map((team) =>
      Team.findByIdAndUpdate(
        team._id,
        {
          $set: {
            status: "completed",
            completedAt: new Date(),
          },
        },
        { session }
      )
    );

    // Clear currentHackathonId for all participants
    operationTracker.addStep(OperationSteps.USER_UPDATE, "started");
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
    operationTracker.addStep("TEAM_STATUS_UPDATE", "completed", {
      teamsUpdated: teams.length,
    });
    operationTracker.addStep(OperationSteps.USER_UPDATE, "completed", {
      participantsUpdated: participants.length,
    });

    await session.commitTransaction();
    operationTracker.addStep("TRANSACTION", "committed");

    logger.info(`Successfully completed hackathon: ${title}`);

    // Notify clients about hackathon completion
    if (io) {
      io.to(_id.toString()).emit("hackathon-completed", {
        hackathonId: _id,
        hackathonTitle: title,
        completedAt: new Date().toISOString(),
        teamsCompleted: teams.length,
        participantsUpdated: participants.length,
      });
      operationTracker.addStep("NOTIFICATION", "sent", {
        channel: "websocket",
      });
    }

    const result = {
      success: true,
      hackathonId: _id,
      hackathonTitle: title,
      teamsProcessed: teams.length,
      participantsProcessed: participants.length,
      previousStatus: status,
      newStatus: "completed",
    };

    operationTracker.setResult(result);
    return result;
  } catch (error) {
    await session.abortTransaction();
    operationTracker.addStep("TRANSACTION", "aborted");

    const classifiedError = classifyError(error, "HACKATHON_COMPLETION");
    operationTracker.addStep(
      "COMPLETION",
      "failed",
      classifiedError.toResponse()
    );

    logger.error(`Failed to complete hackathon ${hackathon.title}:`, error);
    throw classifiedError;
  } finally {
    session.endSession();
    operationTracker.addStep("SESSION", "ended");
  }
};

// Enhanced manualHackathonCompletion API
export const manualHackathonCompletion = async (req, res) => {
  const tracker = new OperationTracker(
    "manualHackathonCompletion",
    req.params.hackathonId
  );

  try {
    const { hackathonId } = req.params;
    const io = req.app.get("io");

    tracker.addStep("REQUEST_RECEIVED", "started", {
      hackathonId,
      timestamp: new Date().toISOString(),
    });

    logger.info(`Manual hackathon completion requested for: ${hackathonId}`);

    // Find the hackathon
    tracker.addStep("HACKATHON_FETCH", "started");
    const hackathon = await Hackathon.findById(hackathonId);

    if (!hackathon) {
      tracker.addStep("HACKATHON_FETCH", "failed", {
        error: "Hackathon not found",
      });
      return res.status(404).json({
        success: false,
        error: "Hackathon not found",
        hackathonId,
        operation: tracker.toResponse(),
      });
    }
    tracker.addStep("HACKATHON_FETCH", "completed", {
      hackathonTitle: hackathon.title,
      currentStatus: hackathon.status,
      isActive: hackathon.isActive,
    });

    // Enhanced validation checks
    tracker.addStep("VALIDATION", "started");
    const now = new Date();

    if (hackathon.endDate > now) {
      tracker.addStep("VALIDATION", "failed", {
        error: "Hackathon end date not passed",
        endDate: hackathon.endDate,
        currentTime: now,
      });
      return res.status(400).json({
        success: false,
        error: "Hackathon end date has not passed yet",
        endDate: hackathon.endDate,
        currentTime: now,
        hackathonId,
        operation: tracker.toResponse(),
      });
    }

    if (hackathon.status === "completed") {
      tracker.addStep("VALIDATION", "failed", {
        error: "Hackathon already completed",
        currentStatus: hackathon.status,
      });
      return res.status(400).json({
        success: false,
        error: "Hackathon is already completed",
        currentStatus: hackathon.status,
        hackathonId,
        operation: tracker.toResponse(),
      });
    }

    if (!hackathon.isActive) {
      tracker.addStep("VALIDATION", "failed", {
        error: "Hackathon not active",
        isActive: hackathon.isActive,
      });
      return res.status(400).json({
        success: false,
        error: "Hackathon is not active",
        isActive: hackathon.isActive,
        hackathonId,
        operation: tracker.toResponse(),
      });
    }

    if (hackathon.status === "cancelled") {
      tracker.addStep("VALIDATION", "failed", {
        error: "Hackathon is cancelled",
        currentStatus: hackathon.status,
      });
      return res.status(400).json({
        success: false,
        error: "Cannot complete a cancelled hackathon",
        currentStatus: hackathon.status,
        hackathonId,
        operation: tracker.toResponse(),
      });
    }
    tracker.addStep("VALIDATION", "completed");

    // Perform hackathon completion with retry mechanism
    tracker.addStep("COMPLETION_PROCESS", "started");
    const result = await retryOperation(
      () => completeHackathon(hackathon, io, tracker),
      "completeHackathon",
      3,
      500
    );

    tracker.setResult(result);
    tracker.addStep("COMPLETION_PROCESS", "completed");

    logger.info(
      `Manual hackathon completion successful for: ${hackathon.title}`,
      result
    );

    res.json({
      success: true,
      message: "Hackathon completed successfully",
      ...result,
      operation: tracker.toResponse(),
    });
  } catch (error) {
    tracker.addStep(
      "OPERATION",
      "failed",
      error.toResponse ? error.toResponse() : { message: error.message }
    );
    tracker.setResult({ success: false, error: error.message });

    logger.error(`Manual hackathon completion failed:`, error);

    const statusCode = error.type === ErrorTypes.BUSINESS ? 400 : 500;

    res.status(statusCode).json({
      success: false,
      error: error.message,
      errorType: error.type,
      errorCode: error.code,
      errorDetails: error.details,
      stepFailed: error.step,
      hackathonId: tracker.hackathonId,
      operation: tracker.toResponse(),
    });
  }
};

// Enhanced manualHackathonCancellation API
export const manualHackathonCancellation = async (req, res) => {
  const tracker = new OperationTracker(
    "manualHackathonCancellation",
    req.params.hackathonId
  );

  try {
    const { hackathonId } = req.params;
    const { reason = "Administrative decision" } = req.body;
    const io = req.app.get("io");

    tracker.addStep("REQUEST_RECEIVED", "started", {
      hackathonId,
      reason,
      timestamp: new Date().toISOString(),
    });

    logger.info(`Manual hackathon cancellation requested for: ${hackathonId}`, {
      reason,
    });

    // Find the hackathon
    tracker.addStep("HACKATHON_FETCH", "started");
    const hackathon = await Hackathon.findById(hackathonId);

    if (!hackathon) {
      tracker.addStep("HACKATHON_FETCH", "failed", {
        error: "Hackathon not found",
      });
      return res.status(404).json({
        success: false,
        error: "Hackathon not found",
        hackathonId,
        operation: tracker.toResponse(),
      });
    }
    tracker.addStep("HACKATHON_FETCH", "completed", {
      hackathonTitle: hackathon.title,
      currentStatus: hackathon.status,
      isActive: hackathon.isActive,
    });

    // Enhanced validation checks
    tracker.addStep("VALIDATION", "started");

    if (hackathon.status === "completed") {
      tracker.addStep("VALIDATION", "failed", {
        error: "Hackathon already completed",
        currentStatus: hackathon.status,
      });
      return res.status(400).json({
        success: false,
        error: "Cannot cancel already completed hackathon",
        currentStatus: hackathon.status,
        hackathonId,
        operation: tracker.toResponse(),
      });
    }

    if (hackathon.status === "cancelled") {
      tracker.addStep("VALIDATION", "failed", {
        error: "Hackathon already cancelled",
        currentStatus: hackathon.status,
      });
      return res.status(400).json({
        success: false,
        error: "Hackathon is already cancelled",
        currentStatus: hackathon.status,
        hackathonId,
        operation: tracker.toResponse(),
      });
    }

    if (!hackathon.isActive) {
      tracker.addStep("VALIDATION", "failed", {
        error: "Hackathon not active",
        isActive: hackathon.isActive,
      });
      return res.status(400).json({
        success: false,
        error: "Hackathon is not active and cannot be cancelled",
        isActive: hackathon.isActive,
        hackathonId,
        operation: tracker.toResponse(),
      });
    }
    tracker.addStep("VALIDATION", "completed");

    // Perform hackathon cancellation
    tracker.addStep("CANCELLATION_PROCESS", "started");
    const result = await cancelHackathon(hackathon, reason, io, tracker);

    tracker.setResult(result);
    tracker.addStep("CANCELLATION_PROCESS", "completed");

    logger.info(
      `Manual hackathon cancellation successful for: ${hackathon.title}`,
      result
    );

    res.json({
      success: true,
      message: "Hackathon cancelled successfully",
      ...result,
      operation: tracker.toResponse(),
    });
  } catch (error) {
    tracker.addStep(
      "OPERATION",
      "failed",
      error.toResponse ? error.toResponse() : { message: error.message }
    );
    tracker.setResult({ success: false, error: error.message });

    logger.error(`Manual hackathon cancellation failed:`, error);

    const statusCode = error.type === ErrorTypes.BUSINESS ? 400 : 500;

    res.status(statusCode).json({
      success: false,
      error: error.message,
      errorType: error.type,
      errorCode: error.code,
      errorDetails: error.details,
      stepFailed: error.step,
      hackathonId: tracker.hackathonId,
      operation: tracker.toResponse(),
    });
  }
};

// Enhanced manualStatusUpdate API
export const manualStatusUpdate = async (req, res) => {
  const tracker = new OperationTracker("manualStatusUpdate", "system-wide");

  try {
    tracker.addStep("REQUEST_RECEIVED", "started", {
      timestamp: new Date().toISOString(),
    });

    logger.info("Manual hackathon status update requested");

    const now = new Date();
    const updateResults = {
      ongoing: { matched: 0, updated: 0 },
      winner: { matched: 0, updated: 0 },
      completed: { matched: 0, updated: 0 },
    };

    tracker.addStep("STATUS_UPDATE", "started", { currentTime: now });

    // Update hackathons that should be in "ongoing" status
    tracker.addStep("ONGOING_UPDATE", "started");
    const ongoingResult = await Hackathon.updateMany(
      {
        startDate: { $lte: now },
        endDate: { $gt: now },
        status: "registration_closed",
        isActive: true,
      },
      {
        $set: { status: "ongoing" },
      }
    );
    updateResults.ongoing = {
      matched: ongoingResult.matchedCount,
      updated: ongoingResult.modifiedCount,
    };
    tracker.addStep("ONGOING_UPDATE", "completed", updateResults.ongoing);

    // Update hackathons that should be in "winner_to_announced" status
    tracker.addStep("WINNER_UPDATE", "started");
    const winnerResult = await Hackathon.updateMany(
      {
        endDate: { $lte: now },
        winnerAnnouncementDate: { $gt: now },
        status: "ongoing",
        isActive: true,
      },
      {
        $set: { status: "winner_to_announced" },
      }
    );
    updateResults.winner = {
      matched: winnerResult.matchedCount,
      updated: winnerResult.modifiedCount,
    };
    tracker.addStep("WINNER_UPDATE", "completed", updateResults.winner);

    // Update hackathons that should be in "completed" status (past winner announcement)
    tracker.addStep("COMPLETED_UPDATE", "started");
    const completedResult = await Hackathon.updateMany(
      {
        winnerAnnouncementDate: { $lte: now },
        status: { $in: ["ongoing", "winner_to_announced"] },
        isActive: true,
      },
      {
        $set: {
          status: "completed",
          isActive: false,
          completedAt: now,
        },
      }
    );
    updateResults.completed = {
      matched: completedResult.matchedCount,
      updated: completedResult.modifiedCount,
    };
    tracker.addStep("COMPLETED_UPDATE", "completed", updateResults.completed);

    tracker.addStep("STATUS_UPDATE", "completed");
    tracker.setResult(updateResults);

    logger.info("Manual hackathon status update completed", updateResults);

    res.json({
      success: true,
      message: "Hackathon statuses updated successfully",
      ...updateResults,
      operation: tracker.toResponse(),
    });
  } catch (error) {
    tracker.addStep(
      "OPERATION",
      "failed",
      error.toResponse ? error.toResponse() : { message: error.message }
    );
    tracker.setResult({ success: false, error: error.message });

    logger.error("Manual hackathon status update failed:", error);

    res.status(500).json({
      success: false,
      error: error.message,
      errorType: error.type,
      errorCode: error.code,
      errorDetails: error.details,
      stepFailed: error.step,
      operation: tracker.toResponse(),
    });
  }
};

// Enhanced getHackathonStatus API
export const getHackathonStatus = async (req, res) => {
  const tracker = new OperationTracker(
    "getHackathonStatus",
    req.params.hackathonId
  );

  try {
    const { hackathonId } = req.params;

    tracker.addStep("REQUEST_RECEIVED", "started", {
      hackathonId,
      timestamp: new Date().toISOString(),
    });

    tracker.addStep("HACKATHON_FETCH", "started");
    const hackathon = await Hackathon.findById(hackathonId)
      .select(
        "title status isActive startDate endDate registrationDeadline participants problemStatements minParticipantsToFormTeam maxTeamSize teamsFormedAt"
      )
      .populate("participants", "name email")
      .lean();

    if (!hackathon) {
      tracker.addStep("HACKATHON_FETCH", "failed", {
        error: "Hackathon not found",
      });
      return res.status(404).json({
        success: false,
        error: "Hackathon not found",
        hackathonId,
        operation: tracker.toResponse(),
      });
    }
    tracker.addStep("HACKATHON_FETCH", "completed", {
      hackathonTitle: hackathon.title,
      currentStatus: hackathon.status,
    });

    const now = new Date();
    const statusInfo = {
      ...hackathon,
      currentTime: now,
      validation: {
        canFormTeams:
          hackathon.status === "registration_closed" &&
          hackathon.registrationDeadline <= now &&
          hackathon.startDate > now &&
          hackathon.participants.length >=
            (hackathon.minParticipantsToFormTeam || 1),
        canComplete:
          hackathon.isActive &&
          hackathon.endDate <= now &&
          hackathon.status !== "completed" &&
          hackathon.status !== "cancelled",
        canCancel:
          hackathon.isActive &&
          hackathon.status !== "completed" &&
          hackathon.status !== "cancelled",
        isRegistrationOpen:
          hackathon.status === "registration_closed" &&
          hackathon.registrationDeadline > now,
        isOngoing: hackathon.status === "ongoing",
        isCompleted: hackathon.status === "completed",
        isCancelled: hackathon.status === "cancelled",
      },
      teamFormation: {
        participantsCount: hackathon.participants?.length || 0,
        minRequired: hackathon.minParticipantsToFormTeam || 1,
        maxTeamSize: hackathon.maxTeamSize || 4,
        teamsFormedAt: hackathon.teamsFormedAt,
        meetsMinimumRequirements:
          hackathon.participants?.length >=
          (hackathon.minParticipantsToFormTeam || 1),
      },
      timing: {
        registrationDeadline: hackathon.registrationDeadline,
        registrationDeadlinePassed: hackathon.registrationDeadline <= now,
        startDate: hackathon.startDate,
        started: hackathon.startDate <= now,
        endDate: hackathon.endDate,
        ended: hackathon.endDate <= now,
      },
    };

    tracker.setResult(statusInfo);
    tracker.addStep("STATUS_ANALYSIS", "completed");

    res.json({
      success: true,
      data: statusInfo,
      operation: tracker.toResponse(),
    });
  } catch (error) {
    tracker.addStep(
      "OPERATION",
      "failed",
      error.toResponse ? error.toResponse() : { message: error.message }
    );
    tracker.setResult({ success: false, error: error.message });

    logger.error("Error getting hackathon status:", error);

    res.status(500).json({
      success: false,
      error: error.message,
      errorType: error.type,
      errorCode: error.code,
      errorDetails: error.details,
      stepFailed: error.step,
      hackathonId: tracker.hackathonId,
      operation: tracker.toResponse(),
    });
  }
};

// New function to get detailed operation history for a hackathon
export const getHackathonOperationHistory = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    // In a real implementation, you would fetch this from an operations collection
    // For now, we'll return a mock response or implement based on your storage
    const operations = [
      {
        operation: "team_formation",
        status: "completed",
        timestamp: new Date().toISOString(),
        details: {
          teamsCreated: 5,
          participantsAssigned: 20,
          emailsSent: 20,
        },
      },
    ];

    res.json({
      success: true,
      data: {
        hackathonId,
        operations,
        summary: {
          totalOperations: operations.length,
          successful: operations.filter((op) => op.status === "completed")
            .length,
          failed: operations.filter((op) => op.status === "failed").length,
          lastOperation: operations[0] || null,
        },
      },
    });
  } catch (error) {
    logger.error("Error getting hackathon operation history:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// New function to retry failed operations
export const retryFailedOperation = async (req, res) => {
  const tracker = new OperationTracker(
    "retryFailedOperation",
    req.params.hackathonId
  );

  try {
    const { hackathonId, operationType } = req.params;
    const io = req.app.get("io");

    tracker.addStep("REQUEST_RECEIVED", "started", {
      hackathonId,
      operationType,
      timestamp: new Date().toISOString(),
    });

    logger.info(
      `Retry operation requested: ${operationType} for hackathon: ${hackathonId}`
    );

    // Find the hackathon
    tracker.addStep("HACKATHON_FETCH", "started");
    const hackathon = await Hackathon.findById(hackathonId);

    if (!hackathon) {
      tracker.addStep("HACKATHON_FETCH", "failed", {
        error: "Hackathon not found",
      });
      return res.status(404).json({
        success: false,
        error: "Hackathon not found",
        hackathonId,
        operation: tracker.toResponse(),
      });
    }
    tracker.addStep("HACKATHON_FETCH", "completed");

    let result;

    switch (operationType) {
      case "team_formation":
        tracker.addStep("OPERATION_RETRY", "started", {
          operation: "team_formation",
        });
        result = await retryOperation(
          () => createTeamsForHackathon(hackathon, io, tracker),
          "createTeamsForHackathon",
          3,
          500
        );
        break;

      case "completion":
        tracker.addStep("OPERATION_RETRY", "started", {
          operation: "completion",
        });
        result = await retryOperation(
          () => completeHackathon(hackathon, io, tracker),
          "completeHackathon",
          3,
          500
        );
        break;

      case "cancellation":
        tracker.addStep("OPERATION_RETRY", "started", {
          operation: "cancellation",
        });
        result = await cancelHackathon(
          hackathon,
          "Retry requested by admin",
          io,
          tracker
        );
        break;

      default:
        tracker.addStep("OPERATION_RETRY", "failed", {
          error: "Unknown operation type",
        });
        return res.status(400).json({
          success: false,
          error: `Unknown operation type: ${operationType}`,
          validOperations: ["team_formation", "completion", "cancellation"],
          operation: tracker.toResponse(),
        });
    }

    tracker.setResult(result);
    tracker.addStep("OPERATION_RETRY", "completed");

    res.json({
      success: true,
      message: `Operation ${operationType} retried successfully`,
      ...result,
      operation: tracker.toResponse(),
    });
  } catch (error) {
    tracker.addStep(
      "OPERATION",
      "failed",
      error.toResponse ? error.toResponse() : { message: error.message }
    );
    tracker.setResult({ success: false, error: error.message });

    logger.error(`Operation retry failed:`, error);

    const statusCode = error.type === ErrorTypes.BUSINESS ? 400 : 500;

    res.status(statusCode).json({
      success: false,
      error: error.message,
      errorType: error.type,
      errorCode: error.code,
      errorDetails: error.details,
      stepFailed: error.step,
      hackathonId: tracker.hackathonId,
      operation: tracker.toResponse(),
    });
  }
};

// Export all enhanced functions
// export {
//   ErrorTypes,
//   OperationSteps,
//   SchedulerError,
//   classifyError,
//   retryOperation,
//   OperationTracker,
//   createTeamsForHackathon,
//   completeHackathon,
//   cancelHackathon,
// };

export const getOperationStatus = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    // In a real implementation, you might store operations in database
    // For now, we'll return a mock status or you can implement proper tracking
    res.json({
      success: true,
      data: {
        hackathonId,
        lastOperation: null, // Would be fetched from database
        canFormTeams: true, // Your existing logic
        status: "unknown", // Would be determined from stored operations
      },
    });
  } catch (error) {
    logger.error("Error getting operation status:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Export for testing
// export {
//   ErrorTypes,
//   OperationSteps,
//   SchedulerError,
//   classifyError,
//   retryOperation,
//   OperationTracker,
//   createTeamsForHackathon,
//   // completeHackathon,
//   cancelHackathon,
// };

export {
  ErrorTypes,
  OperationSteps,
  SchedulerError,
  classifyError,
  retryOperation,
  OperationTracker,
  createTeamsForHackathon,
  completeHackathon,
  cancelHackathon,
};
