import { useState } from "react";

type Props = {
  onAdd: (payload: {
    imgUrl: string;
    rating: number;
    categories: string[];
    date: string;           // "DD/MM/YYYY"
    description: string;
  }) => void;
};

export default function FloatingAddButton({ onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    imgUrl: "",
    rating: 4,
    categories: "Notes",
    date: "",
    description: "",
  });

  // helper: today in DD/MM/YYYY format
  function todayDMY(): string {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  if (!open) {
    return (
      <button className="fab" onClick={() => setOpen(true)}>
        + Add Entry
      </button>
    );
  }

  return (
    <div className="modal-backdrop" onClick={() => setOpen(false)}>
      <div className="card" onClick={(e) => e.stopPropagation()}>
        <div className="card-header">
          <strong>Add Journal Entry</strong>
        </div>

        <div className="card-body">
          <label>
            Image URL
            <input
              value={form.imgUrl}
              onChange={(e) => setForm({ ...form, imgUrl: e.target.value })}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 8,
                border: "1px solid #333",
                background: "#0c0c0c",
                color: "#eee",
              }}
            />
          </label>

          <label>
            Rating
            <input
              type="number"
              min={0}
              max={5}
              step="0.1"
              value={form.rating}
              onChange={(e) =>
                setForm({ ...form, rating: Number(e.target.value) })
              }
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 8,
                border: "1px solid #333",
                background: "#0c0c0c",
                color: "#eee",
              }}
            />
          </label>

          <label>
            Categories (comma separated)
            <input
              value={form.categories}
              onChange={(e) => setForm({ ...form, categories: e.target.value })}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 8,
                border: "1px solid #333",
                background: "#0c0c0c",
                color: "#eee",
              }}
            />
          </label>

          <label>
            Date (DD/MM/YYYY)
            <input
              placeholder="31/12/2025"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 8,
                border: "1px solid #333",
                background: "#0c0c0c",
                color: "#eee",
              }}
            />
          </label>

          <label>
            Description
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 8,
                border: "1px solid #333",
                background: "#0c0c0c",
                color: "#eee",
              }}
            />
          </label>
        </div>

        <div
          className="card-footer"
          style={{ justifyContent: "flex-end", gap: 8 }}
        >
          <button className="nav-btn" onClick={() => setOpen(false)}>
            Cancel
          </button>
          <button
            className="nav-btn"
            onClick={() => {
              // --- Safety checks before saving ---
              const imgUrl =
                form.imgUrl.trim() ||
                "https://picsum.photos/seed/journal/800/600";

              const rating = Number.isFinite(form.rating)
                ? Math.min(5, Math.max(0, form.rating))
                : 3;

              const categories = (form.categories || "General")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);

              // validate date format: DD/MM/YYYY
              const isValidDate = /^\d{2}\/\d{2}\/\d{4}$/.test(form.date);
              const date = isValidDate ? form.date : todayDMY();

              const description =
                form.description.trim() || "(no description)";

              onAdd({ imgUrl, rating, categories, date, description });
              setOpen(false);
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
