import mongoose from "mongoose";
import Hackathon from "../models/hackthon.model.js";
import User from "../models/user.model.js";

// @desc    Get all hackathons
// @route   GET /api/hackathons
// @access  Public

// 🔹 Helper function to determine status
const determineHackathonStatus = (hackathon) => {
  const now = new Date();

  if (now < hackathon.registrationDeadline) {
    return "registration_open";
  } else if (
    now >= hackathon.registrationDeadline &&
    now < hackathon.startDate
  ) {
    return "registration_closed";
  } else if (now >= hackathon.startDate && now <= hackathon.endDate) {
    return "ongoing";
  } else if (
    hackathon.winnerAnnouncementDate &&
    now > hackathon.endDate &&
    now < hackathon.winnerAnnouncementDate
  ) {
    return "winner_to_announced";
  } else if (
    (hackathon.winnerAnnouncementDate &&
      now >= hackathon.winnerAnnouncementDate) ||
    (!hackathon.winnerAnnouncementDate && now > hackathon.endDate)
  ) {
    return "completed";
  } else {
    return hackathon.status; // fallback (maybe "cancelled" etc.)
  }
};

// @desc    Get all hackathons
// @route   GET /api/hackathons
// @access  Public
export const getHackathons = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 4,
      status,
      mode,
      tags,
      search,
      sortBy = "startDate",
      sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (mode) filter.mode = mode;
    if (tags)
      filter.tags = { $in: Array.isArray(tags) ? tags : tags.split(",") };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    let hackathons = await Hackathon.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // 🔹 Check & update status for each hackathon
    // const updates = hackathons.map(async (hackathon) => {
    //   const newStatus = determineHackathonStatus(hackathon);
    //   if (hackathon.status !== newStatus) {
    //     hackathon.status = newStatus;
    //     await hackathon.save();
    //   }
    //   return hackathon;
    // });

    // hackathons = await Promise.all(updates);

    const total = await Hackathon.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: hackathons.length,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: hackathons,
    });
  } catch (error) {
    console.error("Get hackathons error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching hackathons",
      error: error.message,
    });
  }
};

// @desc    Get single hackathon
// @route   GET /api/hackathons/:id
// @access  Public
export const getHackathon = async (req, res) => {
  try {
    let paramId = req.params.id;
    let hackathon = null;

    if (paramId.length === 24 && mongoose.Types.ObjectId.isValid(paramId)) {
      hackathon = await Hackathon.findById(req.params.id)
        .select("-participants -problemStatements")
        .populate({
          path: "discussions.user",
          select: "name email profilePicture",
        })
        .populate({
          path: "discussions.replies.user",
          select: "name email profilePicture",
        });
    } else {
      hackathon = await Hackathon.findOne({ hackathonId: paramId })
        .select("-participants -problemStatements")
        .populate({
          path: "discussions.user",
          select: "name email profilePicture",
        })
        .populate({
          path: "discussions.replies.user",
          select: "name email profilePicture",
        });
    }

    if (!hackathon) {
      return res
        .status(404)
        .json({ success: false, message: "Hackathon not found" });
    }

    // 🔹 Update status if outdated
    // const newStatus = determineHackathonStatus(hackathon);
    // if (hackathon.status !== newStatus) {
    //   hackathon.status = newStatus;
    //   await hackathon.save();
    // }
    hackathon.totalMembersJoined = hackathon.totalMembersJoined + 73;
    res.status(200).json({ success: true, data: hackathon });
  } catch (error) {
    console.error("Get hackathon error:", error);

    if (error.name === "CastError") {
      return res
        .status(404)
        .json({ success: false, message: "Hackathon not found" });
    }

    res.status(500).json({
      success: false,
      message: "Error fetching hackathon",
      error: error.message,
    });
  }
};

