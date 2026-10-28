export const PERMS = {
  admin: 'Administrator', send: 'Send messages', connect: 'Join voice',
  manage_channels: 'Manage channels', manage_roles: 'Manage roles',
  manage_messages: 'Manage messages', kick: 'Kick members',
};
// The owner and Administrators pass every check; otherwise any of the member's roles may grant it.
export function can(server, userId, perm) {
  if (server.ownerId === userId) return true;
  const roles = ['everyone', ...(server.members[userId] || [])];
  return server.roles.some(r => roles.includes(r.id) && (r.perms.includes('admin') || r.perms.includes(perm)));
}
export const topRole = (server, userId) =>
  [...server.roles].reverse().find(r => (server.members[userId] || []).includes(r.id));
