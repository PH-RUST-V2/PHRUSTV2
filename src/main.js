import { S, save, user, server, channel, createServer, addMessage, addFriend, dmThread } from './core/store.js';
import { can, PERMS } from './core/permissions.js';
import { uid } from './core/util.js';
import * as vc from './core/voice.js';
import { ask, confirmBox } from './ui/modal.js';
import { railHtml } from './ui/rail.js';
import { sidebarHtml } from './ui/sidebar.js';
import { chatHtml, EMOJI } from './ui/chat.js';
import { membersHtml } from './ui/members.js';
import { friendsHtml } from './ui/friends.js';

let draft = '', pickerFor = null;
const cur = () => {
  const srv = server(S.ui.server);
  if (srv) { const ch = channel(srv, S.ui.channel); return { srv, ch, msgs: ch?.msgs }; }
  return { srv: null, ch: null, msgs: S.ui.dm ? dmThread(S.ui.dm) : null };
};

function render() {
  const { srv, ch, msgs } = cur();
  let main;
  if (!srv && !S.ui.dm) main = friendsHtml();
  else {
    const isVoice = ch?.type === 'voice';
    const title = srv ? ch?.name || '' : user(S.ui.dm).name;
    const body = isVoice
      ? `<div class="empty"><h2>🔊 ${title}</h2><p>${vc.voice.cur?.chId === ch.id ? 'You are connected.' : 'Nobody is here yet.'}</p>
         ${can(srv, 'me', 'connect') ? `<button class="btn" data-act="joinVoice" data-id="${ch.id}">Join voice</button>` : 'You cannot join voice here.'}</div>`
      : chatHtml({ title, msgs: msgs || [], canSend: srv ? can(srv, 'me', 'send') : true, canMod: srv ? can(srv, 'me', 'manage_messages') : false, pickerFor, draft });
    main = `<div class="top">${srv ? (isVoice ? '🔊' : '#') : '@'} ${title}</div>${body}`;
  }
  document.getElementById('app').innerHTML = railHtml() + sidebarHtml(srv) + `<main class="main">${main}</main>` + (srv ? membersHtml(srv) : '');
  const m = document.getElementById('msgs'); if (m) m.scrollTop = m.scrollHeight;
  const d = document.getElementById('draft'); if (d && !d.disabled) d.focus();
}

function send(text) {
  const { srv, ch, msgs } = cur();
  if (!text.trim() || !msgs || (srv && !can(srv, 'me', 'send'))) return;
  addMessage(msgs, 'me', text.trim());
  if (!srv) setTimeout(() => { addMessage(dmThread(S.ui.dm), S.ui.dm, '🦀 (simulated reply: no backend yet)'); render(); }, 900);
}
const findMsg = id => cur().msgs?.find(m => m.id === id);

const A = {
  home: () => { S.ui = { ...S.ui, server: 'home', dm: null }; },
  friends: () => { S.ui.dm = null; },
  dm: ({ id }) => { S.ui = { ...S.ui, server: 'home', dm: id }; },
  server: ({ id }) => { const s = server(id); S.ui = { ...S.ui, server: id, dm: null, channel: S.ui.channel && channel(s, S.ui.channel) ? S.ui.channel : s.channels[0].id }; },
  channel: ({ id }) => { S.ui.channel = id; },
  async addServer() { const r = await ask('Create your server', [{ name: 'name', label: 'SERVER NAME' }], 'Create'); if (r?.name) createServer(r.name); },
  async addChannel({ id }) {
    const { srv } = cur(); const r = await ask('Create channel', [{ name: 'name', label: 'CHANNEL NAME' }], 'Create');
    if (r?.name) { const c = { id: uid(), name: r.name.toLowerCase().replace(/\s+/g, '-'), type: id, msgs: [] }; srv.channels.push(c); S.ui.channel = c.id; }
  },
  async srvSettings() {
    const { srv } = cur(); const mine = srv.ownerId === 'me';
    const r = await ask(`${srv.name} settings`, [{ type: 'select', name: 'a', label: 'ACTION', options: [
      ['role', 'Create role'], ['assign', 'Assign role to member'], ['invite', 'Invite a friend'], ['kick', 'Kick member'], ['delchan', 'Delete channel'], ['rename', 'Rename server'], [mine ? 'delete' : 'leave', mine ? 'Delete server' : 'Leave server']] }], 'Continue');
    if (r) await SETTINGS[r.a]?.(srv);
  },
  async profile() {
    const r = await ask('User settings', [{ name: 'name', label: 'USERNAME', value: S.me.name }, { type: 'textarea', name: 'bio', label: 'ABOUT ME (BIO)', value: S.me.bio }, { type: 'file', name: 'img', label: 'AVATAR' }]);
    if (r) { S.me.name = r.name || S.me.name; S.me.bio = r.bio; if (r.img) S.me.img = r.img; }
  },
  async addFriend() { const r = await ask('Add friend', [{ name: 'n', label: 'USERNAME' }], 'Send request'); if (r?.n) addFriend(r.n); },
  unfriend: ({ id }) => { S.friends = S.friends.filter(f => f !== id); },
  picker: ({ id }) => { pickerFor = pickerFor === id ? null : id; },
  react: ({ id, e }) => {
    const m = findMsg(id); if (!m) return; const l = (m.reactions[e] ||= []);
    m.reactions[e] = l.includes('me') ? l.filter(x => x !== 'me') : [...l, 'me']; pickerFor = null;
  },
  async edit({ id }) { const m = findMsg(id); const r = await ask('Edit message', [{ type: 'textarea', name: 't', value: m.content }]); if (r?.t) { m.content = r.t; m.edited = true; } },
  delete: ({ id }) => { const { msgs } = cur(); msgs.splice(msgs.findIndex(m => m.id === id), 1); },
  async gif() { const r = await ask('Add a GIF', [{ name: 'u', label: 'GIF URL (Giphy, Tenor or .gif link)' }], 'Send'); if (r?.u) send(r.u); },
  emoji() { draft += EMOJI[Math.floor(Math.random() * EMOJI.length)]; },
  attach() {
    const i = Object.assign(document.createElement('input'), { type: 'file', accept: 'image/*' });
    i.onchange = () => { const fr = new FileReader(); fr.onload = () => { send(fr.result); render(); }; fr.readAsDataURL(i.files[0]); }; i.click();
  },
  joinVoice: async ({ id }) => { await vc.join(S.ui.server, id); },
  leaveVoice: () => vc.leave(), mute: () => vc.toggleMute(), deaf: () => vc.toggleDeaf(),
};

