import type { TwinEntry } from "./types";

const STORAGE_KEY = "diabetx.entries.v1";

export const DEFAULT_ENTRIES: TwinEntry[] = [
  {
    id: "baseline-1",
    timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000,
    weightKg: 78,
    hba1cPercent: 6.8,
    fastingGlucoseMgDl: 125,
    sleepHours: 6.5,
    exerciseMinutesPerWeek: 45,
    dietQuality: 2,
  },
  {
    id: "baseline-2",
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
    weightKg: 76,
    hba1cPercent: 6.6,
    fastingGlucoseMgDl: 118,
    sleepHours: 7.0,
    exerciseMinutesPerWeek: 75,
    dietQuality: 3,
  },
  {
    id: "baseline-3",
    timestamp: Date.now(),
    weightKg: 75,
    hba1cPercent: 6.4,
    fastingGlucoseMgDl: 110,
    sleepHours: 7.5,
    exerciseMinutesPerWeek: 90,
    dietQuality: 3,
  },
];

export function loadEntries(): TwinEntry[] {
  if (typeof window === "undefined") return DEFAULT_ENTRIES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ENTRIES));
      return DEFAULT_ENTRIES;
    }
    const parsed = JSON.parse(raw) as TwinEntry[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ENTRIES));
      return DEFAULT_ENTRIES;
    }
    return parsed.sort((a, b) => a.timestamp - b.timestamp);
  } catch {
    return DEFAULT_ENTRIES;
  }
}

export function saveEntry(entry: TwinEntry): TwinEntry[] {
  const entries = loadEntries();
  const next = [...entries, entry];
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return next;
}

export function deleteEntry(id: string): TwinEntry[] {
  const current = loadEntries();
  const next = current.filter((e) => e.id !== id);
  const result = next.length > 0 ? next : DEFAULT_ENTRIES;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  }
  return result;
}

export function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
