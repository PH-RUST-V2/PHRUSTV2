import { user } from '../core/store.js';
import { topRole } from '../core/permissions.js';
import { esc } from '../core/util.js';
import { avatar } from './sidebar.js';
export const membersHtml = srv => {
  const groups = {};
  Object.keys(srv.members).forEach(id => { const r = topRole(srv, id); (groups[r?.id || 'everyone'] ||= []).push(id); });
  const order = [...srv.roles].reverse().filter(r => groups[r.id]);
  return `<aside class="members">${order.map(r => `<div class="cat">${esc(r.id === 'everyone' ? 'MEMBERS' : r.name.toUpperCase())} — ${groups[r.id].length}</div>` +
    groups[r.id].map(id => `<div class="item">${avatar(user(id))}<span style="color:${r.id === 'everyone' ? 'inherit' : r.color}">${esc(user(id).name)}${id === srv.ownerId ? ' 👑' : ''}</span></div>`).join('')).join('')}</aside>`;
};
