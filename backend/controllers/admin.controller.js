// controllers/adminController.js
import PeopleJoined from "../models/peopleJoined.model.js";
import Hackathon from "../models/hackthon.model.js";
import Registration from "../models/Registration.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import Message from "../models/Message.model.js";
import Team from "../models/team.model.js";
// Get all participants for a specific hackathon
export const getHackathonParticipants = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    // Check if hackathonId is a valid ObjectId
    let hackathon;
    if (mongoose.Types.ObjectId.isValid(hackathonId)) {
      // Search by MongoDB _id
      hackathon = await Hackathon.findById(hackathonId);
    } else {
      // Otherwise, assume it’s your custom numeric/string hackathonId
      hackathon = await Hackathon.findOne({ hackathonId: hackathonId });
    }

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    // Get all participants safely
    const participants = await PeopleJoined.find({
      hackathonId: hackathon._id, // always use the ObjectId reference here
      //status: "joined",
    })
      .populate(
        "userId",
        "name email profilePicture skills experience github linkedin"
      )
      .populate(
        "registrationId",
        "paymentMethod amount isVerified paymentId utrNumber screenShot"
      )
      .sort({ joinedAt: -1 });

    // Stats
    const totalJoined = participants.filter(
      (p) => p.status === "joined" && p.registrationId?.paymentId
    ).length;
    const paidParticipants = participants.filter(
      (p) => p.registrationId?.paymentId
    ).length;
    const verifiedParticipants = participants.filter(
      (p) => p.registrationId?.isVerified
    ).length;

    const pendingVerification = await Registration.countDocuments({
      hackathonId: hackathonId,
      isVerified: false,
      status: "pending",
      isActive: true,
    });
    const stats = {
      totalJoined,
      paidParticipants,
      verifiedParticipants,
      pendingVerification: pendingVerification,
    };

    // Prepare hackathon details
    // const hackathonDetails = {
    //   _id: hackathon._id,
    //   hackathonId: hackathon.hackathonId,
    //   hackName: hackathon.hackName,
    //   title: hackathon.title,
    //   description: hackathon.description,
    //   startDate: hackathon.startDate,
    //   endDate: hackathon.endDate,
    //   mode: hackathon.mode,
    //   venue: hackathon.venue,
    //   maxTeamSize: hackathon.maxTeamSize,
    //   totalMembersJoined: hackathon.totalMembersJoined,
    //   status: hackathon.status,
    //   problemStatements: hackathon.problemStatements,
    //   prizes: hackathon.prizes,
    //   registrationFee: hackathon.registrationFee,
    // };

    res.status(200).json({
      success: true,
      hackathon: hackathon,
      participants,
      stats,
    });
  } catch (error) {
    console.error("Error fetching hackathon participants:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Make participant leave hackathon
export const makeParticipantLeave = async (req, res) => {
  try {
    const { participantId } = req.params;
    const { reason = "Left by admin" } = req.body;

    // Find the participant
    const participant = await PeopleJoined.findById(participantId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "Participant not found",
      });
    }

    // Update participant status to "removed"
    participant.status = "removed";
    participant.leftAt = new Date();
    await participant.save();

    // Update user's current hackathon
    await User.findByIdAndUpdate(participant.userId, {
      currentHackathonId: null,
    });

    // Update registration status
    await Registration.findByIdAndUpdate(participant.registrationId, {
      isJoined: false,
      status: "cancelled",
    });

    // Decrement hackathon total members count
    await Hackathon.findByIdAndUpdate(participant.hackathonId, {
      $inc: { totalMembersJoined: -1 },
      $pull: { participants: participant.userId },
    });

    res.status(200).json({
      success: true,
      message: "Participant has left the hackathon successfully",
    });
  } catch (error) {
    console.error("Error making participant leave:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get hackathon statistics
export const getHackathonStats = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    const totalParticipants = await PeopleJoined.countDocuments({
      hackathonId,
      status: "joined",
    });

    const paidParticipants = await PeopleJoined.countDocuments({
      hackathonId,
      status: "joined",
      paid: true,
    });

    const participantsWithSkills = await PeopleJoined.aggregate([
      {
        $match: {
          hackathonId: new mongoose.Types.ObjectId(hackathonId),
          status: "joined",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $unwind: "$user.skills",
      },
      {
        $group: {
          _id: "$user.skills",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const experienceLevels = await PeopleJoined.aggregate([
      {
        $match: {
          hackathonId: new mongoose.Types.ObjectId(hackathonId),
          status: "joined",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $group: {
          _id: "$user.experience",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalParticipants,
        paidParticipants,
        skillsBreakdown: participantsWithSkills,
        experienceLevels,
      },
    });
  } catch (error) {
    console.error("Error fetching hackathon stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//${API_URL}/admin/participants
// controllers/participantController.js

// Get all participants with filtering and search
export const getParticipants = async (req, res) => {
  try {
    const { hackathonId, search, page = 1, limit = 10 } = req.query;

    // Build filter object
    let filter = {};

    // Filter by hackathon ID if provided
    if (hackathonId && hackathonId !== "all") {
      filter.currentHackathonId = hackathonId;
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { skills: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const participants = await User.find(filter)
      .populate("currentHackathonId", "hackName title hackathonId")
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);
    const totalParticipants = await User.countDocuments();
    res.status(200).json({
      success: true,
      participants,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      totalParticipants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching participants",
      error: error.message,
    });
  }
};

// Get participant by ID
export const getParticipantById = async (req, res) => {
  try {
    const participant = await User.findById(req.params.id)
      .populate("currentHackathonId", "hackName title hackathonId")
      .select("-password -resetPasswordToken -resetPasswordExpires");

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "Participant not found",
      });
    }

    res.status(200).json({
      success: true,
      participant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching participant",
      error: error.message,
    });
  }
};

// Update participant
export const updateParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Remove fields that shouldn't be updated
    delete updateData.password;
    delete updateData.resetPasswordToken;
    delete updateData.resetPasswordExpires;
    delete updateData.role; // Prevent role changes through this endpoint

    const participant = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("currentHackathonId", "hackName title hackathonId")
      .select("-password -resetPasswordToken -resetPasswordExpires");

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "Participant not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Participant updated successfully",
      participant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating participant",
      error: error.message,
    });
  }
};

// Get all hackathons for filter dropdown
export const getHackathons = async (req, res) => {
  try {
    const hackathons = await Hackathon.find()
      .select("hackName title hackathonId _id")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      hackathons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching hackathons",
      error: error.message,
    });
  }
};

export const dashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalHackathons = await Hackathon.countDocuments();
    const totalRegistrations = await Registration.countDocuments();
    const totalParticipants = await PeopleJoined.countDocuments({
      status: "joined",
    });
    const totalMessages = await Message.countDocuments();
    const totalTeams = await Team.countDocuments();

    const hackathons = await Hackathon.find().sort({ createdAt: -1 }).limit(5);
    const totalMoney = await Registration.aggregate([
      {
        $match: { isVerified: true, isActive: true },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        numbers: {
          totalUsers,
          totalHackathons,
          totalRegistrations,
          totalParticipants,
          totalMessages,
          totalTeams,
          registration: {
            totalMoney,
            verfiedRegistration: await Registration.countDocuments({
              isVerified: true,
              isActive: true,
            }),
            unverifiedRegistration: await Registration.countDocuments({
              isVerified: false,
              isActive: true,
            }),
          },
        },
        hackathons: hackathons,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics",
      error: error.message,
    });
  }
};

export const getAllHackthons = async (req, res) => {
  try {
    const hackathons = await Hackathon.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      hackathons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching hackathons",
      error: error.message,
    });
  }
};

