import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import bodyParser from "body-parser";
import config from "./config/config.js";
import http from "http";
import connectDB from "./config/db.js";
import logger from "./utils/logger.js";
import compression from "compression";
import errorHandler from "./middlewares/error.js";
import authRouter from "./routes/auth.routes.js";
import webSocketService from "./services/websocket.service.js";
import hackathonRouter from "./routes/hackthon.routes.js";
import teamRouter from "./routes/team.routes.js";
import messageRouter from "./routes/message.routes.js";
import registrationRouter from "./routes/registrationRoutes.js";
import paymentRoutes from "./routes/payment.routes.js";
// Required for __dirname in ES modules
import { fileURLToPath } from "url";
import { dirname } from "path";
import { startScheduler } from "./utils/schedular.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { configCloudinary } from "./utils/uploadImage.js";
// Init express app
const app = express();
const server = http.createServer(app);

// Connect to database
connectDB();
configCloudinary();
// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.json());

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan("combined", { stream: logger.stream }));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    data: { message: "API is running" },
    message: "Welcome to the API",
    errorCode: 0,
  });
});

app.use("/api/user", authRouter);
app.use("/api/hackathons", hackathonRouter);
app.use("/api/payments", paymentRoutes);
app.use("/api/teams", teamRouter);
app.use("/api/messages", messageRouter);
app.use("/api/registrations", registrationRouter);
app.use("/api/admin", (await import("./routes/admin.routes.js")).default);
app.use("/api/page", (await import("./routes/page.routes.js")).default);
app.use(
  "/api/hackathon-scheduler",
  (await import("./routes/hackathonScheduler.routes.js")).default
);
app.use(
  "/api/admin/hackathons",
  (await import("./routes/hackathon.admin.route.js")).default
);
app.use("/api/emails", (await import("./routes/email.routes.js")).default);
app.use(
  "/api/admin/notifications",
  (await import("./routes/notification.routes.js")).default
);
app.use("/api/events", (await import("./routes/event.routes.js")).default);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    data: null,
    message: `Route not found: ${req.originalUrl}`,
    errorCode: 3, // NOT_FOUND
  });
});

// Error handler middleware
app.use(errorHandler);

// Start server
const PORT = config.server.port;
server.listen(PORT, "0.0.0.0", () => {
  logger.info(`Server running in ${config.NODE_ENV} mode on port ${PORT}`);
});

// WebSocket service
webSocketService.initialize(server);

// Graceful shutdown
process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Export app and server
export { app, server };
