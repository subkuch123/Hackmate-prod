// models/Registration.js
import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    hackathonId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: String,
    status: {
      type: String,
      enum: ["pending", "registered", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "qrcode", "free"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
      required: true,
    },
    isJoined: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    amount: {
      type: Number,
      required: true,
    },
    whatsapp: String,
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    collegeName: String,
    paymentId: String,
    utrNumber: String,
    screenShot: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique registration per hackathon
registrationSchema.index(
  { hackathonId: 1, email: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true },
  }
);

export default mongoose.model("Registration", registrationSchema);
