import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";

import errorHandler from "./src/middleware/error.middleware.js";
import connectDB from "./src/config/db.js";

import authRoutes from "./src/routes/auth.route.js";
import testRoutes from "./src/routes/test.route.js";
import expenseRoutes from "./src/routes/expense.route.js";
import incomeRoutes from "./src/routes/income.route.js";
import analyticsRoutes from "./src/routes/analytics.route.js";
import budgetRoutes from "./src/routes/budget.route.js";
import aiRoutes from "./src/routes/ai.route.js";
import chatRoutes from "./src/routes/chat.route.js";
import badgeRoutes from "./src/routes/badge.route.js";
import dashboardRoutes from "./src/routes/dashboard.route.js";
import notificationRoutes from "./src/routes/notification.route.js";

dotenv.config();

const app = express();

/* ---------------- Security ---------------- */

app.use(helmet());

/* ---------------- CORS FIX ---------------- */

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

/* ---------------- Body Parser ---------------- */

app.use(express.json());

/* ---------------- Database ---------------- */

connectDB();

/* ---------------- Routes ---------------- */

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/incomes", incomeRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/insights", analyticsRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);

/* ---------------- Root Route ---------------- */

app.get("/", (req, res) => {
  res.send("Finance Manager API Running 🚀");
});

/* ---------------- Error Handler ---------------- */

app.use(errorHandler);

/* ---------------- Server ---------------- */

const server = http.createServer(app);

/* ---------------- Socket.IO ---------------- */

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

/* ---------------- Socket Events ---------------- */

io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {

    socket.join(`user_${userId}`);

    console.log(`User joined room user_${userId}`);

  });

  socket.on("disconnect", () => {

    console.log("User disconnected:", socket.id);

  });

});

/* ---------------- Port ---------------- */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {

  console.log(`Server running on port ${PORT}`);

});

/* ---------------- Export ---------------- */

export { io };