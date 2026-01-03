import Event from "../models/event.model.js";
import mongoose from "mongoose";

// Utility function for error handling
const handleError = (res, error, message = "An error occurred") => {
  console.error(error);
  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: Object.values(error.errors).map((err) => err.message),
    });
  }
  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate key error",
      errors: ["An event with this identifier already exists"],
    });
  }
  return res.status(500).json({
    success: false,
    message,
    error: error.message,
  });
};

// Create a new event
export const createEvent = async (req, res) => {
  try {
    const eventData = req.body;

    // Validate required fields
    if (!eventData.eventId || !eventData.eventName) {
      return res.status(400).json({
        success: false,
        message: "Event ID and Event Name are required",
      });
    }

    // Check if event with same eventId already exists
    const existingEvent = await Event.findOne({ eventId: eventData.eventId });
    if (existingEvent) {
      return res.status(409).json({
        success: false,
        message: "Event with this ID already exists",
      });
    }

    // Create new event
    const event = new Event(eventData);
    await event.save();

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    handleError(res, error, "Failed to create event");
  }
};

// Get all events with filtering, sorting, and pagination
export const getAllEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "-createdAt",
      status,
      visibility,
      hackathonId,
      eventType,
      search,
      startDate,
      endDate,
    } = req.query;

    // Build query
    const query = {};

    // Status filter
    if (status) {
      query.eventStatus = { $in: status.split(",") };
    }

    // Visibility filter
    if (visibility) {
      query.eventVisibility = visibility;
    }

    // Hackathon filter
    if (hackathonId) {
      query.hackathonId = hackathonId;
    }

    // Event type filter
    if (eventType) {
      query.eventType = eventType;
    }

    // Date range filter
    if (startDate || endDate) {
      query.eventStartTime = {};
      if (startDate) {
        query.eventStartTime.$gte = new Date(startDate);
      }
      if (endDate) {
        query.eventStartTime.$lte = new Date(endDate);
      }
    }

    // Search filter
    if (search) {
      query.$or = [
        { eventName: { $regex: search, $options: "i" } },
        { eventId: { $regex: search, $options: "i" } },
        { eventDescription: { $regex: search, $options: "i" } },
      ];
    }

    // Parse sort parameter
    const sortOptions = {};
    if (sort) {
      const sortFields = sort.split(",");
      sortFields.forEach((field) => {
        const sortOrder = field.startsWith("-") ? -1 : 1;
        const sortField = field.replace(/^-/, "");
        sortOptions[sortField] = sortOrder;
      });
    }

    // Execute query with pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [events, total] = await Promise.all([
      Event.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(), // Use lean() for better performance
      Event.countDocuments(query),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      message: "Events retrieved successfully",
      data: events,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    handleError(res, error, "Failed to retrieve events");
  }
};

// Get single event by ID
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event retrieved successfully",
      data: event,
    });
  } catch (error) {
    handleError(res, error, "Failed to retrieve event");
  }
};

// Get event by eventId (slug)
export const getEventByEventId = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findOne({ eventId: eventId.toLowerCase() });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event retrieved successfully",
      data: event,
    });
  } catch (error) {
    handleError(res, error, "Failed to retrieve event");
  }
};

// Update event
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    // If eventId is being updated, check for duplicates
    if (updateData.eventId) {
      updateData.eventId = updateData.eventId.toLowerCase();
      const existingEvent = await Event.findOne({
        eventId: updateData.eventId,
        _id: { $ne: id },
      });

      if (existingEvent) {
        return res.status(409).json({
          success: false,
          message: "Event with this ID already exists",
        });
      }
    }

    const event = await Event.findByIdAndUpdate(id, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Run model validators
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: event,
    });
  } catch (error) {
    handleError(res, error, "Failed to update event");
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
      data: { id: event._id, eventId: event.eventId },
    });
  } catch (error) {
    handleError(res, error, "Failed to delete event");
  }
};

// Get active events (using custom static method)
export const getActiveEvents = async (req, res) => {
  try {
    const events = await Event.findActiveEvents();

    res.status(200).json({
      success: true,
      message: "Active events retrieved successfully",
      count: events.length,
      data: events,
    });
  } catch (error) {
    handleError(res, error, "Failed to retrieve active events");
  }
};

// Get upcoming events
export const getUpcomingEvents = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const events = await Event.findUpcomingEvents(limit);

    res.status(200).json({
      success: true,
      message: "Upcoming events retrieved successfully",
      count: events.length,
      data: events,
    });
  } catch (error) {
    handleError(res, error, "Failed to retrieve upcoming events");
  }
};