// export const getAllTeams = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       hackathonId,
//       submissionStatus,
//       isEligibleForPrize,
//       sortBy = "createdAt",
//       sortOrder = "desc",
//     } = req.query;

//     const query = {};

//     if (hackathonId) {
//       const hackathon = await Hackathon.findById(hackathonId);
//       if (!hackathon) {
//         return res.status(404).json({
//           success: false,
//           message: "Hackathon not found",
//         });
//       }
//       query.hackathonId = hackathon._id;
//     }
//     if (submissionStatus) query.submissionStatus = submissionStatus;
//     if (isEligibleForPrize !== undefined)
//       query.isEligibleForPrize = isEligibleForPrize === "true";

//     const options = {
//       page: parseInt(page),
//       limit: parseInt(limit),
//       sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 },
//       populate: [
//         {
//           path: "hackathonId",
//           select: "hackathonId title description startDate endDate",
//         },
//         { path: "teamMember", select: "name email" },
//       ],
//     };

//     const teams = await Team.find(query)
//       .populate(options.populate)
//       .sort(options.sort)
//       .limit(options.limit * 1)
//       .skip((options.page - 1) * options.limit);

//     const total = await Team.countDocuments(query);

//     res.status(200).json({
//       success: true,
//       data: teams,
//       pagination: {
//         current: options.page,
//         total: Math.ceil(total / options.limit),
//         count: teams.length,
//         totalRecords: total,
//       },
//     });
//   } catch (error) {
//     console.error("Get all teams error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// import Team from "../models/Team.js";
// import Hackathon from "../models/Hackathon.js";
// import User from "../models/User.js";

