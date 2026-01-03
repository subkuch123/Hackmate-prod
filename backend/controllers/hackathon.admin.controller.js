import Hackathon from "../models/hackthon.model.js";
import mongoose from "mongoose";

// Get all hackathons with comprehensive details
export const getHackathons = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "startDate",
      sortOrder = "asc",
      status,
      mode,
      search,
      tags,
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (status) filter.status = status;
    if (mode) filter.mode = mode;
    if (tags) {
      filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    }
    if (search) {
      filter.$or = [
        { hackName: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query with population
    const hackathons = await Hackathon.find(filter)
      .populate("participants", "name email avatar")
      .populate("discussions.user", "name email")
      .populate("discussions.replies.user", "name email")
      .sort(sortConfig)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count for pagination
    const total = await Hackathon.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: hackathons,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching hackathons",
      error: error.message,
    });
  }
};

// Get single hackathon by ID
export const getHackathonById = async (req, res) => {
  try {
    const { id } = req.params;

    let hackathon;
    if (mongoose.Types.ObjectId.isValid(id)) {
      hackathon = await Hackathon.findOne({
        $or: [{ _id: id }, { hackathonId: parseInt(id) }],
      })
        .populate("participants", "name email avatar role")
        .populate("discussions.user", "name email avatar")
        .populate("discussions.replies.user", "name email avatar");
    } else {
      hackathon = await Hackathon.findOne({ hackathonId: parseInt(id) })
        .populate("participants", "name email avatar role")
        .populate("discussions.user", "name email avatar")
        .populate("discussions.replies.user", "name email avatar");
    }

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    res.status(200).json({
      success: true,
      data: hackathon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching hackathon",
      error: error.message,
    });
  }
};

// Get hackathon statistics
export const getHackathonStats = async (req, res) => {
  try {
    const stats = await Hackathon.aggregate([
      {
        $facet: {
          totalHackathons: [{ $count: "count" }],
          activeHackathons: [
            { $match: { isActive: true } },
            { $count: "count" },
          ],
          byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
          byMode: [{ $group: { _id: "$mode", count: { $sum: 1 } } }],
          upcomingHackathons: [
            {
              $match: {
                startDate: { $gt: new Date() },
                isActive: true,
              },
            },
            { $count: "count" },
          ],
          totalParticipants: [
            { $unwind: "$participants" },
            { $group: { _id: null, count: { $sum: 1 } } },
          ],
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message,
    });
  }
};

// Update hackathon - comprehensive update handler
export const updateHackathon = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find hackathon
    const hackathon = await Hackathon.findOne({
      $or: [{ _id: id }, { hackathonId: parseInt(id) }],
    });

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    // Handle participant removal
    if (
      updateData.removeParticipants &&
      Array.isArray(updateData.removeParticipants)
    ) {
      hackathon.participants = hackathon.participants.filter(
        (participant) =>
          !updateData.removeParticipants.includes(participant.toString())
      );
      delete updateData.removeParticipants;
    }

    // Handle participant addition
    if (
      updateData.addParticipants &&
      Array.isArray(updateData.addParticipants)
    ) {
      const newParticipants = updateData.addParticipants.filter(
        (participantId) => !hackathon.participants.includes(participantId)
      );
      hackathon.participants.push(...newParticipants);
      delete updateData.addParticipants;
    }

    // Handle discussion updates
    if (updateData.discussionUpdates) {
      await handleDiscussionUpdates(hackathon, updateData.discussionUpdates);
      delete updateData.discussionUpdates;
    }

    // Update other fields
    Object.keys(updateData).forEach((key) => {
      if (
        updateData[key] !== undefined &&
        key !== "removeParticipants" &&
        key !== "addParticipants"
      ) {
        hackathon[key] = updateData[key];
      }
    });

    // Recalculate total members
    hackathon.totalMembersJoined = hackathon.participants.length;

    await hackathon.save();

    // Populate and return updated hackathon
    const updatedHackathon = await Hackathon.findById(hackathon._id)
      .populate("participants", "name email avatar role")
      .populate("discussions.user", "name email avatar")
      .populate("discussions.replies.user", "name email avatar");

    res.status(200).json({
      success: true,
      message: "Hackathon updated successfully",
      data: updatedHackathon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating hackathon",
      error: error.message,
    });
  }
};

