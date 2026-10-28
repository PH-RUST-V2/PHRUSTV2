import { esc } from '../core/util.js';
const el = () => document.getElementById('modal');
const readFile = f => new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(f); });
// Generic dialog. Field types: text, textarea, file, select, checks. Resolves to values, or null when cancelled.
export function ask(title, fields = [], ok = 'Save') {
  return new Promise(resolve => {
    const m = el();
    m.innerHTML = `<div class="card"><h3>${esc(title)}</h3>${fields.map((f, i) => `<label>${esc(f.label || '')}</label>` + ({
      text: `<input type="text" name="${f.name}" value="${esc(f.value ?? '')}" ${i === 0 ? 'autofocus' : ''}>`,
      textarea: `<textarea name="${f.name}" rows="3">${esc(f.value ?? '')}</textarea>`,
      file: `<input type="file" name="${f.name}" accept="image/*">`,
      select: `<select name="${f.name}">${f.options.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('')}</select>`,
      checks: f.options.map(([v, l]) => `<div class="chk"><input type="checkbox" name="${f.name}" value="${v}" ${(f.value || []).includes(v) ? 'checked' : ''}> ${esc(l)}</div>`).join(''),
    })[f.type || 'text']).join('')}<div class="act"><button class="btn ghost" data-x>Cancel</button><button class="btn" data-ok>${esc(ok)}</button></div></div>`;
    m.hidden = false;
    const close = v => { m.hidden = true; m.innerHTML = ''; resolve(v); };
    m.onclick = async e => {
      if (e.target === m || e.target.dataset.x !== undefined) return close(null);
      if (e.target.dataset.ok === undefined) return;
      const out = {};
      for (const f of fields) {
        const n = m.querySelectorAll(`[name="${f.name}"]`);
        if (f.type === 'checks') out[f.name] = [...n].filter(x => x.checked).map(x => x.value);
        else if (f.type === 'file') out[f.name] = n[0].files[0] ? await readFile(n[0].files[0]) : null;
        else out[f.name] = n[0].value.trim();
      }
      close(out);
    };
  });
}
export const confirmBox = (t) => ask(t, [], 'Confirm');
