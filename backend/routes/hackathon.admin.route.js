import express from "express";
import {
  getHackathons,
  getHackathonById,
  getHackathonStats,
  updateHackathon,
  bulkUpdateHackathons,
} from "../controllers/hackathon.admin.controller.js";

const router = express.Router();

// GET routes
router.get("/", getHackathons);
router.get("/stats", getHackathonStats);
router.get("/:id", getHackathonById);

// UPDATE routes
router.put("/:id", updateHackathon);
router.put("/bulk/update", bulkUpdateHackathons);

export default router;
