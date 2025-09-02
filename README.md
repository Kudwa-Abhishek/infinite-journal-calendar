# Infinite Journal Calendar

An infinite vertically scrolling, mobile-optimized calendar where the header month updates based on scroll, and **journal entries** are shown on their dates. Entries open in a **swipable card** (left/right + touch), with search/filter, keyboard navigation, and smooth performance.

**Live Demo:** https://infinite-journal-calendar.vercel.app  
**Repository:** https://github.com/Kudwa-Abhishek/infinite-journal-calendar

---

## ✨ Features

- **Infinite vertical scroll** (past & future) with seamless month loading (no jumps/flicker)
- **Continuous scrolling** (not snap-to-month); two months may be partially visible
- **Dynamic month header** shows whichever month is most visible in the viewport
- **Correct month grids** (Mon-first) with leading/trailing spillover days
- **Journal entries** rendered on their exact dates (image, rating, categories, description)
- **Swipable entry viewer** (touch swipe + ←/→ keys, Esc to close)
- **Responsive & mobile-optimized** layout and targets
- **Performance**: virtualized/windowed months, rAF-throttled scroll, capped DOM size
- **Persistence**: entries saved to `localStorage`
- **Search / Filter**: matches description, categories, date text, or rating
- **Keyboard navigation**: ArrowUp/Down (week), PageUp/Down (screen), ArrowLeft/Right (prev/next month), Home (go to current month)
- **Safety**: error boundary; robust date parsing & safe defaults on add

---

## 🧱 Tech Stack

- **React + TypeScript** (Vite)
- **date-fns** for date math
- **Zustand** for state + `localStorage` persistence
- **CSS** (hand-rolled, no prebuilt calendar components)

> Note: No prebuilt calendar libraries used — core calendar logic/rendering implemented manually.

---

## 📦 Project Structure

src/
components/
Calendar.tsx # infinite/windowed scroller + header sync + filter
MonthView.tsx # month grid (weeks x 7 days)
DayCell.tsx # day cell + entry chips
EntryModal.tsx # swipable card UI
FloatingAddButton.tsx# add-entry modal
Header.tsx # animated month label + search box
ErrorBoundary.tsx # runtime safeguard
lib/
date.ts # date helpers, safe parseDMY/dateKey, grid building
viewport.ts # most-visible-month by area
store/
useEntries.ts # zustand store + localStorage (add/update/remove/loadSeed)
data/
sampleEntries.json # example entries (DD/MM/YYYY)
App.tsx
main.tsx
styles.css

## 🚀 Getting Started (Local)

### Prerequisites
- Node.js 18+ (or 20+)
- npm 9/10+
- Git

### Install & Run
```bash
npm install
npm run dev
# open http://localhost:5173
Build & Preview
bash
Copy code
npm run build
npm run preview
# open the printed URL (typically http://localhost:4173)

Data Format (journal entries)

src/data/sampleEntries.json (DD/MM/YYYY):

[
  {
    "imgUrl": "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
    "rating": 4.8,
    "categories": ["Deep Conditioning", "Moisture", "Hair Growth", "Natural Products"],
    "date": "05/08/2025",
    "description": "Finally tried the coconut oil deep conditioning treatment. Hair feels softer."
  }
]

How it Works (Performance & Smoothness)

Windowed months: render a limited band of months (initial 13, max 26) for steady memory.

Extend / prune: when near top/bottom, add EXTEND_BY months and prune the far edge.

Scroll anchoring: measure month heights; compensate scrollTop so the viewport never jumps.

Dominant month: compute the month with the largest visible area in the scroll container.

rAF throttling: scroll work runs inside requestAnimationFrame to avoid jank.

Deployment (Vercel)

Repo is connected to Vercel; pushing to main triggers a new deploy.

Live URL: https://infinite-journal-calendar.vercel.app
