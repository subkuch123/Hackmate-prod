// models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // Razorpay order details
    order_id: String,
    amount: Number,
    currency: {
      type: String,
      default: "INR",
    },

    // Hackathon context
    hackathonId: String,
    hackathonName: String,

    // User details
    name: String,
    email: String,
    contact: String,
    whatsapp: String,

    // Payment details
    status: {
      type: String,
      enum: ["created", "paid", "failed", "pending"],
      default: "created",
    },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "qrcode"],
    },
    payment_id: String,
    signature: String,

    // QR Code specific
    utrNumber: String,
    screenshot: String,

    // Verification
    isActive: {
      type: Boolean,
      default: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationNotes: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", orderSchema);
