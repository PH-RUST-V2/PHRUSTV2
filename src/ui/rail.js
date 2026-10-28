import { S } from '../core/store.js';
import { esc } from '../core/util.js';
export const railHtml = () => `<nav class="rail">
  <button class="srv ${S.ui.server === 'home' ? 'on' : ''}" data-act="home" title="Home">PH</button>
  ${S.servers.map(s => `<button class="srv ${S.ui.server === s.id ? 'on' : ''}" data-act="server" data-id="${s.id}" title="${esc(s.name)}">${esc(s.name.slice(0, 2))}</button>`).join('')}
  <button class="srv add" data-act="addServer" title="Create a server">+</button></nav>`;
