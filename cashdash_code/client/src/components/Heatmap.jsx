import React, { useMemo } from "react";
import './Heatmap.css';

// Helpers

// Format currency
function fmtUSD(n) {
  if (n == null) return "";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

// Compute tile and price styles
// Light gray boxes with green/red text based on budget

function getTileStyles(price, budget) {
  if (price == null) {
    // For days out of month - light gray
    return {
      tileStyle: {
        backgroundColor: "#F3F4F6",
      },
      priceColor: "#6B7280"
    };
  }
  
  const difference = price - budget;
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

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Build a calendar grid for a given month/year
function useCalendarGrid(year, month) {
  return useMemo(() => {
    // month is 0-indexed (0 = January, 11 = December)
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
  }, [year, month]);
}

/**
 * CalendarPricing - A heatmap calendar component for displaying daily spending data
 * 
 * @param {Object} props
 * @param {Object} props.data - Object mapping date strings (YYYY-MM-DD) to spending amounts
 * @param {number} props.budget - Daily budget amount (default: 150)
 * @param {Date|Object} props.date - Date object or {year, month} for the month to display (default: current month)
 * @param {Function} props.onPreviousMonth - Callback for previous month navigation
 * @param {Function} props.onNextMonth - Callback for next month navigation
 */
export default function CalendarPricing({ 
  data = {}, 
  budget = 150,
  date = new Date(),
  onPreviousMonth,
  onNextMonth
}) {
  // Determine year and month from date prop
  let year, month;
  if (date instanceof Date) {
    year = date.getFullYear();
    month = date.getMonth(); // 0-indexed
  } else if (date && typeof date === 'object') {
    year = date.year || new Date().getFullYear();
    month = (date.month || new Date().getMonth()); // 0-indexed
  } else {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth();
  }

  const cells = useCalendarGrid(year, month);

  // Format month title
  const monthTitle = new Date(year, month).toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="heatmap-container">
      <header className="heatmap-header">
        <h1 className="heatmap-title">{monthTitle}</h1>
        {(onPreviousMonth || onNextMonth) && (
          <div className="heatmap-navigation">
            {onPreviousMonth && (
              <button
                onClick={onPreviousMonth}
                className="heatmap-nav-button"
                aria-label="Previous month"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            )}
            {onNextMonth && (
              <button
                onClick={onNextMonth}
                className="heatmap-nav-button"
                aria-label="Next month"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            )}
          </div>
        )}
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
          const price = cell.dateISO ? data[cell.dateISO] : undefined;
          const { tileStyle, priceColor } = getTileStyles(cell.outOfMonth ? undefined : price, budget);

          return (
            <div
              key={cell.key}
              aria-label={cell.dateISO ? `${cell.dateISO} ${price != null ? fmtUSD(price) : "no price"}` : `Out of month ${cell.label}`}
              className={`heatmap-tile ${cell.outOfMonth ? 'heatmap-tile--out-of-month' : 'heatmap-tile--interactive'}`}
              style={tileStyle}
            >
              {/* Day number */}
              <div className="heatmap-tile-day">
                {cell.label}
              </div>

              {/* Price */}
              {!cell.outOfMonth && price != null && (
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
