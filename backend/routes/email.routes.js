// routes/teamRoutes.js
import express from "express";
import emailController from "../controllers/email.controller.js";
const router = express.Router();

// Assign team to single participant
router.post("/assign", emailController.assignTeamAndNotify);

// Assign multiple team members at once
router.post("/assign-multiple", emailController.assignMultipleTeamMembers);

// Check service status
router.get("/status", emailController.getTeamAssignmentStatus);

router.post("/send-bulk", emailController.sendBulkEmails);
router.get("/templates", emailController.getTemplates);
router.post("/templates", emailController.createTemplate);

export default router;