const SETTINGS = {
  async role(srv) {
    const r = await ask('Create role', [{ name: 'name', label: 'ROLE NAME' }, { name: 'color', label: 'COLOR (hex)', value: '#5865f2' },
      { type: 'checks', name: 'perms', label: 'PERMISSIONS', options: Object.entries(PERMS), value: ['send', 'connect'] }], 'Create');
    if (r?.name) srv.roles.push({ id: uid(), name: r.name, color: r.color || '#5865f2', perms: r.perms });
  },
  async assign(srv) {
    const roles = srv.roles.filter(r => r.id !== 'everyone'); if (!roles.length) return alert('Create a role first.');
    const r = await ask('Assign role', [{ type: 'select', name: 'u', label: 'MEMBER', options: Object.keys(srv.members).map(id => [id, user(id).name]) }, { type: 'select', name: 'r', label: 'ROLE', options: roles.map(x => [x.id, x.name]) }]);
    if (r) { const l = (srv.members[r.u] ||= []); if (!l.includes(r.r)) l.push(r.r); }
  },
  async invite(srv) {
    const free = S.friends.filter(f => !srv.members[f]); if (!free.length) return alert('All your friends are already in this server.');
    const r = await ask('Invite friend', [{ type: 'select', name: 'u', label: 'FRIEND', options: free.map(f => [f, user(f).name]) }], 'Invite');
    if (r) srv.members[r.u] = [];
  },
  async kick(srv) {
    if (!can(srv, 'me', 'kick')) return alert('Missing permission: Kick members');
    const o = Object.keys(srv.members).filter(i => i !== srv.ownerId); if (!o.length) return;
    const r = await ask('Kick member', [{ type: 'select', name: 'u', label: 'MEMBER', options: o.map(i => [i, user(i).name]) }], 'Kick'); if (r) delete srv.members[r.u];
  },
  async delchan(srv) {
    if (!can(srv, 'me', 'manage_channels') || srv.channels.length < 2) return alert('Cannot delete channel.');
    const r = await ask('Delete channel', [{ type: 'select', name: 'c', label: 'CHANNEL', options: srv.channels.map(c => [c.id, c.name]) }], 'Delete');
    if (r) { srv.channels = srv.channels.filter(c => c.id !== r.c); S.ui.channel = srv.channels[0].id; }
  },
  async rename(srv) { const r = await ask('Rename server', [{ name: 'n', value: srv.name }]); if (r?.n) srv.name = r.n; },
  async delete(srv) { if (await confirmBox(`Delete ${srv.name}?`)) { S.servers = S.servers.filter(s => s !== srv); S.ui = { ...S.ui, server: 'home' }; } },
  async leave(srv) { if (await confirmBox(`Leave ${srv.name}?`)) { S.servers = S.servers.filter(s => s !== srv); S.ui = { ...S.ui, server: 'home' }; } },
};

document.addEventListener('click', async e => {
  const t = e.target.closest('[data-act]'); if (!t) { if (pickerFor) { pickerFor = null; render(); } return; }
  await A[t.dataset.act]?.({ ...t.dataset }); save(); render();
});
document.addEventListener('input', e => { if (e.target.id === 'draft') draft = e.target.value; });
document.addEventListener('keydown', e => {
  if (e.target.id === 'draft' && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(draft); draft = ''; render(); }
});
render();
