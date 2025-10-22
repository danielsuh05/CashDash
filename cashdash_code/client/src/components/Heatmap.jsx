import React, { useMemo } from "react";
import './Heatmap.css';

// Helpers

// Format currency
function fmtUSD(n) {
  if (n == null) return "";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

// Compute a background color for a given price using HSL

function priceToTileStyle(price) {
  if (price == null) {
    // For days out of month
    return {
      backgroundColor: "#F1F2F5",
      color: "#6B7280" 
    };
  }
  const min = 160; 
  const max = 420; 
  const p = Math.max(min, Math.min(max, price));
  const t = (p - min) / (max - min); // 0..1

 // calculate hue saturation and lightness
  const hue = 230;
  const sat = 35 + t * 55; 
  const light = 90 - t * 55; 

  const bg = `hsl(${hue} ${sat}% ${light}%)`;

  // Choose text color 
  const textIsLight = light < 55;
  return {
    backgroundColor: bg,
    color: textIsLight ? "#FFFFFF" : "#111827" 
  };
}

// October 2025 prices

const priceByDate = {
  // Week 1 (Oct 1 is Wed)
  "2025-10-01": 180,
  "2025-10-02": 250,
  "2025-10-03": 180,
  "2025-10-04": 180,
  // Week 2
  "2025-10-05": 180,
  "2025-10-06": 180,
  "2025-10-07": 180,
  "2025-10-08": 180,
  "2025-10-09": 180,
  "2025-10-10": 250,
  "2025-10-11": 400,
  // Week 3
  "2025-10-12": 250,
  "2025-10-13": 180,
  "2025-10-14": 250,
  "2025-10-15": 180,
  "2025-10-16": 250,
  "2025-10-17": 180,
  "2025-10-18": 400,
  // Week 4
  "2025-10-19": 400,
  "2025-10-20": 250,
  "2025-10-21": 180,
  "2025-10-22": 180,
  "2025-10-23": 180,
  "2025-10-24": 400,
  "2025-10-25": 400,
  // Week 5
  "2025-10-26": 180,
  "2025-10-27": 180,
  "2025-10-28": 250,
  "2025-10-29": 250,
  "2025-10-30": 180,
  "2025-10-31": 180,
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Build a grid for Oct 2025 including leading/trailing days.
function useOctober2025Grid() {
  return useMemo(() => {
    const year = 2025;
    const month = 9; 
    const firstOfMonth = new Date(Date.UTC(year, month, 1));
    const lastOfMonth = new Date(Date.UTC(year, month + 1, 0));

    const startWeekday = firstOfMonth.getUTCDay();
    const daysInMonth = lastOfMonth.getUTCDate();

    // Previous month details for leading cells
    const prevMonthLast = new Date(Date.UTC(year, month, 0));
    const prevMonthDays = prevMonthLast.getUTCDate();

    const cells = [];

    // Blanks from previous month
    for (let i = 0; i < startWeekday; i++) {
      const day = prevMonthDays - (startWeekday - 1 - i);
      const key = `prev-${day}`;
      cells.push({ key, label: String(day), outOfMonth: true });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ key: iso, label: String(d), dateISO: iso });
    }

    // Trailing blanks to fill 5 rows * 7 cols = 35 cells
    while (cells.length % 7 !== 0) {
      const idx = cells.length - (startWeekday + daysInMonth);
      const day = idx + 1;
      cells.push({ key: `next-${day}`, label: String(day), outOfMonth: true });
    }

    // Ensure 5 rows 
    while (cells.length < 35) {
      const day = cells.length - (startWeekday + daysInMonth) + 1;
      cells.push({ key: `next-${day}`, label: String(day), outOfMonth: true });
    }

    return cells;
  }, []);
}

export default function CalendarPricing() {
  const cells = useOctober2025Grid();

  return (
    <div className="heatmap-container">
      <header className="heatmap-header">
        <h1 className="heatmap-title">October 2025</h1>
      </header>

      {/* Weekday labels */}
      <div className="heatmap-weekdays">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} className="heatmap-weekday-label">{w}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="heatmap-grid">
        {cells.map((cell) => {
          const price = cell.dateISO ? priceByDate[cell.dateISO] : undefined;
          const style = priceToTileStyle(cell.outOfMonth ? undefined : price);

          return (
            <div
              key={cell.key}
              aria-label={cell.dateISO ? `${cell.dateISO} ${price ? fmtUSD(price) : "no price"}` : `Out of month ${cell.label}`}
              className={`heatmap-tile ${cell.outOfMonth ? 'heatmap-tile--out-of-month' : 'heatmap-tile--interactive'}`}
              style={style}
            >
              {/* Day number */}
              <div className="heatmap-tile-day">
                {cell.label}
              </div>

              {/* Price */}
              {!cell.outOfMonth && price && (
                <div className="heatmap-tile-price">
                  {fmtUSD(price)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
