/**
 * Project Service Entry Point
 * Port 3002
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
    console.log(`[Project Service] ${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Import routes
const projectsReadRoutes = require("./routes/projects.read");
const projectsWriteRoutes = require("./routes/projects.write");
const adminRoutes = require("./routes/admin.routes");
const tagsRoutes = require("./routes/tags.routes");

// Wire routes
app.use("/api/v1/projects", projectsWriteRoutes);
app.use("/api/v1/projects", projectsReadRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/tags", tagsRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "project-service" });
});

app.use((err, req, res, next) => {
  console.error("Project Service Error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.name || "InternalServerError",
    message: err.message || "An unexpected error occurred",
  });
});

const PORT = process.env.PROJECT_SERVICE_PORT || 3002;
app.listen(PORT, () => {
  console.log(`📂 Project Service running on port ${PORT}`);
});

module.exports = app;
