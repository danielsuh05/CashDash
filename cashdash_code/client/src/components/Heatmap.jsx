import React, { useMemo } from "react";
import './Heatmap.css';

// Helpers

// Format currency
function fmtUSD(n) {
  if (n == null) return "";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

// Budget baseline
const BUDGET = 150;

// Compute tile and price styles
// Light gray boxes with green/red text based on budget

function getTileStyles(price) {
  if (price == null) {
    // For days out of month - light gray
    return {
      tileStyle: {
        backgroundColor: "#F3F4F6",
      },
      priceColor: "#6B7280"
    };
  }
  
  const difference = price - BUDGET;
  const isAboveBudget = difference > 0;
  
  // White background for in-month boxes
  const tileStyle = {
    backgroundColor: "#FFFFFF"
  };
  
  // Green for below budget, red for above budget
  const priceColor = isAboveBudget ? "#DC2626" : "#16A34A"; // red-600 : green-600
  
  return {
    tileStyle,
    priceColor
  };
}

// October 2025 prices (wider spectrum around $150 budget)

const priceByDate = {
  // Week 1 (Oct 1 is Wed)
  "2025-10-01": 120,  // $30 below budget
  "2025-10-02": 280,  // $130 above budget
  "2025-10-03": 95,   // $55 below budget
  "2025-10-04": 145,  // $5 below budget
  // Week 2
  "2025-10-05": 155,  // $5 above budget
  "2025-10-06": 180,  // $30 above budget
  "2025-10-07": 220,  // $70 above budget
  "2025-10-08": 110,  // $40 below budget
  "2025-10-09": 135,  // $15 below budget
  "2025-10-10": 300,  // $150 above budget
  "2025-10-11": 320,  // $170 above budget
  // Week 3
  "2025-10-12": 160,  // $10 above budget
  "2025-10-13": 85,   // $65 below budget
  "2025-10-14": 240,  // $90 above budget
  "2025-10-15": 125,  // $25 below budget
  "2025-10-16": 200,  // $50 above budget
  "2025-10-17": 140,  // $10 below budget
  "2025-10-18": 350,  // $200 above budget
  // Week 4
  "2025-10-19": 310,  // $160 above budget
  "2025-10-20": 165,  // $15 above budget
  "2025-10-21": 105,  // $45 below budget
  "2025-10-22": 130,  // $20 below budget
  "2025-10-23": 148,  // $2 below budget
  "2025-10-24": 270,  // $120 above budget
  "2025-10-25": 185,  // $35 above budget
  // Week 5
  "2025-10-26": 115,  // $35 below budget
  "2025-10-27": 100,  // $50 below budget
  "2025-10-28": 195,  // $45 above budget
  "2025-10-29": 175,  // $25 above budget
  "2025-10-30": 142,  // $8 below budget
  "2025-10-31": 90,   // $60 below budget
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
          const { tileStyle, priceColor } = getTileStyles(cell.outOfMonth ? undefined : price);

          return (
            <div
              key={cell.key}
              aria-label={cell.dateISO ? `${cell.dateISO} ${price ? fmtUSD(price) : "no price"}` : `Out of month ${cell.label}`}
              className={`heatmap-tile ${cell.outOfMonth ? 'heatmap-tile--out-of-month' : 'heatmap-tile--interactive'}`}
              style={tileStyle}
            >
              {/* Day number */}
              <div className="heatmap-tile-day">
                {cell.label}
              </div>

              {/* Price */}
              {!cell.outOfMonth && price && (
                <div className="heatmap-tile-price" style={{ color: priceColor }}>
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
