import { useEffect, useRef } from "react";
import { buildMonthGrid, monthLabel, isSameMonthFast, weekdayLabels, dateKey } from "../lib/date";
import DayCell from "./DayCell";
import type { JournalEntry } from "../store/useEntries";

type Props = {
  monthDate: Date;
  entriesByDay: Map<string, JournalEntry[]>;
  onOpenEntry: (id: string) => void;
  onHeight?: (h: number) => void;
};

export default function MonthView({ monthDate, entriesByDay, onOpenEntry, onHeight }: Props) {
  const weeks = buildMonthGrid(monthDate);
  const weekdays = weekdayLabels();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !onHeight) return;
    onHeight(ref.current.offsetHeight);
  }, [onHeight, weeks.length]);

  return (
    <div className="month" ref={ref}>
      <caption>{monthLabel(monthDate)}</caption>

      <div className="grid">
        {weekdays.map((w) => (
          <div key={w} className="weekday">{w}</div>
        ))}
      </div>

      {weeks.map((row, i) => (
        <div key={i} className="grid" style={{ marginTop: i === 0 ? 6 : 8 }}>
          {row.map((d) => {
            const dim = !isSameMonthFast(d, monthDate);
            const key = dateKey(d);
            const entries = entriesByDay.get(key) ?? [];
            return (
              <DayCell
                key={key}
                date={d}
                entries={entries}
                onOpen={onOpenEntry}
                dim={dim}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
