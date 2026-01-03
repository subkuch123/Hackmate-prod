import express from "express";
import {
  manualTeamFormation,
  manualHackathonCompletion,
  manualHackathonCancellation,
  manualStatusUpdate,
  getHackathonStatus,
} from "../controllers/hackathonScheduler.controller.js";

const hackathonSchedularRouter = express.Router();

// Manual team formation for a specific hackathon
hackathonSchedularRouter.post(
  "/team-formation/:hackathonId",
  manualTeamFormation
);

// Manual hackathon completion for a specific hackathon
hackathonSchedularRouter.post(
  "/complete/:hackathonId",
  manualHackathonCompletion
);

// Manual hackathon cancellation for a specific hackathon
hackathonSchedularRouter.post(
  "/cancel/:hackathonId",
  manualHackathonCancellation
);

// Manual status update for all hackathons
hackathonSchedularRouter.post("/update-statuses", manualStatusUpdate);

// Get hackathon status and eligibility for actions
hackathonSchedularRouter.get("/status/:hackathonId", getHackathonStatus);

export default hackathonSchedularRouter;
