import type { TwinEntry } from "./types";

const STORAGE_KEY = "diabetx.entries.v1";

export function loadEntries(): TwinEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TwinEntry[];
    return parsed.sort((a, b) => a.timestamp - b.timestamp);
  } catch {
    return [];
  }
}

export function saveEntry(entry: TwinEntry): TwinEntry[] {
  const entries = loadEntries();
  const next = [...entries, entry];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function deleteEntry(id: string): TwinEntry[] {
  const next = loadEntries().filter((e) => e.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