export const getHackathonByHackathonId = async (req, res) => {
  try {
    const hackathon = await Hackathon.findOne({ hackathonId: req.params.id });

    if (!hackathon) {
      return res
        .status(404)
        .json({ success: false, message: "Hackathon not found" });
    }

    res.status(200).json({ success: true, data: hackathon });
  } catch (error) {
    logger.info("Get hackathon error:", error);

    if (error.name === "CastError") {
      return res
        .status(404)
        .json({ success: false, message: "Hackathon not found" });
    }

    res.status(500).json({
      success: false,
      message: "Error fetching hackathon",
      error: error.message,
    });
  }
};
// @desc    Create hackathon
// @route   POST /api/hackathons/create
// @access  Admin only
export const createHackathon = async (req, res) => {
  try {
    const {
      hackName,
      extraDetail,
      specialDetail,
      title,
      description,
      registrationDeadline,
      startDate,
      endDate,
      winnerAnnouncementDate,
      submissionDeadline,
      teamsFormedAt,
      cancelledAt,
      completedAt,
      problemStatements,
      maxTeamSize,
      venue,
      mode,
      registrationFee,
      prizes,
      tags,
      maxRegistrations,
      requirements,
      rules,
      bannerImage,
      evaluationCriteria,
      submissionFormat,
      organizer,
      faqs,
      socialLinks,
      minParticipantsToFormTeam,
      participants, // Array of email strings
      status,
      reason,
      isActive,
      discussions,
    } = req.body;

    // ✅ Validate required fields
    if (
      !hackName ||
      !title ||
      !description ||
      !registrationDeadline ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide hackName, title, description, registrationDeadline, startDate, and endDate",
      });
    }

    // ✅ Validate problem statements
    if (!problemStatements || problemStatements.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one problem statement is required",
      });
    }

    // ✅ Validate dates
    const regDeadline = new Date(registrationDeadline);
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (regDeadline <= now) {
      return res.status(400).json({
        success: false,
        message: "Registration deadline must be in the future",
      });
    }

    if (start <= regDeadline) {
      return res.status(400).json({
        success: false,
        message: "Start date must be after registration deadline",
      });
    }

    if (end <= start) {
      return res
        .status(400)
        .json({ success: false, message: "End date must be after start date" });
    }

    if (winnerAnnouncementDate && new Date(winnerAnnouncementDate) <= end) {
      return res.status(400).json({
        success: false,
        message: "Winner announcement date must be after end date",
      });
    }

    if (submissionDeadline && new Date(submissionDeadline) <= start) {
      return res.status(400).json({
        success: false,
        message: "Submission deadline must be after start date",
      });
    }

    // ✅ Validate participants emails
    if (participants && participants.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = participants.filter(
        (email) => !emailRegex.test(email)
      );
      if (invalidEmails.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid email addresses: ${invalidEmails.join(", ")}`,
        });
      }
    }

    // ✅ Auto-determine status if not provided
    let finalStatus = status;
    if (!finalStatus) {
      finalStatus = "registration_open";
      if (now > regDeadline && now < start) finalStatus = "registration_closed";
      if (now >= start && now <= end) finalStatus = "ongoing";
      if (
        now > end &&
        (!winnerAnnouncementDate || now <= new Date(winnerAnnouncementDate))
      )
        finalStatus = "winner_to_announced";
      if (winnerAnnouncementDate && now > new Date(winnerAnnouncementDate))
        finalStatus = "completed";
    }

    // ✅ Prepare participants data (convert emails to user references)
    // In a real application, you would look up users by email and get their ObjectIds
    const participantUsers = []; // This would be populated with actual user ObjectIds

    // ✅ Create Hackathon with all fields
    const hackathonData = {
      hackName,
      extraDetail: extraDetail || "",
      specialDetail: specialDetail || "",
      title,
      description,
      registrationDeadline: regDeadline,
      startDate: start,
      endDate: end,
      winnerAnnouncementDate: winnerAnnouncementDate
        ? new Date(winnerAnnouncementDate)
        : undefined,
      submissionDeadline: submissionDeadline
        ? new Date(submissionDeadline)
        : undefined,
      teamsFormedAt: teamsFormedAt ? new Date(teamsFormedAt) : undefined,
      cancelledAt: cancelledAt ? new Date(cancelledAt) : undefined,
      completedAt: completedAt ? new Date(completedAt) : undefined,
      problemStatements,
      maxTeamSize: maxTeamSize || 3,
      venue: venue || "",
      mode: mode || "offline",
      registrationFee: registrationFee || 0,
      prizes: prizes || [],
      tags: tags || [],
      maxRegistrations: maxRegistrations || undefined,
      requirements: requirements || [],
      rules: rules || [],
      bannerImage: bannerImage || "",
      evaluationCriteria: evaluationCriteria || [],
      submissionFormat: submissionFormat || "",
      organizer: organizer || {
        name: "",
        contactEmail: "",
        contactNumber: "",
        organization: "",
      },
      faqs: faqs || [],
      socialLinks: socialLinks || {
        website: "",
        linkedin: "",
        twitter: "",
        discord: "",
      },
      minParticipantsToFormTeam: minParticipantsToFormTeam || 2,
      participants: participantUsers, // Empty array for now, will be populated with user ObjectIds
      discussions: discussions || [],
      status: finalStatus,
      reason: reason || "",
      isActive: isActive !== undefined ? isActive : true,
      totalMembersJoined: 0,
    };

    const hackathon = await Hackathon.create(hackathonData);

    // ✅ If there are participants, you might want to send invitation emails here
    if (participants && participants.length > 0) {
      // In a real application, you would:
      // 1. Look up users by email and add their ObjectIds to the hackathon
      // 2. Send invitation emails
      console.log(
        `Hackathon created with ${participants.length} participants to invite`
      );
    }

    res.status(201).json({
      success: true,
      message: "Hackathon created successfully",
      data: hackathon,
    });
  } catch (error) {
    console.error("Create hackathon error:", error);

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
        field: field,
      });
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating hackathon",
      error: error.message,
    });
  }
};
// @desc    join hackathon
// @route   POST /api
// @access  authorization user only

export const joinHackathon = async (req, res) => {
  try {
    const hackathonId = req.params.id;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 🔹 Check if user is already in THIS hackathon
    if (String(user.currentHackathonId) === String(hackathonId)) {
      return res.status(400).json({
        success: false,
        message: "You have already joined this hackathon",
      });
    }

    // 🔹 Check if user is in another active hackathon
    if (user.currentHackathonId !== null) {
      const currentHackathon = await Hackathon.findById(
        user.currentHackathonId
      );

      if (currentHackathon) {
        const currentStatus = determineHackathonStatus(currentHackathon);
        if (currentHackathon.status !== currentStatus) {
          currentHackathon.status = currentStatus;
          await currentHackathon.save();
        }

        // If current hackathon is still active, block joining new one
        if (
          currentHackathon.status === "registration_open" ||
          currentHackathon.status === "ongoing"
        ) {
          return res.status(400).json({
            success: false,
            message: `You are already in an active hackathon: ${currentHackathon.name}. Leave it before joining a new one.`,
          });
        } else if (
          currentHackathon.status === "completed" ||
          currentHackathon.status === "cancelled"
        ) {
          // Clean up completed/cancelled hackathon
          user.currentHackathonId = null;
          await user.save();
        }
      } else {
        // Cleanup orphaned currentHackathonId
        user.currentHackathonId = null;
        await user.save();
      }
    }

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    // 🔹 Check if user is already in participants list (additional safety check)
    if (hackathon.participants.includes(user._id)) {
      return res.status(400).json({
        success: false,
        message: "You have already joined this hackathon",
      });
    }

    // 🔹 Update status if outdated
    // const newStatus = determineHackathonStatus(hackathon);
    // if (hackathon.status !== newStatus) {
    //   hackathon.status = newStatus;
    //   await hackathon.save();
    // }

    // 🔹 Check if hackathon is joinable
    if (hackathon.status !== "registration_open") {
      return res.status(400).json({
        success: false,
        message: `Hackathon cannot be joined now. Current status: ${hackathon.status}`,
      });
    }

    // 🔹 Check max registrations
    if (
      hackathon.maxRegistrations &&
      hackathon.totalMembersJoined >= hackathon.maxRegistrations
    ) {
      return res.status(400).json({
        success: false,
        message: "Hackathon has reached maximum registrations",
      });
    }

    // 🔹 Add user to hackathon
    user.currentHackathonId = hackathon._id;
    await user.save();

    // Add user to participants if not already there
    if (!hackathon.participants.includes(user._id)) {
      hackathon.participants.push(user._id);
      hackathon.totalMembersJoined = hackathon.participants.length;
      await hackathon.save();
    }

    return res.status(200).json({
      success: true,
      message: "Successfully joined hackathon",
      data: hackathon,
    });
  } catch (error) {
    console.error("Join hackathon error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid hackathon ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error joining hackathon",
      error: error.message,
    });
  }
};

export const leaveHackathon = async (req, res) => {
  try {
    const hackathonId = req.params.id;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.currentHackathonId) {
      return res.status(400).json({
        success: false,
        message: "You are not part of any hackathon",
      });
    }

    // Make sure the user is leaving the hackathon they are in
    if (user.currentHackathonId.toString() !== hackathonId) {
      return res.status(400).json({
        success: false,
        message: "You are not part of this hackathon",
      });
    }

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      // Clean up the user's currentHackathonId since the hackathon doesn't exist
      user.currentHackathonId = null;
      await user.save();

      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    // Check if hackathon allows leaving (optional - based on your business logic)
    const hackathonStatus = determineHackathonStatus(hackathon);
    if (hackathonStatus === "ongoing" || hackathonStatus === "completed") {
      return res.status(400).json({
        success: false,
        message: `Cannot leave hackathon while it is ${hackathonStatus}`,
      });
    }

    // Remove user from participants if they exist in the list
    const wasParticipant = hackathon.participants.some(
      (participantId) => participantId.toString() === user._id.toString()
    );

    if (wasParticipant) {
      hackathon.participants = hackathon.participants.filter(
        (participantId) => participantId.toString() !== user._id.toString()
      );
      hackathon.totalMembersJoined = hackathon.participants.length;
      await hackathon.save();
    }

    // Clear user's current hackathon
    user.currentHackathonId = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Successfully left hackathon",
      data: {
        hackathonId: hackathon._id,
        hackathonName: hackathon.name,
        totalMembersJoined: hackathon.totalMembersJoined,
      },
    });
  } catch (error) {
    console.error("Leave hackathon error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid hackathon ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error leaving hackathon",
      error: error.message,
    });
  }
};

// @desc    Update hackathon
// @route   PUT /api/hackathons/:id
// @access  Admin only
// @desc    Update hackathon
// @route   PUT /api/hackathons/:id
// @access  Admin only
export const updateHackathon = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Validate hackathon ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Invalid hackathon ID format",
      });
    }

    // Find the existing hackathon
    const existingHackathon = await Hackathon.findById(id).session(session);

    if (!existingHackathon) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    // Validate required fields
    const requiredFields = [
      "title",
      "hackName",
      "description",
      "registrationDeadline",
      "startDate",
      "endDate",
    ];
    const missingFields = requiredFields.filter(
      (field) => !updateData[field] && !existingHackathon[field]
    );

    if (missingFields.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        missingFields,
      });
    }

    // Validate dates
    const regDeadline = new Date(
      updateData.registrationDeadline || existingHackathon.registrationDeadline
    );
    const startDate = new Date(
      updateData.startDate || existingHackathon.startDate
    );
    const endDate = new Date(updateData.endDate || existingHackathon.endDate);
    const now = new Date();

    // Registration deadline validation
    if (regDeadline <= now) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Registration deadline must be in the future",
      });
    }

    // Start date validation
    if (startDate <= regDeadline) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Start date must be after registration deadline",
      });
    }

    // End date validation
    if (endDate <= startDate) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    // Winner announcement date validation
    if (updateData.winnerAnnouncementDate) {
      const winnerAnnouncementDate = new Date(
        updateData.winnerAnnouncementDate
      );
      if (winnerAnnouncementDate <= endDate) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "Winner announcement date must be after end date",
        });
      }
    }

    // Submission deadline validation
    if (updateData.submissionDeadline) {
      const submissionDeadline = new Date(updateData.submissionDeadline);
      if (submissionDeadline <= startDate || submissionDeadline > endDate) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message:
            "Submission deadline must be between start date and end date",
        });
      }
    }

    // Validate team size constraints
    if (updateData.maxTeamSize !== undefined) {
      if (updateData.maxTeamSize < 1 || updateData.maxTeamSize > 10) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "Maximum team size must be between 1 and 10",
        });
      }
    }

    if (updateData.minParticipantsToFormTeam !== undefined) {
      if (
        updateData.minParticipantsToFormTeam < 0 ||
        updateData.minParticipantsToFormTeam > 100
      ) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message:
            "Minimum participants to form team must be between 0 and 100",
        });
      }

      if (
        updateData.maxTeamSize !== undefined &&
        updateData.minParticipantsToFormTeam > updateData.maxTeamSize
      ) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message:
            "Minimum participants to form team cannot exceed maximum team size",
        });
      }
    }

    // Validate registration fee
    if (
      updateData.registrationFee !== undefined &&
      updateData.registrationFee < 0
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Registration fee cannot be negative",
      });
    }

    // Validate max registrations
    if (updateData.maxRegistrations !== undefined) {
      if (updateData.maxRegistrations < 1) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "Maximum registrations must be at least 1",
        });
      }

      if (updateData.maxRegistrations < existingHackathon.totalMembersJoined) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Maximum registrations cannot be less than current registered members (${existingHackathon.totalMembersJoined})`,
        });
      }
    }

    // Validate status transitions
    if (updateData.status && updateData.status !== existingHackathon.status) {
      const validTransitions = {
        registration_open: ["registration_closed", "cancelled"],
        registration_closed: ["ongoing", "cancelled"],
        ongoing: ["winner_to_announced", "cancelled"],
        winner_to_announced: ["completed"],
        completed: [],
        cancelled: [],
      };

      if (
        !validTransitions[existingHackathon.status]?.includes(updateData.status)
      ) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Invalid status transition from ${existingHackathon.status} to ${updateData.status}`,
        });
      }

      // Set appropriate timestamps based on status changes
      if (updateData.status === "cancelled" && !updateData.cancelledAt) {
        updateData.cancelledAt = new Date();
      } else if (updateData.status === "completed" && !updateData.completedAt) {
        updateData.completedAt = new Date();
      } else if (
        updateData.status === "ongoing" &&
        existingHackathon.status === "registration_closed"
      ) {
        // updateData.teamsFormedAt = new Date();
      }
    }

    // // Validate hackName uniqueness (if being updated)
    // if (
    //   updateData.hackName &&
    //   updateData.hackName !== existingHackathon.hackName
    // ) {
    //   const existingHackName = await Hackathon.findOne({
    //     hackName: updateData.hackName,
    //     _id: { $ne: id },
    //   }).session(session);

    //   if (existingHackName) {
    //     await session.abortTransaction();
    //     session.endSession();
    //     return res.status(400).json({
    //       success: false,
    //       message: "Hackathon name already exists",
    //     });
    //   }
    // }

    // Process participants - handle user lookup by email
    if (updateData.participants && Array.isArray(updateData.participants)) {
      const User = mongoose.model("User");
      const participantIds = [];

      for (const participantData of updateData.participants) {
        if (!participantData.email) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            success: false,
            message: "Participant email is required",
          });
        }

        // Find user by email
        let user = await User.findOne({ email: participantData.email }).session(
          session
        );

        if (!user) {
          // Create new user if doesn't exist
          user = new User({
            name: participantData.name || participantData.email.split("@")[0],
            email: participantData.email,
            password:
              (participantData.name?.split(" ")[0]?.toUpperCase() || "USER") +
              "@9999", // Default password, should be changed
          });
          await user.save({ session });
        }
        participantIds.push(user._id);
      }

      // Replace participants array with user IDs
      updateData.participants = participantIds;
    }

    // Validate evaluation criteria weights
    if (
      updateData.evaluationCriteria &&
      Array.isArray(updateData.evaluationCriteria)
    ) {
      const totalWeight = updateData.evaluationCriteria.reduce(
        (sum, criterion) => sum + (criterion.weight || 0),
        0
      );

      if (totalWeight > 100) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "Total evaluation criteria weight cannot exceed 100%",
        });
      }

      // Validate individual criterion weights
      for (const criterion of updateData.evaluationCriteria) {
        if (criterion.weight < 0 || criterion.weight > 100) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            success: false,
            message: "Criterion weight must be between 0 and 100",
          });
        }
      }
    }

    // Validate prize amounts
    if (updateData.prizes && Array.isArray(updateData.prizes)) {
      for (const prize of updateData.prizes) {
        if (prize.amount < 0) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            success: false,
            message: "Prize amount cannot be negative",
          });
        }
      }
    }

    // Clean up undefined fields to avoid overwriting with null
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Update the hackathon
    const updatedHackathon = await Hackathon.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
      session,
      context: "query",
    }).populate("participants", "name email");

    if (!updatedHackathon) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Hackathon not found after update",
      });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Hackathon updated successfully",
      data: updatedHackathon,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Update hackathon error:", error);

    // MongoDB CastError (invalid ID)
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid hackathon ID",
      });
    }

    // MongoDB ValidationError
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    // MongoDB Duplicate Key Error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
        field,
      });
    }

    // General server error
    res.status(500).json({
      success: false,
      message: "Internal server error while updating hackathon",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
// @desc    Delete hackathon (soft delete by setting isActive to false)
// @route   DELETE /api/hackathons/:id
// @access  Admin only
export const deleteHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    // Soft delete by setting isActive to false
    hackathon.isActive = false;
    hackathon.status = "cancelled";
    hackathon.reason = req.body.reason || "Deleted by admin";

    await hackathon.save();

    res.status(200).json({
      success: true,
      message: "Hackathon deleted successfully",
    });
  } catch (error) {
    console.error("Delete hackathon error:", error);

    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error deleting hackathon",
      error: error.message,
    });
  }
};

// @desc    Get hackathons for admin (includes inactive)
// @route   GET /api/hackathons/admin
// @access  Admin only
export const getHackathonsForAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      mode,
      isActive,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (mode) {
      filter.mode = mode;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const hackathons = await Hackathon.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Hackathon.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: hackathons.length,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: hackathons,
    });
  } catch (error) {
    console.error("Get hackathons for admin error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching hackathons",
      error: error.message,
    });
  }
};

// @desc    Update hackathon status
// @route   PATCH /api/hackathons/:id/status
// @access  Admin only
export const updateHackathonStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const validStatuses = [
      "upcoming",
      "registration_open",
      "registration_closed",
      "ongoing",
      "winner_to_announced",
      "completed",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const hackathon = await Hackathon.findById(req.params.id);

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    hackathon.status = status;
    if (reason) {
      hackathon.reason = reason;
    }

    // If status is cancelled, set isActive to false
    if (status === "cancelled") {
      hackathon.isActive = false;
    }

    await hackathon.save();

    res.status(200).json({
      success: true,
      message: "Hackathon status updated successfully",
      data: hackathon,
    });
  } catch (error) {
    console.error("Update hackathon status error:", error);

    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating hackathon status",
      error: error.message,
    });
  }
};

// @desc    Get hackathon statistics
// @route   GET /api/hackathons/stats
// @access  Admin only
export const getHackathonStats = async (req, res) => {
  try {
    const totalHackathons = await Hackathon.countDocuments();
    const activeHackathons = await Hackathon.countDocuments({ isActive: true });

    const statusStats = await Hackathon.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const modeStats = await Hackathon.aggregate([
      {
        $group: {
          _id: "$mode",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalParticipants = await Hackathon.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalMembersJoined" },
        },
      },
    ]);

    const upcomingHackathons = await Hackathon.countDocuments({
      status: { $in: ["upcoming", "registration_open"] },
      isActive: true,
    });

    const ongoingHackathons = await Hackathon.countDocuments({
      status: "ongoing",
      isActive: true,
    });

    res.status(200).json({
      success: true,
      data: {
        totalHackathons,
        activeHackathons,
        upcomingHackathons,
        ongoingHackathons,
        totalParticipants: totalParticipants[0]?.total || 0,
        statusBreakdown: statusStats,
        modeBreakdown: modeStats,
      },
    });
  } catch (error) {
    console.error("Get hackathon stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching hackathon statistics",
      error: error.message,
    });
  }
};

// @desc    Get featured hackathons
// @route   GET /api/hackathons/featured
// @access  Public
export const getFeaturedHackathons = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const featuredHackathons = await Hackathon.find({
      isActive: true,
      status: { $in: ["upcoming", "registration_open", "ongoing"] },
    })
      .sort({ totalMembersJoined: -1, startDate: 1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: featuredHackathons.length,
      data: featuredHackathons,
    });
  } catch (error) {
    console.error("Get featured hackathons error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching featured hackathons",
      error: error.message,
    });
  }
};

// @desc    Search hackathons by tags
// @route   GET /api/hackathons/tags/:tag
// @access  Public
export const getHackathonsByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const hackathons = await Hackathon.find({
      tags: { $in: [tag] },
      isActive: true,
    })
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Hackathon.countDocuments({
      tags: { $in: [tag] },
      isActive: true,
    });

    res.status(200).json({
      success: true,
      count: hackathons.length,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: hackathons,
    });
  } catch (error) {
    console.error("Get hackathons by tag error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching hackathons by tag",
      error: error.message,
    });
  }
};

export const createDiscussion = async (req, res) => {
  try {
    const hackathonId = req.params.id;
    const { title, content, category, tags } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    // Check if hackathon exists
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    // Check if hackathon is active
    if (!hackathon.isActive) {
      return res.status(400).json({
        success: false,
        message: "Cannot create discussion for inactive hackathon",
      });
    }

    // Create new discussion
    const newDiscussion = {
      user: req.user._id,
      title: title.trim(),
      content: content || "", // Add content field even if empty
      category: category || "general",
      tags: tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add discussion to hackathon's discussions array
    hackathon.discussions.push(newDiscussion);
    await hackathon.save();

    // Get the newly created discussion with populated user data
    const updatedHackathon = await Hackathon.findById(hackathonId)
      .populate("discussions.user", "name email profilePicture") // Populate user details
      .populate({
        path: "discussions.replies.user",
        select: "name email profilePicture",
      });
    console.log("Updated hackathon discussions:", updatedHackathon);
    // const savedDiscussion =
    //   updatedHackathon.discussions[updatedHackathon.discussions.length - 1];

    // console.log("Saved discussion:", savedDiscussion);

    res.status(201).json({
      success: true,
      message: "Discussion created successfully",
      data: updatedHackathon,
    });
  } catch (error) {
    console.error("Create discussion error:", error);

    // Handle specific MongoDB errors
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid hackathon ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating discussion",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

export const giveRepliesToDiscussion = async (req, res) => {
  try {
    const hackathonId = req.params.id;
    const discussionId = req.params.discussionId;
    const { content } = req.body;

    // Validate required fields
    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    // Check if hackathon exists
    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    // Check if discussion exists
    const discussion = hackathon.discussions.id(discussionId);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      });
    }

    // Create new reply
    const newReply = {
      user: req.user._id,
      content: content.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add reply to discussion's replies array
    discussion.replies.push(newReply);
    await hackathon.save();

    // Get the updated discussion with populated user data
    const updatedDiscussion = await Hackathon.findById(hackathonId)
      .populate("discussions.user", "name email profilePicture")
      .populate({
        path: "discussions.replies.user",
        select: "name email profilePicture",
      });

    res.status(201).json({
      success: true,
      message: "Reply added successfully",
      data: updatedDiscussion,
    });
  } catch (error) {
    console.error("Add reply error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding reply",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// export const getHackathonByHackathonId = async (req, res) => {
//   try {
//     const hackathon = await Hackathon.findOne({ hackName: req.params.id });

//     if (!hackathon) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Hackathon not found" });
//     }
//     res.status(200).json({ success: true, data: hackathon });
//   } catch (error) {
//     logger.info("Get hackathon error:", error);
//     if (error.name === "CastError") {
//       return res
//         .status(404)
//         .json({ success: false, message: "Hackathon not found" });
//     }
//     res.status(500).json({
//       success: false,
//       message: "Error fetching hackathon",
//       error: error.message,
//     });
//   }
// };
