import React from "react";
import type { JournalEntry } from "../store/useEntries";
import { format } from "date-fns";

type Props = {
  date: Date;
  entries: JournalEntry[];
  onOpen: (id: string) => void;
  dim?: boolean;
};

export default function DayCell({ date, entries, onOpen, dim }: Props) {
  return (
    <div className="day" aria-label={format(date, "yyyy-MM-dd")}>
      <div className="date" style={{ opacity: dim ? 0.5 : 1 }}>
        {format(date, "d")}
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        {entries.map((e) => (
          <button
            key={e.id}
            className="entry-chip"
            onClick={() => onOpen(e.id)}
            title={e.description}
          >
            <span
              className="entry-thumb"
              style={{ backgroundImage: `url(${e.imgUrl})` }}
            />
            <span style={{ textAlign: "left" }}>
              ⭐ {e.rating.toFixed(1)} · {e.categories[0] ?? "Journal"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
