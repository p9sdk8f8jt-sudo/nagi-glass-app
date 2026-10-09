const KEY = "sike-growth-journal-v1";
const MAX_ENTRIES = 1500;

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `entry-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function readJournal(storage = globalThis.localStorage) {
  try {
    const rows = JSON.parse(storage?.getItem(KEY) || "[]");
    return Array.isArray(rows) ? rows.slice(-MAX_ENTRIES) : [];
  } catch {
    return [];
  }
}

export function appendJournal(entry, storage = globalThis.localStorage) {
  const rows = readJournal(storage);
  const record = { id: makeId(), at: new Date().toISOString(), kind: "experience", ...entry };
  rows.push(record);
  try {
    storage?.setItem(KEY, JSON.stringify(rows.slice(-MAX_ENTRIES)));
    return { record, saved: true };
  } catch {
    return { record, saved: false, reason: "storage-unavailable-or-full" };
  }
}

export function exportJournal(storage = globalThis.localStorage) {
  return JSON.stringify({ schema: 1, exportedAt: new Date().toISOString(), entries: readJournal(storage) }, null, 2);
}

export function importJournal(text, storage = globalThis.localStorage) {
  const data = JSON.parse(text);
  if (data?.schema !== 1 || !Array.isArray(data.entries)) throw new Error("未対応のバックアップ形式です");
  const clean = data.entries.filter((x) => x && typeof x === "object" && typeof x.kind === "string").slice(-MAX_ENTRIES);
  storage?.setItem(KEY, JSON.stringify(clean));
  return clean.length;
}

export const JournalKey = KEY;
