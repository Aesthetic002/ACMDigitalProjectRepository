/**
 * Main Application Entry Point
 *
 * Sets up Express server with middleware and routes.
 * This file only wires routes and middleware - business logic is in route files.
 */

const express = require("express");
const cors = require("cors");
require('dotenv').config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for frontend integration
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware (development)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Import routes - Authentication & User Management (Hemanth)
const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const projectsWriteRoutes = require("./routes/projects.write");

// Import routes - READ Operations & Features (Other Developer)
const projectsReadRoutes = require("./routes/projects.read");
const searchRoutes = require("./routes/search.routes");
const assetsRoutes = require("./routes/assets.routes");
const tagsRoutes = require("./routes/tags.routes");
const eventsRoutes = require("./routes/events.routes");
const adminRoutes = require("./routes/admin.routes");
const commentsRoutes = require("./routes/comments.routes");

// Import routes - Development Only
const testRoutes = require("./routes/test.routes"); // DEVELOPMENT ONLY - Remove in production
const diagnoseRoutes = require("./routes/diagnose.routes"); // DEVELOPMENT ONLY - Remove in production

// Wire routes - Authentication & User Management
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/projects", projectsWriteRoutes);

// Wire routes - READ Operations & Features
app.use("/api/v1/projects", projectsReadRoutes); // GET endpoints
app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/assets", assetsRoutes);
app.use("/api/v1/tags", tagsRoutes);
app.use("/api/v1/events", eventsRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/comments", commentsRoutes);

// Wire routes - Development Only
app.use("/api/v1/test", testRoutes); // DEVELOPMENT ONLY - Remove in production
app.use("/api/v1/diagnose", diagnoseRoutes); // DEVELOPMENT ONLY - Remove in production

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ACM Project Archive Platform - Backend API is running",
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ACM Project Archive Platform API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/v1/auth",
      users: "/api/v1/users",
      projects: "/api/v1/projects",
    },
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "NotFound",
    message: "The requested endpoint does not exist",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  res.status(err.status || 500).json({
    success: false,
    error: err.name || "InternalServerError",
    message: err.message || "An unexpected error occurred",
  });
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 ACM Project Archive Platform - Backend Server`);
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

module.exports = app;
