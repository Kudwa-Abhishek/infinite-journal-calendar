import  {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import MonthView from "./MonthView";
import EntryModal from "./EntryModal";
import FloatingAddButton from "./FloatingAddButton";
import { monthFromIndex, monthLabel, dateKey, parseDMY } from "../lib/date";
import { mostVisibleByArea } from "../lib/viewport";
import { useEntries } from "../store/useEntries";
import type { JournalEntry } from "../store/useEntries";

const INITIAL_BEFORE = 6;
const INITIAL_AFTER = 6;
const EXTEND_BY = 5;
const MAX_KEEP = 26;

type Props = {
  onHeaderChange?: (label: string) => void;
  filterQuery?: string;                    // 🔎 new
};

export default function Calendar({ onHeaderChange, filterQuery = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const monthRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const heights = useRef<Map<number, number>>(new Map());

  const base = useMemo(() => new Date(), []);
  const [indices, setIndices] = useState<number[]>(
    Array.from({ length: INITIAL_BEFORE + INITIAL_AFTER + 1 }, (_, i) => i - INITIAL_BEFORE)
  );
  const [headerIndex, setHeaderIndex] = useState(0);

  // entries store
  const entries = useEntries((s) => s.entries);
  const add = useEntries((s) => s.add);
  const update = useEntries((s) => s.update);
  const remove = useEntries((s) => s.remove);

  // 🔎 normalize the query once
  const q = filterQuery.trim().toLowerCase();

  // 🔎 filter entries by description/categories/date/rating
  const filteredEntries: JournalEntry[] = useMemo(() => {
    if (!q) return entries;
    return entries.filter((e) => {
      const inDesc = e.description.toLowerCase().includes(q);
      const inCats = e.categories.join(" ").toLowerCase().includes(q);
      const inDate = e.date.toLowerCase().includes(q);           // "DD/MM/YYYY"
      const inRating = String(e.rating).includes(q);             // numeric text match
      return inDesc || inCats || inDate || inRating;
    });
  }, [entries, q]);

  // sorted for modal navigation
  const orderedEntries: JournalEntry[] = useMemo(
    () => [...filteredEntries].sort((a, b) => parseDMY(a.date).getTime() - parseDMY(b.date).getTime()),
    [filteredEntries]
  );

  // group by day key
  const entriesByDay: Map<string, JournalEntry[]> = useMemo(() => {
    const map = new Map<string, JournalEntry[]>();
    for (const e of filteredEntries) {
      const d = parseDMY(e.date);
      const key = dateKey(d);
      const arr = map.get(key);
      if (arr) arr.push(e);
      else map.set(key, [e]);
    }
    return map;
  }, [filteredEntries]);

  // Modal open/close
  const [openId, setOpenId] = useState<string | null>(null);

  // Height reporting
  const handleHeight = useCallback((index: number, h: number) => {
    heights.current.set(index, h);
  }, []);

  // Node ref binder
  const monthNode = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      if (!el) monthRefs.current.delete(index);
      else monthRefs.current.set(index, el);
    },
    []
  );

  // Extend/prune infinite list
  const extendIfNeeded = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const nearTop = el.scrollTop < 600;
    const nearBottom = el.scrollHeight - (el.scrollTop + el.clientHeight) < 600;

    if (!nearTop && !nearBottom) return;

    setIndices((prev) => {
      let next = prev;
      const first = prev[0];
      const last = prev[prev.length - 1];

      if (nearTop) {
        const toAdd = Array.from({ length: EXTEND_BY }, (_, i) => first - (i + 1)).reverse();
        next = [...toAdd, ...prev];
      }
      if (nearBottom) {
        const toAdd = Array.from({ length: EXTEND_BY }, (_, i) => last + (i + 1));
        next = [...next, ...toAdd];
      }

      if (next.length > MAX_KEEP) {
        const over = next.length - MAX_KEEP;

        if (nearBottom) {
          const removed = next.slice(0, over);
          const removedHeight = removed.reduce(
            (acc, idx) => acc + (heights.current.get(idx) ?? 0),
            0
          );
          requestAnimationFrame(() => {
            if (containerRef.current) containerRef.current.scrollTop -= removedHeight;
          });
          next = next.slice(over);
        } else if (nearTop) {
          next = next.slice(0, next.length - over);
        } else {
          const left = Math.floor(over / 2);
          const right = over - left;
          const removedLeft = next.slice(0, left);
          const removedHeight = removedLeft.reduce(
            (acc, idx) => acc + (heights.current.get(idx) ?? 0),
            0
          );
          requestAnimationFrame(() => {
            if (containerRef.current) containerRef.current.scrollTop -= removedHeight;
          });
          next = next.slice(left, next.length - right);
        }
      }

      return next;
    });
  }, []);

  // Keep scroll anchored after prepends
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (el.scrollTop < 600) {
      const first = indices[0];
      const approxAdded = Array.from({ length: EXTEND_BY }, (_, i) => first + i);
      const addHeight = approxAdded.reduce(
        (acc, idx) => acc + (heights.current.get(idx) ?? 0),
        0
      );
      if (addHeight > 0) el.scrollTop += addHeight;
    }
  }, [indices]);

  // Scroll handler (rAF throttled)
  const ticking = useRef(false);
  const onScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el || ticking.current) return;
    ticking.current = true;
    requestAnimationFrame(() => {
      ticking.current = false;
      extendIfNeeded();
      const monthNodes = Array.from(monthRefs.current.entries()).map(([index, el]) => ({ index, el }));
      const best = mostVisibleByArea(el, monthNodes);
      if (best != null) setHeaderIndex(best);
    });
  }, [extendIfNeeded]);

  // Update header in parent
  useEffect(() => {
    if (!onHeaderChange) return;
    const label = monthLabel(monthFromIndex(base, headerIndex));
    onHeaderChange(label);
  }, [headerIndex, base, onHeaderChange]);

  // --- Keyboard navigation ---
  useEffect(() => {
    function isTypingTarget(target: EventTarget | null) {
      const el = target as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName?.toLowerCase();
      return tag === "input" || tag === "textarea" || el.isContentEditable;
    }

    function getRowHeight(): number {
      const el = containerRef.current?.querySelector(".day") as HTMLElement | null;
      return el?.offsetHeight ? el.offsetHeight + 8 /* gap */ : 110;
      // adds ~gap to approximate one row (week) scroll
    }

    function scrollToMonth(targetIndex: number) {
      const el = containerRef.current;
      const node = monthRefs.current.get(targetIndex);
      if (!el || !node) return;
      el.scrollTo({ top: node.offsetTop, behavior: "smooth" });
    }

    function onKey(e: KeyboardEvent) {
      // ignore keys when modal is open
      if (openId) return;
      // ignore when typing in inputs (e.g., search box)
      if (isTypingTarget(e.target)) return;

      const el = containerRef.current;
      if (!el) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        el.scrollBy({ top: getRowHeight(), behavior: "smooth" });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        el.scrollBy({ top: -getRowHeight(), behavior: "smooth" });
      } else if (e.key === "PageDown") {
        e.preventDefault();
        el.scrollBy({ top: el.clientHeight * 0.9, behavior: "smooth" });
      } else if (e.key === "PageUp") {
        e.preventDefault();
        el.scrollBy({ top: -el.clientHeight * 0.9, behavior: "smooth" });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollToMonth(headerIndex + 1);          // jump to next month
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollToMonth(headerIndex - 1);          // jump to previous month
      } else if (e.key === "Home") {
        e.preventDefault();
        scrollToMonth(0);                         // today's month (index 0)
      }
    }

    window.addEventListener("keydown", onKey, { passive: false });
    return () => window.removeEventListener("keydown", onKey);
  }, [headerIndex, openId]);

  // Open/Add/Edit/Delete handlers
  function onOpenEntry(id: string) { setOpenId(id); }
  function onAddEntry(payload: Omit<JournalEntry, "id">) { add(payload); }
  function onEditEntry(id: string) {
    const e = entries.find((x) => x.id === id);
    if (!e) return;
    const next = Math.min(5, e.rating + 0.1);
    update(id, { rating: next });
  }
  function onDeleteEntry(id: string) {
    remove(id);
    if (openId === id) setOpenId(null);
  }

  const rendered = useMemo(
    () => indices.map((idx) => ({ idx, mDate: monthFromIndex(base, idx) })),
    [indices, base]
  );

  return (
    <>
      <div ref={containerRef} className="calendar-scroll" onScroll={onScroll}>
        {rendered.map(({ idx, mDate }) => (
          <div key={idx} ref={monthNode(idx)}>
            <MonthView
              monthDate={mDate}
              entriesByDay={entriesByDay}
              onOpenEntry={onOpenEntry}
              onHeight={(h) => handleHeight(idx, h)}
            />
          </div>
        ))}
      </div>

      <EntryModal
        openId={openId}
        setOpenId={setOpenId}
        ordered={orderedEntries}
        onEdit={onEditEntry}
        onDelete={onDeleteEntry}
      />

      <FloatingAddButton onAdd={onAddEntry} />
    </>
  );
}
