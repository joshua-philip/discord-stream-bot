const config = require("../../config/config");
const { logger } = require("../../utils/logger");
const fs = require("fs");
const path = require("path");

/**
 * Middleware to validate the secret key in requests
 */
function validateSecret(req, res, next) {
  const { secret } = req.body;

  // Check if the secret matches
  if (secret !== config.api.secretKey) {
    // Log the unauthorized access attempt
    const logData = {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      path: req.path,
      method: req.method,
      headers: req.headers,
      body: { ...req.body, secret: "[REDACTED]" }, // Don't log the attempted secret
    };

    // Write to exploit attempts log file
    const logFilePath = path.join(__dirname, "../../logs/exploit_attempts.log");
    fs.appendFileSync(logFilePath, JSON.stringify(logData, null, 2) + ",\n");

    // Log the attempt
    logger.warn(
      `Unauthorized API access attempt from ${req.ip} to ${req.method} ${req.path}`
    );

    // Return forbidden response
    return res.status(403).json({
      status: "error",
      message: "Forbidden",
    });
  }

  // If the secret is valid, continue to the next middleware or route handler
  next();
}

module.exports = { validateSecret };