// Helper function for discussion updates
const handleDiscussionUpdates = async (hackathon, discussionUpdates) => {
  const {
    addDiscussion,
    updateDiscussion,
    deleteDiscussion,
    addReply,
    updateReply,
    deleteReply,
    likeDiscussion,
    unlikeDiscussion,
    likeReply,
    unlikeReply,
  } = discussionUpdates;

  if (addDiscussion) {
    hackathon.discussions.push(addDiscussion);
  }

  if (updateDiscussion && updateDiscussion.discussionId) {
    const discussion = hackathon.discussions.id(updateDiscussion.discussionId);
    if (discussion) {
      Object.keys(updateDiscussion.updates).forEach((key) => {
        if (key !== "discussionId") {
          discussion[key] = updateDiscussion.updates[key];
        }
      });
      discussion.isEdited = true;
    }
  }

  if (deleteDiscussion) {
    hackathon.discussions = hackathon.discussions.filter(
      (d) => d._id.toString() !== deleteDiscussion
    );
  }

  if (addReply && addReply.discussionId) {
    const discussion = hackathon.discussions.id(addReply.discussionId);
    if (discussion) {
      discussion.replies.push(addReply.reply);
    }
  }

  if (updateReply && updateReply.discussionId && updateReply.replyId) {
    const discussion = hackathon.discussions.id(updateReply.discussionId);
    if (discussion) {
      const reply = discussion.replies.id(updateReply.replyId);
      if (reply) {
        Object.keys(updateReply.updates).forEach((key) => {
          reply[key] = updateReply.updates[key];
        });
        reply.isEdited = true;
      }
    }
  }

  if (deleteReply && deleteReply.discussionId && deleteReply.replyId) {
    const discussion = hackathon.discussions.id(deleteReply.discussionId);
    if (discussion) {
      discussion.replies = discussion.replies.filter(
        (r) => r._id.toString() !== deleteReply.replyId
      );
    }
  }

  // Handle likes
  if (likeDiscussion && likeDiscussion.discussionId && likeDiscussion.userId) {
    const discussion = hackathon.discussions.id(likeDiscussion.discussionId);
    if (discussion && !discussion.likes.includes(likeDiscussion.userId)) {
      discussion.likes.push(likeDiscussion.userId);
    }
  }

  if (
    unlikeDiscussion &&
    unlikeDiscussion.discussionId &&
    unlikeDiscussion.userId
  ) {
    const discussion = hackathon.discussions.id(unlikeDiscussion.discussionId);
    if (discussion) {
      discussion.likes = discussion.likes.filter(
        (like) => like.toString() !== unlikeDiscussion.userId
      );
    }
  }

  if (
    likeReply &&
    likeReply.discussionId &&
    likeReply.replyId &&
    likeReply.userId
  ) {
    const discussion = hackathon.discussions.id(likeReply.discussionId);
    if (discussion) {
      const reply = discussion.replies.id(likeReply.replyId);
      if (reply && !reply.likes.includes(likeReply.userId)) {
        reply.likes.push(likeReply.userId);
      }
    }
  }

  if (
    unlikeReply &&
    unlikeReply.discussionId &&
    unlikeReply.replyId &&
    unlikeReply.userId
  ) {
    const discussion = hackathon.discussions.id(unlikeReply.discussionId);
    if (discussion) {
      const reply = discussion.replies.id(unlikeReply.replyId);
      if (reply) {
        reply.likes = reply.likes.filter(
          (like) => like.toString() !== unlikeReply.userId
        );
      }
    }
  }
};

// Bulk update multiple hackathons
export const bulkUpdateHackathons = async (req, res) => {
  try {
    const { updates } = req.body;

    const results = [];
    for (const update of updates) {
      try {
        const hackathon = await Hackathon.findById(update.id);
        if (hackathon) {
          Object.keys(update.data).forEach((key) => {
            hackathon[key] = update.data[key];
          });
          await hackathon.save();
          results.push({ id: update.id, status: "success" });
        } else {
          results.push({ id: update.id, status: "not_found" });
        }
      } catch (error) {
        results.push({ id: update.id, status: "error", error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: "Bulk update completed",
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in bulk update",
      error: error.message,
    });
  }
};
