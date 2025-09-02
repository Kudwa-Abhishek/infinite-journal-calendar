// Computes which month element has the largest visible area inside the scroll container.
// Returns that month's index (your virtual "month offset"), or null if none are visible.

export function mostVisibleByArea(
  container: HTMLElement,
  monthNodes: Array<{ index: number; el: HTMLElement }>
): number | null {
  const cRect = container.getBoundingClientRect();              // container’s viewport box
  let bestIndex: number | null = null;
  let bestArea = 0;

  for (const { index, el } of monthNodes) {
    const r = el.getBoundingClientRect();                       // month’s box on screen
    const top = Math.max(r.top, cRect.top);                     // clamp to container
    const bottom = Math.min(r.bottom, cRect.bottom);
    const height = Math.max(0, bottom - top);                   // visible height in container
    const width = Math.max(0, Math.min(r.right, cRect.right) - Math.max(r.left, cRect.left));
    const area = height * width;                                // visible area
    if (area > bestArea) {                                      // keep the largest
      bestArea = area;
      bestIndex = index;
    }
  }
  return bestIndex;
}
