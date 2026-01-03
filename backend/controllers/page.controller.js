import mongoose from "mongoose";
import Hackathon from "../models/hackthon.model.js";
import User from "../models/user.model.js";
import Team from "../models/team.model.js";
import TeamMember from "../models/teamMember.model.js";
import Task from "../models/TeamtaskBoard.model.js";
import Message from "../models/Message.model.js";

// @desc    get all the page informastion based on the requriredment
// @route   get /api/page/unified-data
// @access  public with the token ..

export const getUnifiedData = async (req, res) => {
  try {
    const {
      hackathonId,
      userId,
      teamId,
      teamMemberId,
      // Flags to control what data to send
      hackathonSend = true,
      userSend = true,
      teamSend = true,
      teamMembersSend = true,
      tasksSend = true,
      participantsSend = false, // Don't send all participants by default
      discussionsSend = false, // Don't send discussions by default
      problemStatementsSend = false, // Don't send problem statements by default
    } = req.body;

    // Validate at least one ID is provided
    if (!hackathonId && !userId && !teamId && !teamMemberId) {
      return res.status(400).json({
        success: false,
        message:
          "At least one ID (hackathonId, userId, teamId, or teamMemberId) is required",
      });
    }

    // Validate ObjectId formats
    const validateObjectId = (id, fieldName) => {
      if (id && !mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid ${fieldName} format`);
      }
    };

    validateObjectId(hackathonId, "hackathonId");
    validateObjectId(userId, "userId");
    validateObjectId(teamId, "teamId");
    validateObjectId(teamMemberId, "teamMemberId");

    const result = {};

    // Get Hackathon data (only important fields for normal person)
    if (hackathonSend && hackathonId) {
      let hackathonQuery = Hackathon.findById(hackathonId);

      // Select only important fields for normal perspective
      const hackathonSelect = [
        "hackathonId",
        "hackName",
        "title",
        "description",
        "registrationDeadline",
        "startDate",
        "endDate",
        "isActive",
        "mode",
        "venue",
        "status",
        "bannerImage",
        "organizer",
        "tags",
        "maxTeamSize",
        "createdAt",
      ];

      hackathonQuery = hackathonQuery.select(hackathonSelect.join(" "));

      // Only populate participants if explicitly requested
      if (participantsSend) {
        hackathonQuery = hackathonQuery.populate(
          "participants",
          "name email profilePicture skills experience"
        );
      }

      const hackathon = await hackathonQuery.lean();

      if (hackathon) {
        // Remove sensitive/problematic data based on flags
        if (!problemStatementsSend && hackathon.problemStatements) {
          delete hackathon.problemStatements;
        }

        if (!discussionsSend && hackathon.discussions) {
          delete hackathon.discussions;
        }

        // Remove other sensitive fields that normal person doesn't need
        const fieldsToRemove = [
          "evaluationCriteria",
          "submissionDeadline",
          "submissionFormat",
          "faqs",
          "socialLinks",
          "requirements",
          "rules",
          "prizes",
          "registrationFee",
          "maxRegistrations",
          "minParticipantsToFormTeam",
          "winnerAnnouncementDate",
          "specialDetail",
          "extraDetail",
          "reason",
        ];

        fieldsToRemove.forEach((field) => {
          if (hackathon[field] !== undefined) {
            delete hackathon[field];
          }
        });

        result.hackathon = hackathon;
      } else {
        result.hackathon = null;
      }
    }

    // Get User data (sanitized - no password)
    if (userSend && userId) {
      const user = await User.findById(userId)
        .select("-password -resetPasswordToken -resetPasswordExpires")
        .lean();

      if (user) {
        // Only include important user fields for normal perspective
        const importantUserFields = {
          _id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
          skills: user.skills,
          experience: user.experience,
          github: user.github,
          linkedin: user.linkedin,
          bio: user.bio,
          collegeName: user.collegeName,
          isActive: user.isActive,
          createdAt: user.createdAt,
        };

        result.user = importantUserFields;
      } else {
        result.user = null;
      }
    }

    // Get Team data
    if (teamSend && teamId) {
      const team = await Team.findById(teamId)
        .populate("teamMember", "name email profilePicture skills experience")
        .populate("hackathonId", "hackName title startDate endDate")
        .lean();

      if (team) {
        // Only include important team fields
        const importantTeamFields = {
          _id: team._id,
          name: team.name,
          description: team.description,
          problemStatement: team.problemStatement,
          submissionStatus: team.submissionStatus,
          teamSize: team.teamSize,
          technologies: team.technologies,
          hackathonId: team.hackathonId,
          teamMember: team.teamMember,
          lastActivity: team.lastActivity,
          createdAt: team.createdAt,
        };

        result.team = importantTeamFields;
      } else {
        result.team = null;
      }
    }

    // Get Team Members data
    if (teamMembersSend && (teamId || teamMemberId)) {
      let teamMembersQuery = {};

      // if (teamId) {
      //   teamMembersQuery. = teamMemberId;
      // } else if (teamId) {
      //   teamMembersQuery.teamId = teamId;
      // }

      const teamMembers = await TeamMember.find({ teamId })
        .populate("userId", "name email profilePicture skills experience")
        .populate("teamId", "name description")
        .lean();

      if (teamMembers && teamMembers.length > 0) {
        // Only include important team member fields
        result.teamMembers = teamMembers.map((member) => ({
          _id: member._id,
          role: member.role,
          status: member.status,
          joinedAt: member.joinedAt,
          contributions: member.contributions,
          skills: member.skills,
          userId: member.userId,
          teamId: member.teamId,
        }));
      } else {
        result.teamMembers = null;
      }
    }

    // Get Tasks data
    if (tasksSend && (hackathonId || teamId || userId)) {
      const taskQuery = {};

      if (hackathonId) taskQuery.hackathonId = hackathonId;
      if (teamId) taskQuery.teamId = teamId;
      if (userId) taskQuery.assignedTo = userId;

      const tasks = await Task.find(taskQuery)
        .populate("assignedTo", "name email profilePicture")
        .populate("createdBy", "name email")
        .populate("teamId", "name")
        .lean();

      if (tasks && tasks.length > 0) {
        // Only include important task fields
        result.tasks = tasks.map((task) => ({
          _id: task._id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assignedTo: task.assignedTo,
          createdBy: task.createdBy,
          teamId: task.teamId,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        }));
      } else {
        result.tasks = null;
      }
    }

    // Get additional relationship data
    if (userId && hackathonId) {
      // Check if user is participating in this hackathon
      const userTeams = await Team.find({
        hackathonId,
        teamMember: userId,
      })
        .select("name description")
        .lean();

      result.userParticipation =
        userTeams.length > 0
          ? {
              isParticipating: true,
              teams: userTeams,
            }
          : {
              isParticipating: false,
              teams: null,
            };
    }

    // If user provided but no specific data requested, get basic participation info
    if (userId && !hackathonId && !teamId) {
      const userTeams = await TeamMember.find({ userId })
        .populate("teamId", "name description hackathonId")
        .populate({
          path: "teamId",
          populate: {
            path: "hackathonId",
            select: "hackName title startDate",
          },
        })
        .lean();

      result.userTeamsSummary =
        userTeams.length > 0
          ? userTeams.map((ut) => ({
              teamId: ut.teamId?._id,
              teamName: ut.teamId?.name,
              role: ut.role,
              hackathon: ut.teamId?.hackathonId,
            }))
          : null;
    }
    res.status(200).json({
      success: true,
      message: "Data retrieved successfully",
      data: result,
      requestedFlags: {
        hackathonRequested: hackathonSend,
        userRequested: userSend,
        teamRequested: teamSend,
        teamMembersRequested: teamMembersSend,
        tasksRequested: tasksSend,
        participantsRequested: participantsSend,
        discussionsRequested: discussionsSend,
        problemStatementsRequested: problemStatementsSend,
      },
    });
  } catch (error) {
    console.error("Error in getUnifiedData:", error);

    if (error.message.includes("Invalid") && error.message.includes("format")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};

export const teamChatPage = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).lean();
    let hackathonId = user?.currentHackathonId;
    if (!hackathonId) {
      return res.status(400).json({
        success: false,
        message: "User is not registered in any hackathon",
      });
    }

    const hackathon = await Hackathon.findById(hackathonId)
      .select("-participants")
      .lean();
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }
    hackathonId = hackathon._id;
    // DO THIS THINGS >>>>>>
    // if (hackathon.startDate > new Date() || hackathon.endDate < new Date()) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Hackathon is not active currently",
    //   });
    // }

    const team = await Team.findOne({
      hackathonId: hackathonId,
      teamMember: userId,
    })
      .populate({
        path: "hackathonId",
        select: "title description startDate endDate status rules prizes",
      })
      .populate({
        path: "teamMember",
        select:
          "name email profile phone lastLogin skills showProfileDetail experience",
      });
    if (!team) {
      return res.status(404).json({
        success: false,
        message:
          "No team found for this user in the specified hackathon or hackathon is not active currently",
      });
    }

    const { page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    // Validate pagination parameters
    if (pageNum < 1 || limitNum < 1) {
      return res.status(400).json({
        success: false,
        message: "Page and limit must be positive numbers",
      });
    }

    const messages = await Message.getTeamMessages(
      team._id,
      false,
      pageNum,
      limitNum
    );

    // Get total count for pagination info
    const totalMessages = await Message.countDocuments({
      teamId: team._id,
      isAdminMessage: false,
    });
    const totalPages = Math.ceil(totalMessages / limitNum);

    // messages = messages.reverse(); // To show latest messages at the bottom

    res.status(200).json({
      success: true,
      message: "Team chat page data retrieved successfully",
      data: {
        user,
        hackathon,
        team,
        messages: {
          messages: messages.reverse(), // Reverse to show oldest first
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalMessages,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error in teamChatPage:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
};
