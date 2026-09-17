/**
 * Non-secret business-rule constants. Configurable via env vars so the
 * limit can be tuned per environment without a code change, but safe
 * defaults are provided since these aren't sensitive values.
 */

// Maximum number of members (including the leader) a student group may have.
const GROUP_MAX_MEMBERS = Number(process.env.GROUP_MAX_MEMBERS) || 4;

module.exports = { GROUP_MAX_MEMBERS };
