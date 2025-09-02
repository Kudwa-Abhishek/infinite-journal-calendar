import {
  addMonths,          
  startOfMonth,       // normalize to first day of month
  endOfMonth,         
  startOfWeek,        
  endOfWeek,          
  eachDayOfInterval,  // array of dates between start..end
  isSameMonth,        // checks if two dates share month/year
  format,
  parse             
} from "date-fns";

// Choosing week start: 1 = Monday 
export const WEEK_STARTS_ON: 0 | 1 = 1;

// Given a base date and an integer month index (0=this month, -1=prev, +1=next),
// return the first day of that month.
export function monthFromIndex(base: Date, index: number) {
  return startOfMonth(addMonths(base, index));
}

// Human label for a month, e.g. "September 2025"
export function monthLabel(d: Date) {
  return format(d, "MMMM yyyy");
}

// Building a full month grid that includes leading/trailing days
// to fill whole weeks (so two months can be partially visible).
export function buildMonthGrid(d: Date) {
  const start = startOfWeek(startOfMonth(d), { weekStartsOn: WEEK_STARTS_ON });
  const end   = endOfWeek(endOfMonth(d),    { weekStartsOn: WEEK_STARTS_ON });
  const days = eachDayOfInterval({ start, end });
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

export function isSameMonthFast(a: Date, b: Date) {
  return isSameMonth(a, b);
}

// Weekday labels (Mon-first)
export function weekdayLabels() {
  return ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
}

export function parseDMY(dmy: string): Date {
  try {
    const parsed = parse(dmy, "dd/MM/yyyy", new Date());
    if (isNaN(parsed.getTime())) throw new Error("Invalid date");
    return parsed;
  } catch {
    return new Date(); // fallback = today
  }
}

// Return stable key for a date (safe)
export function dateKey(d: Date): string {
  if (isNaN(d.getTime())) {
    return format(new Date(), "yyyy-MM-dd"); // fallback
  }
  return format(d, "yyyy-MM-dd");
}