// Get all teams with filters
export const getAllTeams = async (req, res) => {
  try {
    const {
      hackathonId,
      submissionStatus,
      isEligibleForPrize,
      disqualified,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    // Build filter object
    const filter = {};

    if (hackathonId) filter.hackathonId = hackathonId;
    if (submissionStatus) filter.submissionStatus = submissionStatus;
    if (isEligibleForPrize !== undefined)
      filter.isEligibleForPrize = isEligibleForPrize === "true";
    if (disqualified !== undefined)
      filter.disqualified = disqualified === "true";

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { problemStatement: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const teams = await Team.find(filter)
      .populate("hackathonId", "title hackName")
      .populate("teamMember", "name email profilePicture")
      .populate("pastParticipants", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Team.countDocuments(filter);

    res.json({
      success: true,
      data: teams,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTeams: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching teams",
      error: error.message,
    });
  }
};

// Get single team by ID
export const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("hackathonId", "title hackName startDate endDate")
      .populate(
        "teamMember",
        "name email profilePicture skills experience github linkedin"
      )
      .populate("pastParticipants", "name email profilePicture");

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    res.json({
      success: true,
      data: team,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching team",
      error: error.message,
    });
  }
};

// Update team
export const updateTeam = async (req, res) => {
  try {
    const {
      name,
      description,
      problemStatement,
      projectRepo,
      projectDemo,
      projectPresentation,
      submissionStatus,
      score,
      rank,
      feedback,
      technologies,
      isEligibleForPrize,
      disqualified,
      disqualificationReason,
      communicationChannel,
    } = req.body;

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Update fields
    if (name) team.name = name;
    if (description !== undefined) team.description = description;
    if (problemStatement) team.problemStatement = problemStatement;
    if (projectRepo !== undefined) team.projectRepo = projectRepo;
    if (projectDemo !== undefined) team.projectDemo = projectDemo;
    if (projectPresentation !== undefined)
      team.projectPresentation = projectPresentation;
    if (submissionStatus) team.submissionStatus = submissionStatus;
    if (score !== undefined) team.score = score;
    if (rank !== undefined) team.rank = rank;
    if (feedback !== undefined) team.feedback = feedback;
    if (technologies !== undefined) team.technologies = technologies;
    if (isEligibleForPrize !== undefined)
      team.isEligibleForPrize = isEligibleForPrize;
    if (disqualified !== undefined) team.disqualified = disqualified;
    if (disqualificationReason !== undefined)
      team.disqualificationReason = disqualificationReason;
    if (communicationChannel !== undefined)
      team.communicationChannel = communicationChannel;

    // Handle submission timestamp
    if (
      submissionStatus === "submitted" &&
      team.submissionStatus !== "submitted"
    ) {
      team.submittedAt = new Date();
    }

    await team.save();

    const updatedTeam = await Team.findById(team._id)
      .populate("hackathonId", "title hackName")
      .populate("teamMember", "name email profilePicture")
      .populate("pastParticipants", "name email");

    res.json({
      success: true,
      message: "Team updated successfully",
      data: updatedTeam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating team",
      error: error.message,
    });
  }
};

// Remove member from team
export const removeTeamMember = async (req, res) => {
  try {
    const { teamId, userId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Check if user is in team
    const memberIndex = team.teamMember.indexOf(userId);
    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "User not found in team",
      });
    }

    // Remove from current members and add to past participants
    team.teamMember.splice(memberIndex, 1);
    team.pastParticipants.push(userId);
    team.teamSize = team.teamMember.length;

    await team.save();

    const updatedTeam = await Team.findById(teamId)
      .populate("hackathonId", "title hackName")
      .populate("teamMember", "name email profilePicture")
      .populate("pastParticipants", "name email");

    res.json({
      success: true,
      message: "Team member removed successfully",
      data: updatedTeam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing team member",
      error: error.message,
    });
  }
};

// Add member to team
export const addTeamMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is already in team
    if (team.teamMember.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "User is already in the team",
      });
    }

    // Check if user is in past participants
    const pastParticipantIndex = team.pastParticipants.indexOf(userId);
    if (pastParticipantIndex !== -1) {
      team.pastParticipants.splice(pastParticipantIndex, 1);
    }

    // Add to team
    team.teamMember.push(userId);
    team.teamSize = team.teamMember.length;

    await team.save();

    const updatedTeam = await Team.findById(teamId)
      .populate("hackathonId", "title hackName")
      .populate("teamMember", "name email profilePicture")
      .populate("pastParticipants", "name email");

    res.json({
      success: true,
      message: "Team member added successfully",
      data: updatedTeam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding team member",
      error: error.message,
    });
  }
};

// Search users for adding to team
export const searchUsers = async (req, res) => {
  try {
    const { search, hackathonId } = req.query;

    if (!search) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Find users matching search
    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    }).select("name email profilePicture skills experience");

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching users",
      error: error.message,
    });
  }
};

// Get all hackathons for filter dropdown
export const getHackathonsForFilter = async (req, res) => {
  try {
    const hackathons = await Hackathon.find({})
      .select("_id title hackName")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: hackathons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching hackathons",
      error: error.message,
    });
  }
};
