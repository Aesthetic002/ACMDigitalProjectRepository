/**
 * User & Auth Service Entry Point
 * Port 3001
 */

const express = require("express");
const cors = require("cors");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`[User Service] ${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Import routes
const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");

// Wire routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", usersRoutes);

// Development-only test & diagnostic routes
if (process.env.NODE_ENV !== "production") {
  const testRoutes = require("./routes/test.routes");
  const diagnoseRoutes = require("./routes/diagnose.routes");
  app.use("/api/v1/test", testRoutes);
  app.use("/api/v1/diagnose", diagnoseRoutes);
}

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "user-service" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("User Service Error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.name || "InternalServerError",
    message: err.message || "An unexpected error occurred",
  });
});

const PORT = process.env.USER_SERVICE_PORT || 3001;
app.listen(PORT, () => {
  console.log(`👤 User Service running on port ${PORT}`);
});

module.exports = app;
