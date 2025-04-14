/**
 * Utility functions for formatting data
 */

/**
 * Format a duration in milliseconds to a human-readable string
 * @param {number} ms Duration in milliseconds
 * @returns {string} Formatted duration
 */
function formatDuration(ms) {
  if (!ms || isNaN(ms) || ms < 0) return "0 seconds";

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const remainingHours = hours % 24;
  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;

  const parts = [];

  if (days > 0) {
    parts.push(`${days} day${days === 1 ? "" : "s"}`);
  }

  if (remainingHours > 0) {
    parts.push(`${remainingHours} hour${remainingHours === 1 ? "" : "s"}`);
  }

  if (remainingMinutes > 0) {
    parts.push(
      `${remainingMinutes} minute${remainingMinutes === 1 ? "" : "s"}`
    );
  }

  if (remainingSeconds > 0 && parts.length < 2) {
    parts.push(
      `${remainingSeconds} second${remainingSeconds === 1 ? "" : "s"}`
    );
  }

  return parts.join(", ");
}

/**
 * Format hours from milliseconds
 * @param {number} ms Duration in milliseconds
 * @param {number} precision Number of decimal places
 * @returns {string} Formatted hours
 */
function formatHours(ms, precision = 2) {
  const hours = ms / (1000 * 60 * 60);
  return hours.toFixed(precision);
}

/**
 * Format a date to a human-readable string
 * @param {Date|string|number} date Date to format
 * @returns {string} Formatted date
 */
function formatDate(date) {
  if (!date) return "Unknown";

  const dateObj = new Date(date);

  return dateObj.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format a timestamp to a relative time string (e.g., "5 minutes ago")
 * @param {Date|string|number} timestamp Timestamp to format
 * @returns {string} Relative time string
 */
function formatRelativeTime(timestamp) {
  if (!timestamp) return "Unknown";

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;

  // If in the future, return the formatted date
  if (diffMs < 0) {
    return formatDate(date);
  }

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (years > 0) {
    return `${years} year${years === 1 ? "" : "s"} ago`;
  } else if (months > 0) {
    return `${months} month${months === 1 ? "" : "s"} ago`;
  } else if (days > 0) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  } else {
    return `${seconds} second${seconds === 1 ? "" : "s"} ago`;
  }
}

/**
 * Format a number with commas as thousands separators
 * @param {number} num Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

module.exports = {
  formatDuration,
  formatHours,
  formatDate,
  formatRelativeTime,
  formatNumber,
};
