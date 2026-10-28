import { uid, COLORS } from './util.js';
const KEY = 'phrustv2.state';
const seed = () => ({
  me: { id: 'me', name: 'you', bio: '', color: COLORS[0], img: null },
  users: { ferris: { id: 'ferris', name: 'Ferris', bio: 'Crab. Rustacean.', color: '#e0613b' } },
  friends: ['ferris'], dms: {}, servers: [],
  ui: { server: 'home', channel: null, dm: null, tab: 'all' },
});
let state; try { state = JSON.parse(localStorage.getItem(KEY)) || seed(); } catch { state = seed(); }
export const S = state;
export const save = () => localStorage.setItem(KEY, JSON.stringify(S));
export const user = id => (id === 'me' ? S.me : S.users[id]) || { id, name: 'unknown', color: '#555' };
export const server = id => S.servers.find(s => s.id === id);
export const channel = (srv, id) => srv?.channels.find(c => c.id === id);

export function createServer(name) {
  const s = {
    id: uid(), name, ownerId: 'me',
    roles: [{ id: 'everyone', name: '@everyone', color: '#949ba4', perms: ['send', 'connect'] }],
    members: { me: [] },
    channels: [{ id: uid(), name: 'general', type: 'text', msgs: [] }, { id: uid(), name: 'Lounge', type: 'voice', msgs: [] }],
  };
  S.servers.push(s); S.ui = { ...S.ui, server: s.id, channel: s.channels[0].id, dm: null }; save(); return s;
}
export function addMessage(list, authorId, content) {
  list.push({ id: uid(), authorId, content, ts: Date.now(), reactions: {}, edited: false }); save();
}
export function addFriend(name) {
  let u = Object.values(S.users).find(x => x.name.toLowerCase() === name.toLowerCase());
  if (!u) { u = { id: uid(), name, bio: '', color: COLORS[Math.floor(Math.random() * COLORS.length)] }; S.users[u.id] = u; }
  if (!S.friends.includes(u.id)) S.friends.push(u.id); save(); return u;
}
export const dmThread = id => (S.dms[id] ||= []);
