/**
 * Asset Service Entry Point
 * Port 3003
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
    console.log(`[Asset Service] ${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Import routes
const assetsRoutes = require("./routes/assets.routes");

// Wire routes
app.use("/api/v1/assets", assetsRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "asset-service" });
});

app.use((err, req, res, next) => {
  console.error("Asset Service Error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.name || "InternalServerError",
    message: err.message || "An unexpected error occurred",
  });
});

const PORT = process.env.ASSET_SERVICE_PORT || 3003;
app.listen(PORT, () => {
  console.log(`🖼️  Asset Service running on port ${PORT}`);
});

module.exports = app;
