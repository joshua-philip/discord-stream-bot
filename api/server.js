// API Server for FiveM integration
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { logger } = require("../utils/logger");
const config = require("../config/config");
const fs = require("fs");
const path = require("path");

// Import routes
const playerRoute = require("./routes/playerRoute");

// Create Express app
const app = express();

// Security middleware
app.use(helmet()); // Adds security headers
app.use(express.json()); // Parse JSON bodies

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again later.",
});

// Apply rate limiting to all API routes
app.use("/api/", apiLimiter);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Register routes
app.use("/api/player", playerRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Endpoint not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error("API Error:", err);

  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal server error",
  });
});

// Start the API server
async function startAPIServer() {
  return new Promise((resolve, reject) => {
    try {
      const server = app.listen(config.api.port, () => {
        logger.info(`API server listening on port ${config.api.port}`);
        resolve(server);
      });

      server.on("error", (error) => {
        logger.error("API server error:", error);
        reject(error);
      });
    } catch (error) {
      logger.error("Failed to start API server:", error);
      reject(error);
    }
  });
}

module.exports = { startAPIServer, app };
