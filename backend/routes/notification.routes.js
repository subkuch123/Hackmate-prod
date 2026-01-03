import express from "express";
import {
  createNotification,
  getUserNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
  getNotificationStats,
  removeNotificationForUser,
  getUserNotificationsAll,
  updateNotification,
  getLatestActiveNotification,
} from "../controllers/notification.controller.js";

// Middleware imports (you'll need to create these or use your existing ones)
// import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (none - all notifications require authentication)

// Protected routes (all routes below require authentication)
// router.use(protect);

// User notification routes
router.get("/", getUserNotifications);
router.get("/userNotification", getLatestActiveNotification);
router.get("/all", getUserNotificationsAll);
router.get("/unread/count", getUnreadCount);
router.put("/read-all", markAllAsRead);
router.get("/:id", getNotificationById);
router.put("/:id/read", markAsRead);
router.delete("/:id/user", removeNotificationForUser);

// Admin only routes
router.post("/", createNotification); // Only admins can create notifications
router.delete("/:id", deleteNotification); // Only admins can delete notifications globally
router.get("/admin/stats", getNotificationStats); // Admin statistics

router.put(
  "/:id",
  // protect,
  // isAdmin,
  updateNotification
);

export default router;
