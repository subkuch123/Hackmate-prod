import Notification from "../models/Notification.model.js";
import User from "../models/user.model.js"; // Assuming you have a User model
import mongoose from "mongoose";

export const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      message,
      description,
      status,
      duration,
      type,
      position, // NOTE: your schema uses `positon` (typo)
      priority,
      isBroadcast,
      recipients,
      action,
      expiresAt,
      scheduledFor,
      metadata,
    } = req.body;

    const notification = await Notification.findById(id);

    if (!notification || notification.deleted) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // ✅ Validation: recipients required if not broadcast
    if (isBroadcast === false || isBroadcast === "false") {
      const hasRecipients = Array.isArray(recipients) && recipients.length > 0;

      if (!hasRecipients) {
        return res.status(400).json({
          success: false,
          message: "Recipients are required for non-broadcast notifications",
        });
      }
    }

    // ✅ Normalize recipients → [{ userId, read, readAt }]
    let normalizedRecipients;
    if (Array.isArray(recipients)) {
      normalizedRecipients = recipients
        .map((r) => {
          if (typeof r === "string") {
            return { userId: r, read: false };
          }
          if (r && typeof r === "object") {
            return {
              userId: r.userId || r._id || r.id,
              read: r.read ?? false,
              readAt: r.readAt ?? undefined,
            };
          }
          return null;
        })
        .filter(Boolean);
    }

    // ✅ Apply updates only if fields are provided
    if (title !== undefined) notification.title = title;
    if (message !== undefined) notification.message = message;
    if (description !== undefined) notification.description = description;
    if (status !== undefined) notification.status = status;
    if (duration !== undefined) notification.duration = duration;
    if (type !== undefined) notification.type = type;

    // ⚠️ Schema field is `positon`, not `position`
    if (position !== undefined) notification.positon = position;

    if (priority !== undefined) notification.priority = priority;
    if (typeof isBroadcast !== "undefined") {
      notification.isBroadcast = isBroadcast;
    }
    if (normalizedRecipients !== undefined) {
      notification.recipients = normalizedRecipients;
    }
    if (action !== undefined) notification.action = action;
    if (expiresAt !== undefined) notification.expiresAt = expiresAt;
    if (scheduledFor !== undefined) notification.scheduledFor = scheduledFor;
    if (metadata !== undefined) notification.metadata = metadata;

    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification updated successfully",
      data: notification,
    });
  } catch (err) {
    console.error("Error updating notification:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update notification",
      error: err.message,
    });
  }
};

// @desc    Create a new notification
// @route   POST /api/notifications
// @access  Private (Admin/System)
export const createNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      description,
      type,
      priority,
      isBroadcast,
      recipients,
      action,
      expiresAt,
      scheduledFor,
      metadata,
      duration,
      positon,
    } = req.body;

    // Basic validation
    if (!title || !message || !type) {
      return res.status(400).json({
        success: false,
        message: "Title, message, and type are required",
      });
    }

    // If it's a broadcast, don't require individual recipients
    if (!isBroadcast && (!recipients || recipients.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Recipients are required for non-broadcast notifications",
      });
    }

    const notificationData = {
      title,
      message,
      description,
      type,
      priority: priority || "MEDIUM",
      isBroadcast: isBroadcast || false,
      sender: req.user?.id, // Assuming user is attached to req via auth middleware
      action: action || { type: "NONE" },
      expiresAt,
      scheduledFor,
      metadata,
      duration: duration || 0,
      positon: positon || "STICKY_TOP",
    };

    // Add recipients if provided
    if (recipients && recipients.length > 0) {
      notificationData.recipients = recipients.map((recipient) => ({
        userId: recipient.userId,
        read: false,
      }));
    }

    const notification = new Notification(notificationData);
    await notification.save();

    // Populate sender info for response
    await notification.populate("sender", "name email");
    if (!isBroadcast) {
      await notification.populate("recipients.userId", "name email");
    }

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification,
    });
  } catch (error) {
    console.error("Create notification error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating notification",
      error: error.message,
    });
  }
};

export const getLatestActiveNotification = async (req, res) => {
  try {
    const now = new Date();
    const notification = await Notification.findOne({
      deleted: false,
      status: "ACTIVE",
      $or: [{ expiresAt: { $gt: now } }, { expiresAt: null }],
      $or: [{ scheduledFor: { $lte: now } }, { scheduledFor: null }],
    }).sort({ createdAt: -1 });
    if (!notification) {
      return res.status(200).json({
        success: false,
        message: "No active notification found",
      });
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Get latest active notification error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching latest active notification",
      error: error.message,
    });
  }
};

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 20,
      type,
      read,
      priority,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = {
      $or: [{ isBroadcast: true }, { "recipients.userId": userId }],
      deleted: false,
    };

    // Add filters
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (read !== undefined) {
      if (read === "true") {
        query["recipients.read"] = true;
      } else {
        query["recipients.read"] = false;
      }
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    const notifications = await Notification.find(query)
      .populate("sender", "name email avatar")
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Mark which notifications are read by this user
    const enhancedNotifications = notifications.map((notification) => {
      const recipientInfo = notification.recipients?.find(
        (recipient) => recipient.userId?.toString() === userId
      );

      return {
        ...notification,
        isRead: recipientInfo?.read || false,
        readAt: recipientInfo?.readAt,
      };
    });

    const total = await Notification.countDocuments(query);

    res.json({
      success: true,
      data: enhancedNotifications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Get user notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};
export const getUserNotificationsAll = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate("sender", "name email avatar")
      .lean();
    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: 1,
        limit: notifications.length,
        total: notifications.length,
        pages: 1,
      },
    });
  } catch (error) {
    console.error("Get user notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message,
    });
  }
};

