import React from 'react';

function fmtUSD(n) {
  if (typeof n !== 'number') return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

function percent(spent, budget) {
  if (!budget || budget <= 0) return 0;
  return Math.round((spent / budget) * 100);
}

function progressToColor(p) {
  const clamped = Math.max(0, Math.min(100, p));
  const hue = 120 - (120 * clamped) / 100; // 120 (green) -> 0 (red)
  // Lightness: increase from 30% to 60% up to ~70%, then slightly darker to 50% at 100%
  const lightness = clamped < 70
    ? 30 + (30 * clamped) / 70
    : 60 - (10 * (clamped - 70)) / 30;
  const saturation = 80; // vivid color
  return `hsl(${Math.round(hue)}, ${saturation}%, ${Math.round(lightness)}%)`;
}

//ProgressList - Budget progress list matching the provided mock

export default function ProgressList({
  items = [
    { name: 'Food & Dining', spent: 150, budget: 1000 },
    { name: 'Transportation', spent: 420, budget: 500 },
    { name: 'Entertainment', spent: 320, budget: 300 },
    { name: 'Shopping', spent: 680, budget: 800 },
    { name: 'Utilities', spent: 250, budget: 400 },
  ],
}) {
  return (
    <div className="h-full overflow-auto pr-1">
      <ul className="space-y-4">
        {items.map((item) => {
          const p = percent(item.spent, item.budget);
          const clamped = Math.max(0, Math.min(100, p));
          const overBy = Math.max(0, item.spent - item.budget);
          const left = Math.max(0, item.budget - item.spent);
          const isOver = overBy > 0;

          return (
            <li
              key={item.name}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              aria-label={`${item.name} ${fmtUSD(item.spent)} of ${fmtUSD(item.budget)} (${clamped}%)`}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-800">{item.name}</div>
                <div className="text-sm">
                  <span className="font-semibold text-slate-900">{fmtUSD(item.spent)}</span>
                  <span className="text-slate-400"> / {fmtUSD(item.budget)}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative mb-2 h-4 w-full overflow-hidden rounded-full bg-slate-200 md:h-5">
                <div
                  className={`h-full transition-all`}
                  style={{
                    width: `${Math.min(100, clamped)}%`,
                    backgroundColor: isOver ? '#EF4444' : progressToColor(clamped),
                  }}
                />
                {/* Centered percentage text */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="text-[11px] font-semibold text-white drop-shadow-sm">{clamped}%</span>
                </div>
              </div>

              {/* Footer right: left/over */}
              <div className="flex items-center justify-end">
                {isOver ? (
                  <span className="text-xs font-semibold text-red-600">{fmtUSD(overBy)} over</span>
                ) : (
                  <span className="text-xs font-semibold text-green-600">{fmtUSD(left)} left</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
