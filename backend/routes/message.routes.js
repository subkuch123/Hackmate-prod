import express from "express";
import {
  createMessage,
  getTeamMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
  markMessageAsRead,
  getUnreadMessagesCount,
  searchMessages,
  createMessageSingle,
  getAllUserMessages,
  getAllAdminMessages,
  createMessageAdminReply,
} from "../controllers/message.controller.js";
import { adminSpecialAuth, protect } from "../middlewares/auth.js";

const router = express.Router();

// @route   POST /api/messages
// @desc    Create a new message
// @access  Private
router.post("/", createMessage);

// @desc    Create a single admin message for a user in a team
// @route   POST /api/messages/admin/single
// @access  Private (authentication required)
router.post("/admin/single", protect, createMessageSingle);

// @desc    Get all messages for authenticated user (optional team filter)
// @route   GET /api/messages/supportMessages
// @access  Private
router.get("/supportMessages", protect, getAllUserMessages);

// @desc    Get all admin messages
// @route   GET /api/messages/admin
// @access  Private (admin only)
router.get("/admin", adminSpecialAuth, getAllAdminMessages);

// @desc     Admin crate single message for a user
// @route   POST /api/messages/admin/reply
// @access  Private (authentication required)

router.post("/admin/reply", adminSpecialAuth, createMessageAdminReply);

// @route   GET /api/messages/team/:teamId
// @desc    Get all messages for a specific team with pagination
// @access  Private
// Query params: page, limit
router.get("/team/:teamId", getTeamMessages);

// @route   GET /api/messages/search/:teamId
// @desc    Search messages in a team
// @access  Private
// Query params: query, page, limit
router.get("/search/:teamId", searchMessages);

// @route   GET /api/messages/unread/:teamId/:userId
// @desc    Get unread messages count for a user in a team
// @access  Private
router.get("/unread/:teamId/:userId", getUnreadMessagesCount);

// @route   GET /api/messages/:messageId
// @desc    Get a specific message by ID
// @access  Private
router.get("/:messageId", getMessageById);

// @route   PUT /api/messages/:messageId
// @desc    Update a message
// @access  Private
router.put("/:messageId", updateMessage);

// @route   DELETE /api/messages/:messageId
// @desc    Delete a message
// @access  Private
router.delete("/:messageId", deleteMessage);

// @route   POST /api/messages/:messageId/read
// @desc    Mark message as read by a user
// @access  Private
router.post("/:messageId/read", markMessageAsRead);

export default router;
