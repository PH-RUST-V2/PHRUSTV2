import { user } from '../core/store.js';
import { esc, format, time } from '../core/util.js';
import { avatar } from './sidebar.js';
export const EMOJI = ['👍', '❤️', '😂', '🎉', '🔥', '😮', '😢', '🦀'];

export function chatHtml({ title, msgs, canSend, canMod, pickerFor, draft }) {
  const list = msgs.map(m => {
    const u = user(m.authorId), mine = m.authorId === 'me';
    const rx = Object.entries(m.reactions).filter(([, v]) => v.length).map(([e, v]) =>
      `<button class="${v.includes('me') ? 'mine' : ''}" data-act="react" data-id="${m.id}" data-e="${e}">${e} ${v.length}</button>`).join('');
    return `<div class="msg">${avatar(u)}<div class="body"><span class="who" style="color:${u.color}">${esc(u.name)}</span><span class="t">${time(m.ts)}${m.edited ? ' (edited)' : ''}</span>
      <div class="txt">${format(m.content)}</div>${rx ? `<div class="rx">${rx}</div>` : ''}</div>
      <div class="tools"><button data-act="picker" data-id="${m.id}">😀</button>${mine ? `<button data-act="edit" data-id="${m.id}">✏️</button>` : ''}${mine || canMod ? `<button data-act="delete" data-id="${m.id}">🗑</button>` : ''}
      ${pickerFor === m.id ? `<div class="picker">${EMOJI.map(e => `<button data-act="react" data-id="${m.id}" data-e="${e}">${e}</button>`).join('')}</div>` : ''}</div></div>`;
  }).join('') || '<div class="empty">No messages yet. Say something.</div>';
  return `<div class="msgs" id="msgs">${list}</div>
    <div class="composer"><button data-act="attach" title="Upload image">＋</button>
    <textarea id="draft" placeholder="${canSend ? `Message ${esc(title)}` : 'You do not have permission to send messages here'}" ${canSend ? '' : 'disabled'}>${esc(draft)}</textarea>
    <button data-act="gif" title="Add GIF">GIF</button><button data-act="emoji" title="Add emoji">😀</button></div>`;
}