// Update event status
export const updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["draft", "active", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
        validStatuses,
      });
    }

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    const event = await Event.findByIdAndUpdate(
      id,
      { eventStatus: status },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Event status updated to ${status}`,
      data: event,
    });
  } catch (error) {
    handleError(res, error, "Failed to update event status");
  }
};

// Add HTML component to event
export const addHtmlComponent = async (req, res) => {
  try {
    const { id } = req.params;
    const componentData = req.body;

    // Validate required fields
    if (!componentData.componentName || !componentData.componentHtml) {
      return res.status(400).json({
        success: false,
        message: "Component name and HTML are required",
      });
    }

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    const event = await Event.addHtmlComponent(id, componentData);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "HTML component added successfully",
      data: event.htmlComponents.slice(-1)[0], // Return the newly added component
    });
  } catch (error) {
    handleError(res, error, "Failed to add HTML component");
  }
};

// Update HTML component
export const updateHtmlComponent = async (req, res) => {
  try {
    const { id, componentId } = req.params;
    const updateData = req.body;

    // Check if IDs are valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(componentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid component ID format",
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Find the component index
    const componentIndex = event.htmlComponents.findIndex(
      (comp) => comp._id.toString() === componentId
    );

    if (componentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "HTML component not found",
      });
    }

    // Update component
    event.htmlComponents[componentIndex] = {
      ...event.htmlComponents[componentIndex].toObject(),
      ...updateData,
    };

    await event.save();

    res.status(200).json({
      success: true,
      message: "HTML component updated successfully",
      data: event.htmlComponents[componentIndex],
    });
  } catch (error) {
    handleError(res, error, "Failed to update HTML component");
  }
};

// Delete HTML component
export const deleteHtmlComponent = async (req, res) => {
  try {
    const { id, componentId } = req.params;

    // Check if IDs are valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    const event = await Event.findByIdAndUpdate(
      id,
      {
        $pull: { htmlComponents: { _id: componentId } },
      },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "HTML component deleted successfully",
    });
  } catch (error) {
    handleError(res, error, "Failed to delete HTML component");
  }
};

// Update admin dynamic content
export const updateDynamicContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    const event = await Event.updateDynamicContent(id, content);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Dynamic content updated successfully",
      data: event.adminDynamicContent,
    });
  } catch (error) {
    handleError(res, error, "Failed to update dynamic content");
  }
};

// Get events by hackathon
export const getEventsByHackathon = async (req, res) => {
  try {
    const { hackathonId } = req.params;
    const { status, visibility } = req.query;

    const query = { hackathonId };

    if (status) {
      query.eventStatus = status;
    }

    if (visibility) {
      query.eventVisibility = visibility;
    }

    const events = await Event.find(query).sort({ eventStartTime: 1 });

    res.status(200).json({
      success: true,
      message: "Events retrieved successfully",
      count: events.length,
      data: events,
    });
  } catch (error) {
    handleError(res, error, "Failed to retrieve events by hackathon");
  }
};

// Get events by type (using custom static method)
export const getEventsByType = async (req, res) => {
  try {
    const { type } = req.params;

    const events = await Event.findByType(type);

    res.status(200).json({
      success: true,
      message: "Events retrieved successfully",
      count: events.length,
      data: events,
    });
  } catch (error) {
    handleError(res, error, "Failed to retrieve events by type");
  }
};

// Search events
export const searchEvents = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters long",
      });
    }

    const events = await Event.find({
      $or: [
        { eventName: { $regex: q, $options: "i" } },
        { eventId: { $regex: q, $options: "i" } },
        { eventDescription: { $regex: q, $options: "i" } },
        { hackathonId: { $regex: q, $options: "i" } },
      ],
    }).limit(20);

    res.status(200).json({
      success: true,
      message: "Search completed",
      count: events.length,
      query: q,
      data: events,
    });
  } catch (error) {
    handleError(res, error, "Failed to search events");
  }
};

// Record API call
export const recordApiCall = async (req, res) => {
  try {
    const { id } = req.params;
    const { endpoint, method = "GET" } = req.body;

    if (!endpoint) {
      return res.status(400).json({
        success: false,
        message: "Endpoint is required",
      });
    }

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    const event = await Event.findByIdAndUpdate(
      id,
      {
        $push: {
          apiCalls: {
            endpoint,
            method,
            lastCalled: new Date(),
            callCount: 1,
          },
        },
      },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "API call recorded",
    });
  } catch (error) {
    handleError(res, error, "Failed to record API call");
  }
};

// Mark event as seen by user
export const markAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    const event = await Event.findByIdAndUpdate(
      id,
      {
        $addToSet: { userSeen: userId }, // Add unique user ID
      },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event marked as seen",
      seenCount: event.userSeen.length,
    });
  } catch (error) {
    handleError(res, error, "Failed to mark event as seen");
  }
};

// Bulk update events
export const bulkUpdateEvents = async (req, res) => {
  try {
    const { ids, updateData } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Event IDs array is required",
      });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Update data is required",
      });
    }

    // Validate all IDs
    const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid event IDs found",
        invalidIds,
      });
    }

    const result = await Event.updateMany(
      { _id: { $in: ids } },
      { $set: updateData }
    );

    res.status(200).json({
      success: true,
      message: "Bulk update completed",
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    handleError(res, error, "Failed to perform bulk update");
  }
};

// Get event statistics
export const getEventStats = async (req, res) => {
  try {
    const { hackathonId } = req.query;

    const query = {};
    if (hackathonId) {
      query.hackathonId = hackathonId;
    }

    const stats = await Event.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$eventStatus",
          count: { $sum: 1 },
          totalPoints: { $sum: "$eventPoints" },
          avgDuration: { $avg: "$duration" },
        },
      },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: "$count" },
          statusStats: {
            $push: {
              status: "$_id",
              count: "$count",
              totalPoints: "$totalPoints",
              avgDuration: "$avgDuration",
            },
          },
          avgPoints: { $avg: "$totalPoints" },
        },
      },
      {
        $project: {
          _id: 0,
          totalEvents: 1,
          statusStats: 1,
          avgPoints: { $round: ["$avgPoints", 2] },
        },
      },
    ]);

    // Get upcoming and active counts
    const [upcomingCount, activeCount] = await Promise.all([
      Event.countDocuments({
        ...query,
        eventStatus: "active",
        eventStartTime: { $gt: new Date() },
      }),
      Event.countDocuments({
        ...query,
        eventStatus: "active",
        eventStartTime: { $lte: new Date() },
        eventEndTime: { $gte: new Date() },
      }),
    ]);

    res.status(200).json({
      success: true,
      message: "Event statistics retrieved",
      data: {
        ...(stats[0] || {}),
        upcomingCount,
        activeCount,
      },
    });
  } catch (error) {
    handleError(res, error, "Failed to get event statistics");
  }
};
