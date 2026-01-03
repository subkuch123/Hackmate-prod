// models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // Basic Information
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "ARCHIVED"],
      default: "ACTIVE",
    },
    duration: {
      type: Number,
      default: 0,
    },
    // Notification Type Classification
    type: {
      type: String,
      required: true,
      enum: [
        "SYSTEM_ALERT", // Server down, system maintenance
        "ADMIN_ALERT", // Admin-specific notifications
        "USER_SPECIFIC", // User-specific notifications
        "TEAM", // Team formation
        "HACKATHON", // Hackathon related
        "MESSAGE", // Unread messages
        "SECURITY", // Security alerts
        "ANNOUNCEMENT", // General announcements
        "REMINDER", // Reminders
        "OTHER", // Other types
      ],
      default: "OTHER",
    },

    positon: {
      type: String,
      enum: ["STICKY_TOP", "WHOLE_PAGE", "SIDE_BOTTOM_RIGHT"],
      default: "STICKY_TOP",
    },

    // Priority Levels
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },

    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },

    // For broadcast notifications (if sent to all users)
    isBroadcast: {
      type: Boolean,
      default: false,
    },

    // Sender Information
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },

    // Optional: Recipients array (for group or broadcast notifications)
    recipients: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: false,
        },
        read: {
          type: Boolean,
          default: false,
        },
        readAt: Date,
      },
    ],

    // Action Handling
    action: {
      type: {
        type: String,
        enum: ["REDIRECT", "API_CALL", "MODAL", "EXTERNAL_LINK", "NONE"],
        default: "NONE",
      },
      url: {
        type: String,
      },
      method: {
        type: String, // For API calls
      },
      payload: {
        type: mongoose.Schema.Types.Mixed, // Additional data for the action
      },
    },

    // Expiration and Scheduling
    expiresAt: {
      type: Date,
    },
    scheduledFor: {
      type: Date,
    },

    // Metadata (for any additional info)
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ✅ Indexes for performance
notificationSchema.index({ "recipients.userId": 1, createdAt: -1 });
notificationSchema.index({ type: 1, status: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ createdAt: -1 });

// ✅ Virtual for unread count (works only if recipients array exists)
notificationSchema.virtual("unreadCount").get(function () {
  if (!this.recipients) return 0;
  return this.recipients.filter((recipient) => !recipient.read).length;
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
