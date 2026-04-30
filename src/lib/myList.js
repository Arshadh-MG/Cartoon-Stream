const STORAGE_KEY = 'cartoon-streaming-mylist';

function readSavedIds() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) return [];
    return JSON.parse(value) ?? [];
  } catch (error) {
    return [];
  }
}

function writeSavedIds(ids) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch (error) {
    // ignore localStorage failures
  }
}

export function getSavedCartoonIds() {
  return readSavedIds().map((id) => String(id));
}

export function isCartoonSaved(cartoonId) {
  return getSavedCartoonIds().includes(String(cartoonId));
}

export function toggleSavedCartoonId(cartoonId) {
  const id = String(cartoonId);
  const saved = getSavedCartoonIds();
  const next = saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id];
  writeSavedIds(next);
  return next;
}

export function removeSavedCartoonId(cartoonId) {
  const id = String(cartoonId);
  const saved = getSavedCartoonIds();
  const next = saved.filter((item) => item !== id);
  writeSavedIds(next);
  return next;
}
