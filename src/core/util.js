export const uid = () => Math.random().toString(36).slice(2, 10);
export const COLORS = ['#d9531e', '#3ba55d', '#5865f2', '#eb459e', '#faa61a', '#1abc9c'];
export const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const time = ts => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const IMG = /\.(gif|png|jpe?g|webp)(\?\S*)?$|^https:\/\/(media\d?\.giphy\.com|media\.tenor\.com)\//i;
// Escape first, then apply a small markdown subset and embed image/GIF links.
export function format(text) {
  let embeds = '';
  const html = esc(text).replace(/https?:\/\/[^\s<]+/g, u => {
    if (IMG.test(u)) { embeds += `<img class="emb" src="${u}" alt="">`; return ''; }
    return `<a href="${u}" target="_blank" rel="noopener">${u}</a>`;
  }).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>');
  return html + embeds;
}
