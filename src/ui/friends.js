import { S, user } from '../core/store.js';
import { esc } from '../core/util.js';
import { avatar } from './sidebar.js';
export const friendsHtml = () => `<div class="top">👥 Friends<div class="tabs"><button class="on">All — ${S.friends.length}</button></div><span class="sp"></span><button class="btn" data-act="addFriend">Add friend</button></div>
  <div class="msgs">${S.friends.map(id => { const u = user(id); return `<div class="msg">${avatar(u)}<div class="body"><span class="who">${esc(u.name)}</span><div class="t" style="margin:0">${esc(u.bio || 'No bio')}</div></div>
  <div class="tools" style="display:flex;position:static;border:0"><button data-act="dm" data-id="${id}">💬</button><button data-act="unfriend" data-id="${id}">✖</button></div></div>`; }).join('') || '<div class="empty">No friends yet. Add one by username.</div>'}</div>`;
