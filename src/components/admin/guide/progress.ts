'use client';

// Per-browser memory of guide items the user completed by hand (or by trying a
// demo). Purely a convenience: everything works without storage.

const KEY = 'admin_guide_done';
const EVT = 'admin-guide-progress';

export function readGuideDone(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) || '[]') as string[]);
  } catch {
    return new Set();
  }
}

function write(s: Set<string>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(Array.from(s)));
  } catch {
    /* storage unavailable */
  }
  window.dispatchEvent(new Event(EVT));
}

export function markGuideDone(id: string) {
  const s = readGuideDone();
  if (s.has(id)) return;
  s.add(id);
  write(s);
}

export function toggleGuideDone(id: string) {
  const s = readGuideDone();
  if (s.has(id)) s.delete(id);
  else s.add(id);
  write(s);
}

export function onGuideProgress(cb: () => void) {
  window.addEventListener(EVT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(EVT, cb);
    window.removeEventListener('storage', cb);
  };
}
