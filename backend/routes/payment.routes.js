// routes/paymentRoutes.js

import express from "express";
import {
  generateOrderId,
  verifyPayment,
} from "../controllers/payment.controller.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();
router.use(protect);
router.post("/create-order", generateOrderId);
router.post("/verify-payment", verifyPayment);

export default router;
