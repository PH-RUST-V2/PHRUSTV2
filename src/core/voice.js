// Local voice-channel state. Mic capture is real; other participants need a backend (see README).
export const voice = { cur: null, stream: null, muted: false, deaf: false };
export async function join(srvId, chId) {
  leave(); voice.cur = { srvId, chId };
  try { voice.stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch { voice.stream = null; }
  apply();
}
export function leave() { voice.stream?.getTracks().forEach(t => t.stop()); voice.stream = null; voice.cur = null; voice.muted = voice.deaf = false; }
const apply = () => voice.stream?.getAudioTracks().forEach(t => (t.enabled = !(voice.muted || voice.deaf)));
export const toggleMute = () => { voice.muted = !voice.muted; apply(); };
export const toggleDeaf = () => { voice.deaf = !voice.deaf; apply(); };
