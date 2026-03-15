/**
 * Search Service Entry Point
 * Port 3004
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
    console.log(`[Search Service] ${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Import routes
const searchRoutes = require("./routes/search.routes");

// Wire routes
app.use("/api/v1/search", searchRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "search-service" });
});

app.use((err, req, res, next) => {
  console.error("Search Service Error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.name || "InternalServerError",
    message: err.message || "An unexpected error occurred",
  });
});

const PORT = process.env.SEARCH_SERVICE_PORT || 3004;
app.listen(PORT, () => {
  console.log(`🔍 Search Service running on port ${PORT}`);
});

module.exports = app;
