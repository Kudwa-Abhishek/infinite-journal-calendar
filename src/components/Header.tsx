// src/components/Header.tsx
import React from "react";

type Props = {
  label: string;                  // e.g., "September 2025"
  sub?: string;                   // small hint
  query: string;                  // current search text
  onQueryChange: (q: string) => void; // update search
};

export default function Header({ label, sub, query, onQueryChange }: Props) {
  return (
    <header className="header">
      <div className="header-inner">
        <div>
          {/* key={label} forces a small re-mount to trigger the CSS animation */}
          <h1 className="month-label" key={label} aria-live="polite" aria-atomic="true">
            {label}
          </h1>
          <div className="hint">{sub ?? "Scroll freely — months can overlap"}</div>
        </div>

        <div className="search-wrap" role="search">
          <input
            type="search"
            placeholder="Search entries…"
            value={query}
            onChange={(e) => onQueryChange(e.currentTarget.value)}
            aria-label="Search journal entries"
          />
        </div>
      </div>
    </header>
  );
}
