const config = require("../config/config");

/**
 * Check if a member has permissions for a command
 * @param {import('discord.js').GuildMember} member The guild member
 * @param {Object} requiredPermissions The permissions required
 * @returns {boolean} Whether the member has permissions
 */
function checkPermissions(member, requiredPermissions) {
  // If no permissions are required, allow everyone
  if (!requiredPermissions) return true;

  const { roles = [], users = [], defaultAdmin = false } = requiredPermissions;

  // Check if the user is a Discord administrator
  if (defaultAdmin && member.permissions.has("Administrator")) {
    return true;
  }

  // Check if user is in the allowed users list
  if (
    users.includes("OWNER") &&
    config.discord.adminUsers.includes(member.id)
  ) {
    return true;
  }

  if (
    users.includes("ADMIN") &&
    config.discord.adminUsers.includes(member.id)
  ) {
    return true;
  }

  // Check for specific user IDs
  if (users.some((userId) => userId === member.id)) {
    return true;
  }

  // Check if user has any of the admin roles
  if (
    roles.includes("ADMIN") &&
    member.roles.cache.some((role) =>
      config.discord.adminRoles.includes(role.id)
    )
  ) {
    return true;
  }

  // Check if user has any of the moderator roles
  if (
    roles.includes("MODERATOR") &&
    member.roles.cache.some((role) =>
      config.discord.adminRoles.includes(role.id)
    )
  ) {
    return true;
  }

  // Check if user has the streamer role
  if (
    roles.includes("STREAMER") &&
    member.roles.cache.has(config.discord.roles.streaming)
  ) {
    return true;
  }

  // Check for specific role IDs
  if (roles.some((roleId) => member.roles.cache.has(roleId))) {
    return true;
  }

  // If we get here, the user doesn't have permission
  return false;
}

module.exports = { checkPermissions };
