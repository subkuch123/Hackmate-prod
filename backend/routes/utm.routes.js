import { isTrackingEnabled } from "../utils/isTrackingEnabled.js";

// routes/track.js
import express from "express";
import { UAParser } from "ua-parser-js";
import geoip from "geoip-lite";
import crypto from "crypto";
import Visitor from "../models/TempUser.model.js";

const router = express.Router();

router.post("/", async (req, res) => {
  if (!(await isTrackingEnabled())) {
    return res.status(204).end(); // silently ignore
  }

  const { visitorId, path, referrer, userAgent, language, screen, utm } =
    req.body;

  const parser = new UAParser(userAgent);
  const device = parser.getResult();
  console.log("Device info:", device);
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

  const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

  const geo = geoip.lookup(ip);

  await Visitor.updateOne(
    { visitorId },
    {
      $setOnInsert: {
        visitorId,
        ipHash,
        location: geo ? { country: geo.country, city: geo.city } : {},
        device,
        firstVisit: new Date(),

        // ⏱ delete after 30 days
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      $push: {
        pages: {
          path,
          referrer,
          utm,
          visitedAt: new Date(),
        },
      },
      $set: { lastActive: new Date() },
    },
    { upsert: true }
  );

  res.status(200).json({ success: true });
});

export default router;
