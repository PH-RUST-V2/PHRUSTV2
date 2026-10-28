import { S, user } from '../core/store.js';
import { can } from '../core/permissions.js';
import { voice } from '../core/voice.js';
import { esc } from '../core/util.js';
export const avatar = (u, cls = '') =>
  `<div class="av ${cls}" style="background-color:${u.color};${u.img ? `background-image:url(${u.img})` : ''}">${u.img ? '' : esc(u.name[0]?.toUpperCase() || '?')}</div>`;

export function sidebarHtml(srv) {
  let top, body;
  if (!srv) {
    top = '<header>Direct messages</header>';
    body = `<button class="item ${!S.ui.dm ? 'on' : ''}" data-act="friends">👥 Friends</button><div class="cat">DIRECT MESSAGES</div>` +
      S.friends.map(id => `<button class="item ${S.ui.dm === id ? 'on' : ''}" data-act="dm" data-id="${id}">${avatar(user(id))} ${esc(user(id).name)}</button>`).join('');
  } else {
    const canCh = can(srv, 'me', 'manage_channels');
    top = `<header>${esc(srv.name)}<button data-act="srvSettings" title="Server settings">⚙</button></header>`;
    const group = (t, label) => `<div class="cat">${label}${canCh ? `<button data-act="addChannel" data-id="${t}">+</button>` : ''}</div>` +
      srv.channels.filter(c => c.type === t).map(c => `<button class="item ${S.ui.channel === c.id ? 'on' : ''}" data-act="channel" data-id="${c.id}">${t === 'text' ? '#' : '🔊'} ${esc(c.name)}</button>` +
        (voice.cur?.chId === c.id ? `<div class="item">${avatar(S.me)} ${esc(S.me.name)}${voice.muted ? ' 🔇' : ''}</div>` : '')).join('');
    body = group('text', 'TEXT CHANNELS') + group('voice', 'VOICE CHANNELS');
  }
  const vc = voice.cur ? `<div class="vc">Voice connected${voice.stream ? '' : ' (no mic)'}<div class="row">
    <button data-act="mute">${voice.muted ? 'Unmute' : 'Mute'}</button><button data-act="deaf">${voice.deaf ? 'Undeafen' : 'Deafen'}</button><button data-act="leaveVoice">Leave</button></div></div>` : '';
  return `<aside class="side">${top}<div class="list">${body}</div>${vc}
    <div class="me">${avatar(S.me)}<div class="nm">${esc(S.me.name)}<small>${esc(S.me.bio.slice(0, 24) || 'Online')}</small></div><button data-act="profile" title="User settings">⚙</button></div></aside>`;
}
