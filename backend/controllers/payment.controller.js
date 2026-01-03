import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/order.model.js";
import Registration from "../models/Registration.js";
import Hackathon from "../models/hackthon.model.js"; // make sure this exists
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const router = express.Router();

// 🧩 Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RZP_KEY_ID,
  key_secret: process.env.RZP_KEY_SECRET,
});

// 🧾 Generate new order ID (Razorpay + save in DB)
export const generateOrderId = async (req, res) => {
  const session = await Order.startSession();
  session.startTransaction();

  try {
    const {
      amount,
      currency = "INR",
      name,
      email,
      contact,
      hackathonId,
      whatsapp,
      paymentMethod,
    } = req.body;

    // 🔹 Step 1: Mark all existing active orders for this email as inactive
    await Order.updateMany(
      { email, isActive: true },
      { $set: { isActive: false } }
    );

    // 🔹 Step 2: Create new Razorpay order
    const options = {
      amount: amount * 100,
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };
    const razorpayOrder = await razorpay.orders.create(options);

    // 🔹 Step 3: Save new order in DB
    const dbOrder = await Order.create(
      [
        {
          order_id: razorpayOrder.id,
          amount,
          currency,
          name,
          email,
          contact,
          whatsapp,
          status: "created",
          isActive: true,
        },
      ],
      { session }
    );

    // 🔹 Step 4: Verify hackathon exists
    const hackathon = await Hackathon.findOne({ hackathonId: hackathonId });
    if (!hackathon) {
      throw new Error("Hackathon not found");
    }

    await Registration.updateMany(
      { email, hackathonId },
      { $set: { isActive: false } }
    );

    // 🔹 Step 5: Save registration
    await Registration.create(
      [
        {
          hackathonId,
          email,
          name,
          phone: contact,
          paymentMethod,
          amount,
          orderId: dbOrder[0]._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Order created successfully",
      order: razorpayOrder,
      dbOrder: dbOrder[0],
    });
  } catch (error) {
    console.error("❌ Error generating order:", error);
    await session.abortTransaction();

    // Mark last attempted order (if any) as inactive
    if (req.body.email) {
      await Order.updateMany(
        { email: req.body.email },
        { $set: { isActive: false } }
      );
    }

    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

// ✅ Verify Razorpay Payment Signature
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const hmac = crypto.createHmac("sha256", process.env.RZP_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature === razorpay_signature) {
      const order = await Order.findOneAndUpdate(
        { order_id: razorpay_order_id },
        {
          status: "paid",
          payment_id: razorpay_payment_id,
          signature: razorpay_signature,
          isActive: true,
        },
        { new: true }
      );

      await Registration.findOneAndUpdate(
        { orderId: order._id, email: order.email },
        {
          status: "registered",
          paymentId: razorpay_payment_id,
          // isVerified: true,
          isActive: true,
        }
      );

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        order,
      });
    } else {
      await Order.findOneAndUpdate(
        { order_id: razorpay_order_id },
        { status: "failed", isActive: false }
      );

      return res.status(400).json({
        success: false,
        message: "Invalid signature, verification failed",
      });
    }
  } catch (error) {
    console.error("❌ Error verifying payment:", error);

    if (req.body?.razorpay_order_id) {
      await Order.findOneAndUpdate(
        { order_id: req.body.razorpay_order_id },
        { status: "failed", isActive: false }
      );
    }

    res.status(500).json({ success: false, message: error.message });
  }
};

export default router;
