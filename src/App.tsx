import { useMemo, useState, useEffect } from "react";
import "./styles.css";
import Header from "./components/Header";
import Calendar from "./components/Calendar";
import { monthFromIndex, monthLabel } from "./lib/date";
import { useEntries } from "./store/useEntries";
import type { JournalEntry } from "./store/useEntries";
import entriesSeed from "./data/sampleEntries.json";

type SeedEntry = Omit<JournalEntry, "id">;

export default function App() {
  const initialLabel = useMemo(() => monthLabel(monthFromIndex(new Date(), 0)), []);
  const [headerLabel, setHeaderLabel] = useState(initialLabel);

  // 🔎 search/filter text
  const [query, setQuery] = useState("");

  // Load seed or saved entries
  const loadSeed = useEntries((s) => s.loadSeed);
  useEffect(() => {
    const seed: SeedEntry[] = entriesSeed as SeedEntry[];
    loadSeed(seed);
  }, [loadSeed]);

  return (
    <div className="app">
      <Header
        label={headerLabel}
        sub="Infinite scroll · Header follows visible month"
        query={query}
        onQueryChange={setQuery}
      />
      <Calendar onHeaderChange={setHeaderLabel} filterQuery={query} />
    </div>
  );
}
