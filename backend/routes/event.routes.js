import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  getEventByEventId,
  updateEvent,
  deleteEvent,
  getActiveEvents,
  getUpcomingEvents,
  updateEventStatus,
  addHtmlComponent,
  updateHtmlComponent,
  deleteHtmlComponent,
  updateDynamicContent,
  getEventsByHackathon,
  getEventsByType,
  searchEvents,
  recordApiCall,
  markAsSeen,
  bulkUpdateEvents,
  getEventStats,
} from "../controllers/event.controller.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// router.use(protect);

// Validation middleware (optional - you can add more validation)
const validateEvent = (req, res, next) => {
  const { eventStartTime, eventEndTime } = req.body;

  if (eventStartTime && eventEndTime) {
    const start = new Date(eventStartTime);
    const end = new Date(eventEndTime);

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: "Event start time must be before end time",
      });
    }
  }

  next();
};

// CRUD Operations
router.post("/", validateEvent, createEvent); // Create new event
router.get("/", getAllEvents); // Get all events with filters
router.get("/search", searchEvents); // Search events
router.get("/stats", getEventStats); // Get event statistics

// Single event operations by MongoDB _id
router.get("/:id", getEventById); // Get event by ID
router.put("/:id", validateEvent, updateEvent); // Update event by ID
router.delete("/:id", deleteEvent); // Delete event by ID

// Event by eventId (slug)
router.get("/slug/:eventId", getEventByEventId); // Get event by eventId

// Status management
router.patch("/:id/status", updateEventStatus); // Update event status

// Special queries
router.get("/hackathon/active", getActiveEvents); // Get active events
router.get("/hackathon/upcoming", getUpcomingEvents); // Get upcoming events
router.get("/hackathon/:hackathonId", getEventsByHackathon); // Get events by hackathon
router.get("/type/:type", getEventsByType); // Get events by type

// HTML Components management
router.post("/:id/html-components", addHtmlComponent); // Add HTML component
router.put("/:id/html-components/:componentId", updateHtmlComponent); // Update HTML component
router.delete("/:id/html-components/:componentId", deleteHtmlComponent); // Delete HTML component

// Dynamic content
router.put("/:id/dynamic-content", updateDynamicContent); // Update admin dynamic content

// API tracking
router.post("/:id/api-calls", recordApiCall); // Record API call

// User interactions
router.post("/:id/seen", markAsSeen); // Mark event as seen by user

// Bulk operations
router.post("/bulk/update", bulkUpdateEvents); // Bulk update events

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Event routes are working",
    timestamp: new Date().toISOString(),
  });
});

export default router;