// @desc    Get notification by ID
// @route   GET /api/notifications/:id
// @access  Private
export const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification = await Notification.findOne({
      _id: id,
      deleted: false,
      $or: [{ isBroadcast: true }, { "recipients.userId": userId }],
    })
      .populate("sender", "name email avatar")
      .populate("recipients.userId", "name email");

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Add read status for current user
    const notificationObj = notification.toObject();
    const recipientInfo = notification.recipients?.find(
      (recipient) => recipient.userId?._id.toString() === userId
    );

    notificationObj.isRead = recipientInfo?.read || false;
    notificationObj.readAt = recipientInfo?.readAt;

    res.json({
      success: true,
      data: notificationObj,
    });
  } catch (error) {
    console.error("Get notification by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notification",
      error: error.message,
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification = await Notification.findOne({
      _id: id,
      deleted: false,
      "recipients.userId": userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or you don't have access to it",
      });
    }

    // Update read status
    const result = await Notification.updateOne(
      {
        _id: id,
        "recipients.userId": userId,
      },
      {
        $set: {
          "recipients.$.read": true,
          "recipients.$.readAt": new Date(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: "Notification already read or couldn't be updated",
      });
    }

    res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({
      success: false,
      message: "Error marking notification as read",
      error: error.message,
    });
  }
};

// @desc    Mark all notifications as read for user
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Notification.updateMany(
      {
        "recipients.userId": userId,
        "recipients.read": false,
        deleted: false,
      },
      {
        $set: {
          "recipients.$.read": true,
          "recipients.$.readAt": new Date(),
        },
      }
    );

    res.json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`,
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({
      success: false,
      message: "Error marking notifications as read",
      error: error.message,
    });
  }
};

// @desc    Get unread notifications count
// @route   GET /api/notifications/unread/count
// @access  Private
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Notification.countDocuments({
      $or: [
        {
          isBroadcast: true,
          "recipients.userId": { $ne: userId },
          deleted: false,
        },
        {
          "recipients.userId": userId,
          "recipients.read": false,
          deleted: false,
        },
      ],
    });

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching unread count",
      error: error.message,
    });
  }
};

// @desc    Delete notification (soft delete)
// @route   DELETE /api/notifications/:id
// @access  Private (Admin/Owner)
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Check if user is admin or sender
    const isAdmin = req.user.role === "admin"; // Assuming you have role-based auth
    const isSender = notification.sender?.toString() === req.user.id;

    if (!isAdmin && !isSender) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this notification",
      });
    }

    // Soft delete
    notification.deleted = true;
    notification.deletedAt = new Date();
    await notification.save();

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting notification",
      error: error.message,
    });
  }
};

// @desc    Get notifications statistics (Admin only)
// @route   GET /api/notifications/admin/stats
// @access  Private (Admin)
export const getNotificationStats = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const stats = await Notification.aggregate([
      {
        $match: {
          deleted: false,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
        },
      },
      {
        $group: {
          _id: {
            type: "$type",
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.type",
          dailyStats: {
            $push: {
              date: "$_id.date",
              count: "$count",
            },
          },
          total: { $sum: "$count" },
        },
      },
    ]);

    // Get total notifications count
    const totalNotifications = await Notification.countDocuments({
      deleted: false,
    });
    const broadcastCount = await Notification.countDocuments({
      isBroadcast: true,
      deleted: false,
    });

    res.json({
      success: true,
      data: {
        stats,
        totals: {
          all: totalNotifications,
          broadcast: broadcastCount,
        },
      },
    });
  } catch (error) {
    console.error("Get notification stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notification statistics",
      error: error.message,
    });
  }
};

// @desc    Remove notification from user's list (without deleting globally)
// @route   DELETE /api/notifications/:id/user
// @access  Private
export const removeNotificationForUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const result = await Notification.updateOne(
      {
        _id: id,
        "recipients.userId": userId,
      },
      {
        $pull: {
          recipients: { userId: userId },
        },
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found in your list",
      });
    }

    res.json({
      success: true,
      message: "Notification removed from your list",
    });
  } catch (error) {
    console.error("Remove notification for user error:", error);
    res.status(500).json({
      success: false,
      message: "Error removing notification",
      error: error.message,
    });
  }
};
