import  { useEffect, useRef, useState } from "react";
import type { JournalEntry } from "../store/useEntries";

type Props = {
  openId: string | null;
  setOpenId: (id: string | null) => void;
  ordered: JournalEntry[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export default function EntryModal({
  openId, setOpenId, ordered, onEdit, onDelete
}: Props) {
  const idx = ordered.findIndex(e => e.id === openId);
  const current = idx >= 0 ? ordered[idx] : null;

  const startX = useRef<number | null>(null);
  const [drag, setDrag] = useState(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!current) return;
      if (e.key === "Escape") setOpenId(null);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current]);

  function go(delta: -1 | 1) {
    if (!current) return;
    const next = ordered[idx + delta];
    if (next) setOpenId(next.id);
  }

  if (!current) return null;

  return (
    <div className="modal-backdrop" onClick={() => setOpenId(null)}>
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => { startX.current = e.touches[0].clientX; }}
        onTouchMove={(e) => {
          if (startX.current == null) return;
          setDrag(e.touches[0].clientX - startX.current);
        }}
        onTouchEnd={() => {
          if (drag > 70) go(-1);
          else if (drag < -70) go(1);
          setDrag(0); startX.current = null;
        }}
        style={{ transform: `translateX(${drag * 0.25}px)` }}
        aria-modal="true"
        role="dialog"
      >
        <div className="card-header">
          <button className="nav-btn" onClick={() => go(-1)} aria-label="Prev">◀</button>
          <strong>{current.date} — {current.categories.join(", ")}</strong>
          <button className="nav-btn" onClick={() => go(1)} aria-label="Next">▶</button>
        </div>
        <div className="card-body">
          <img
            src={current.imgUrl}
            alt="journal"
            style={{ width: "100%", borderRadius: 12, maxHeight: 360, objectFit: "cover" }}
          />
          <div>Rating: ⭐ {current.rating.toFixed(1)}</div>
          <p style={{ margin: 0, color: "#ddd" }}>{current.description}</p>
        </div>
        <div className="card-footer">
          <div style={{ display: "flex", gap: 8 }}>
            <button className="nav-btn" onClick={() => onEdit?.(current.id)}>Edit</button>
            <button className="nav-btn" onClick={() => onDelete?.(current.id)}>Delete</button>
          </div>
          <button className="nav-btn" onClick={() => setOpenId(null)}>Close</button>
        </div>
      </div>
    </div>
  );
}
