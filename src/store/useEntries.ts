import { create } from "zustand";

export type JournalEntry = {
  id: string;
  imgUrl: string;
  rating: number;
  categories: string[];
  date: string;          // "DD/MM/YYYY"
  description: string;
};

// Seed entries coming from JSON will NOT have an id yet.
type SeedEntry = Omit<JournalEntry, "id">;

type Store = {
  entries: JournalEntry[];
  loadSeed: (seed: SeedEntry[]) => void;                              // 🔧 accept seed without id
  add: (e: SeedEntry) => void;
  update: (id: string, patch: Partial<Omit<JournalEntry, "id">>) => void;
  remove: (id: string) => void;
};

const KEY = "journal.entries.v1";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useEntries = create<Store>((set, get) => ({
  entries: [],

  loadSeed: (seed) => {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      try {
        const parsed: JournalEntry[] = JSON.parse(raw);
        set({ entries: parsed });
        return;
      } catch (err) {
        // 🔧 no-empty: log and fall back to seeding
        console.warn("Failed to parse saved entries; falling back to seed.", err);
      }
    }
    // Assign ids for seed entries
    const seeded = seed.map((s) => ({ ...s, id: uid() }));
    localStorage.setItem(KEY, JSON.stringify(seeded));
    set({ entries: seeded });
  },

  add: (e) => {
    const next = [...get().entries, { ...e, id: uid() }];
    localStorage.setItem(KEY, JSON.stringify(next));
    set({ entries: next });
  },

  update: (id, patch) => {
    const next = get().entries.map((x) => (x.id === id ? { ...x, ...patch } : x));
    localStorage.setItem(KEY, JSON.stringify(next));
    set({ entries: next });
  },

  remove: (id) => {
    const next = get().entries.filter((x) => x.id !== id);
    localStorage.setItem(KEY, JSON.stringify(next));
    set({ entries: next });
  },
}));
