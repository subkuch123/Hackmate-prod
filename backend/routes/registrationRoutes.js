// routes/registrationRoutes.js
import express from "express";
import Registration from "../models/Registration.js";
import Order from "../models/order.model.js";
import {
  freeRegistration,
  getRegistrations,
  joinUserIntoHackathon,
  qrRegistrationUpload,
  updateRegistration,
} from "../controllers/registration.controller.js";
import multer from "multer";
const registrationRouter = express.Router();
const upload = multer({ dest: "uploads/" });
// Check registration status
registrationRouter.get("/status", async (req, res) => {
  try {
    const { hackathonId, email } = req.query;

    // ✅ Check for active registration (latest one)
    const registration = await Registration.findOne({
      hackathonId,
      email,
      isActive: true, // only active registrations
    }).sort({ updatedAt: -1 }); // get the most recently updated or created

    if (registration) {
      return res.json({
        success: true,
        data: {
          status: registration.status,
          registeredAt: registration.createdAt,
          updatedAt: registration.updatedAt,
        },
      });
    }

    // ✅ Check for pending payments (latest one)
    const pendingOrder = await Order.findOne({
      hackathonId,
      email,
      status: { $in: ["created", "pending"] },
    }).sort({ updatedAt: -1 });

    if (pendingOrder) {
      let status = "pending_payment";
      let message = "Complete your payment to register";

      if (
        pendingOrder.status === "created" &&
        pendingOrder.paymentMethod === "qrcode"
      ) {
        status = "pending_verification";
        message = "Payment verification in progress";
      }

      return res.json({
        success: true,
        data: {
          status,
          orderId: pendingOrder._id,
          paymentMethod: pendingOrder.paymentMethod,
          message,
          createdAt: pendingOrder.createdAt,
          updatedAt: pendingOrder.updatedAt,
        },
      });
    }

    // ✅ Check for failed payments (latest one)
    const failedOrder = await Order.findOne({
      hackathonId,
      email,
      status: "failed",
    }).sort({ updatedAt: -1 });

    if (failedOrder) {
      return res.json({
        success: true,
        data: {
          status: "payment_failed",
          orderId: failedOrder._id,
          message: "Payment failed. Please try again.",
          createdAt: failedOrder.createdAt,
          updatedAt: failedOrder.updatedAt,
        },
      });
    }

    // ✅ Not registered
    res.json({
      success: true,
      data: { status: "not_registered" },
    });
  } catch (error) {
    console.error("Status check error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check registration status",
    });
  }
});

registrationRouter.get("/registration", getRegistrations);
registrationRouter.put("/update/:id", updateRegistration);

// frontend sends FormData with field name "screenshot"
registrationRouter.post(
  "/qr-payment",
  upload.single("screenshot"),
  qrRegistrationUpload
);
registrationRouter.post("/join/:registrationId", joinUserIntoHackathon);


registrationRouter.post(
  "/free",
  freeRegistration
);
export default registrationRouter;
