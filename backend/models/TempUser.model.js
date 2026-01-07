import mongoose from "mongoose";

const PageSchema = new mongoose.Schema({
  path: String,
  referrer: String,
  utm: Object,
  visitedAt: Date,
});

const TempUserSchema = new mongoose.Schema({
  visitorId: { type: String, index: true },

  ipHash: String,

  location: {
    country: String,
    city: String,
  },

  device: {
    type: mongoose.Schema.Types.Mixed,
  },

  pages: [PageSchema],

  firstVisit: Date,
  lastActive: Date,

  // 🔥 TTL FIELD
  expiresAt: {
    type: Date,
    index: { expires: "30d" }, // ⏱ auto-delete after 30 days
  },

  consent: {
    analytics: { type: Boolean, default: true },
  },
});

export default mongoose.model("TempUser", TempUserSchema);
