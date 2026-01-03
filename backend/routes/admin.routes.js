// routes/admin.routes.js
import express from "express";
// import {
//   manualTeamFormation,
//   manualCompleteHackathon,
//   manualCancelHackathon,
//   manualUpdateHackathonStatus,
// } from "../controllers/teamFormation.controller.js";
// import { authenticate, authorize } from "../middleware/auth.middleware.js";
import {
  addTeamMember,
  dashboardStats,
  getAllTeams,
  getHackathonParticipants,
  getHackathons,
  getHackathonsForFilter,
  getHackathonStats,
  getParticipantById,
  getParticipants,
  getTeamById,
  makeParticipantLeave,
  removeTeamMember,
  searchUsers,
  updateParticipant,
  updateTeam,
} from "../controllers/admin.controller.js";

const router = express.Router();

// All routes require admin authentication
// router.use(authenticate);
// router.use(authorize(["admin"]));

// Manual team formation
// router.post("/hackathons/:hackathonId/form-teams", manualTeamFormation);

// // Manual hackathon completion
// router.post("/hackathons/:hackathonId/complete", manualCompleteHackathon);

// // Manual hackathon cancellation
// router.post("/hackathons/:hackathonId/cancel", manualCancelHackathon);

// Manual status update
// router.patch("/hackathons/:hackathonId/status", manualUpdateHackathonStatus);

// Admin controlller
// Get all participants for a hackathon
router.get("/hackathon/:hackathonId/participants", getHackathonParticipants);

// Get hackathon statistics
router.get("/hackathon/:hackathonId/stats", getHackathonStats);

// Make participant leave hackathon
router.put("/participant/:participantId/leave", makeParticipantLeave);

router.get("/participants", getParticipants);

router.get("/participants/hackathons", getHackathons);

router.get("/participants/:id", getParticipantById);
router.put("/participants/:id", updateParticipant);

router.get("/dashboard", dashboardStats);

router.get("/teams", getAllTeams);
router.get("/teams/hackathons", getHackathonsForFilter);
router.get("/teams/:id", getTeamById);
router.put("/teams/:id", updateTeam);
router.delete("/teams/:teamId/member/:userId", removeTeamMember);
router.post("/teams/:teamId/member", addTeamMember);
router.get("/users/search", searchUsers);

export default router;
