import mongoose from "mongoose";
const { Schema } = mongoose;

const eventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: [true, "Event ID is required"],
      unique: true,
      trim: true,
      match: [
        /^[a-z0-9-]+$/,
        "Event ID can only contain lowercase letters, numbers, and hyphens",
      ],
      maxlength: [50, "Event ID cannot exceed 50 characters"],
    },

    eventName: {
      type: String,
      required: [true, "Event Name is required"],
      trim: true,
      maxlength: [100, "Event Name cannot exceed 100 characters"],
    },
    eventStartTime: {
      type: Date,
      required: [true, "Event Start Time is required"],
    },
    eventEndTime: {
      type: Date,
      required: [true, "Event End Time is required"],
    },
    eventType: {
      type: String,
      required: false,
    },
    eventPoints: {
      type: Number,
      required: [true, "Event Points is required"],
      min: [0, "Event points cannot be negative"],
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [0, "Duration cannot be negative"],
    },
    eventDescription: {
      type: String,
      required: [true, "Event Description is required"],
      trim: true,
    },
    images: {
      imageBanner: {
        type: String,
        required: false,
      },
      eventImages: [
        {
          type: String,
          required: false,
        },
      ],
    },
    eventStartAnimation: {
      type: String,
      required: false,
    },
    eventEndAnimation: {
      type: String,
      required: false,
    },
    eventStatus: {
      type: String,
      required: [true, "Event Status is required"],
      enum: ["draft", "active", "completed", "cancelled"],
      default: "draft",
    },
    eventVisibility: {
      type: String,
      required: [true, "Event Visibility is required"],
      enum: ["public", "private", "hidden"],
      default: "public",
    },
    hackathonId: {
      type: String,
      required: [true, "Hackathon ID is required"],
    },

    // NEW FIELD 1: Admin can add any type of dynamic content
    adminDynamicContent: {
      type: Schema.Types.Mixed,
      required: false,
      default: {},
      description:
        "Flexible field for admin to store any type of data (objects, arrays, strings, numbers, etc.)",
    },
    htmlComponents: [
      {
        componentName: {
          type: String,
          trim: true,
        },
        componentHtml: {
          type: String,
        },
        componentPosition: {
          type: String,
          enum: [
            "header",
            "footer",
            "sidebar",
            "content-top",
            "content-bottom",
            "modal",
            "custom",
          ],
          default: "content-top",
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        priority: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        targetPages: [
          {
            type: String,
            enum: ["home", "event-page", "registration", "leaderboard", "all"],
            default: "all",
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    action: {
      type: String,
      required: false,
    },
    apiCalls: [
      {
        endpoint: String,
        method: {
          type: String,
          enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        },
        lastCalled: Date,
        callCount: {
          type: Number,
          default: 0,
        },
      },
    ],
    userSeen: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Remove internal fields if needed
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for better query performance
eventSchema.index({ eventId: 1 }, { unique: true });
eventSchema.index({ eventStartTime: 1 });
eventSchema.index({ eventEndTime: 1 });
eventSchema.index({ eventStatus: 1 });
eventSchema.index({ hackathonId: 1 });
eventSchema.index({ "htmlComponents.isActive": 1 });
eventSchema.index({ createdAt: -1 });
// Add compound indexes for better performance
eventSchema.index({ hackathonId: 1, eventStatus: 1 });
eventSchema.index({ eventStatus: 1, eventStartTime: 1 });
eventSchema.index({ eventVisibility: 1, eventStatus: 1 });

// Virtual field to check if event is currently active
eventSchema.virtual("isLive").get(function () {
  const now = new Date();
  return (
    this.eventStatus === "active" &&
    now >= this.eventStartTime &&
    now <= this.eventEndTime
  );
});

// Virtual field to calculate remaining time
eventSchema.virtual("timeRemaining").get(function () {
  if (!this.eventEndTime) return null;
  const now = new Date();
  const endTime = new Date(this.eventEndTime);
  return Math.max(0, endTime - now);
});

// Virtual field to check if registration is open (example logic)
eventSchema.virtual("isActiveEvent").get(function () {
  const now = new Date();
  const startTime = new Date(this.eventStartTime);
  // Assuming registration closes 1 hour before event starts
  const registrationDeadline = new Date(startTime.getTime() - 60 * 60 * 1000);
  return now < registrationDeadline && this.eventStatus === "active";
});

// Pre-save middleware to calculate duration if not provided
eventSchema.pre("save", function (next) {
  if (!this.duration && this.eventStartTime && this.eventEndTime) {
    const start = new Date(this.eventStartTime);
    const end = new Date(this.eventEndTime);
    this.duration = Math.round((end - start) / (1000 * 60)); // duration in minutes
  }

  // Ensure eventId is lowercase
  if (this.eventId) {
    this.eventId = this.eventId.toLowerCase();
  }

  next();
});

// Instance method to get active HTML components for a specific page
eventSchema.methods.getActiveHtmlComponents = function (page = "all") {
  return this.htmlComponents
    .filter((component) => {
      return (
        component.isActive &&
        (component.targetPages.includes(page) ||
          component.targetPages.includes("all") ||
          page === "all")
      );
    })
    .sort((a, b) => b.priority - a.priority);
};

// Static method to find events by type
eventSchema.statics.findByType = function (type) {
  return this.find({ eventType: type });
};

// Static method to find active events
eventSchema.statics.findActiveEvents = function () {
  const now = new Date();
  return this.find({
    eventStatus: "active",
    eventStartTime: { $lte: now },
    eventEndTime: { $gte: now },
  });
};

// Static method to find upcoming events
eventSchema.statics.findUpcomingEvents = function (limit = 10) {
  const now = new Date();
  return this.find({
    eventStatus: "active",
    eventStartTime: { $gt: now },
  })
    .sort({ eventStartTime: 1 })
    .limit(limit);
};

// Static method to add HTML component to event
eventSchema.statics.addHtmlComponent = async function (eventId, componentData) {
  return this.findByIdAndUpdate(
    eventId,
    {
      $push: {
        htmlComponents: {
          ...componentData,
          createdAt: new Date(),
        },
      },
    },
    { new: true }
  );
};

// Static method to update admin dynamic content
eventSchema.statics.updateDynamicContent = async function (
  eventId,
  newContent
) {
  return this.findByIdAndUpdate(
    eventId,
    {
      $set: { adminDynamicContent: newContent },
    },
    { new: true }
  );
};

// Ensure virtual fields are included
eventSchema.set("toObject", { virtuals: true });
eventSchema.set("toJSON", { virtuals: true });

const Event = mongoose.model("Event", eventSchema);
export default Event;
