import React from "react";
import Navbar from "../components/Navbar.jsx";
import PieChartCustom from "../components/PieChartCustom.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import CalendarPricing from "../components/Heatmap.jsx";

export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} onSignOut={signOut} />

      <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
        <div className="mb-6">
          <GranularityDropdown />
        </div>

        <div className="mb-6">
          <Panel title="Spending Over Time">
            <LineChart />
          </Panel>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Panel title="Categories">
            <PieChartCustom />
          </Panel>
          <Panel title="Goals / Budgets">
            <ProgressList />
          </Panel>
        </div>

        <div className="mb-6">
          <Panel title="Activity Calendar" fullHeight>
            <CalendarPricing />
          </Panel>
        </div>

        <FloatingActionButton />
      </div>
    </div>
  );
}

function Panel({ title, children, fullHeight = false }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      {title && (
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide text-slate-700">{title}</h3>
        </div>
      )}
      <div className={fullHeight ? "w-full" : "h-[260px] md:h-[300px]"}>{children}</div>
    </section>
  );
}

export function GranularityDropdown() {
  const [selected, setSelected] = React.useState("Daily");
  const options = ["Hourly", "Daily", "Weekly", "Monthly", "Yearly"];

  return (
    <div className="inline-block">
      <label className="mb-2 block text-sm font-medium text-slate-700">
        Data Granularity
      </label>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 hover:border-slate-400"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

const Placeholder = ({ label }) => (
  <div className="flex h-full w-full items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white text-slate-400">
    <span className="text-sm font-semibold">{`<${label} />`}</span>
  </div>
);

export function LineChart() {
  // Sample data: last 7 days of spending
  const data = [
    { day: "Mon", amount: 45 },
    { day: "Tue", amount: 78 },
    { day: "Wed", amount: 32 },
    { day: "Thu", amount: 95 },
    { day: "Fri", amount: 42 },
    { day: "Sat", amount: 88 },
    { day: "Sun", amount: 55 },
  ];

  const dailyLimit = 70;
  const maxValue = Math.max(...data.map(d => d.amount), dailyLimit) + 15;
  
  // Chart dimensions
  const padding = { top: 20, right: 40, bottom: 40, left: 50 };

  const getX = (index, width) => {
    const chartWidth = width - padding.left - padding.right;
    return padding.left + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (value, height) => {
    const chartHeight = height - padding.top - padding.bottom;
    return padding.top + (1 - value / maxValue) * chartHeight;
  };

  return (
    <div className="relative h-full w-full">
      <svg
        viewBox="0 0 800 300"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="greenFill" x1="0%" y1="100%" x2="0%" y2="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="redFill" x1="0%" y1="50%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((value) => {
          const y = getY(value, 300);
          return (
            <g key={value}>
              <line
                x1={padding.left}
                y1={y}
                x2={800 - padding.right}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                className="text-xs fill-slate-400"
                style={{ fontSize: '11px' }}
              >
                ${value}
              </text>
            </g>
          );
        })}

        {/* Daily limit line (dotted) */}
        <line
          x1={padding.left}
          y1={getY(dailyLimit, 300)}
          x2={800 - padding.right}
          y2={getY(dailyLimit, 300)}
          stroke="#94a3b8"
          strokeWidth="2"
          strokeDasharray="6,4"
        />
        <text
          x={800 - padding.right + 5}
          y={getY(dailyLimit, 300) + 4}
          className="text-xs fill-slate-500 font-medium"
          style={{ fontSize: '11px' }}
        >
          ${dailyLimit}
        </text>

        {/* Area fills between the line and the daily limit */}
        {data.map((point, i) => {
          if (i === data.length - 1) return null;
          
          const x1 = getX(i, 800);
          const y1 = getY(point.amount, 300);
          const x2 = getX(i + 1, 800);
          const y2 = getY(data[i + 1].amount, 300);
          const limitY = getY(dailyLimit, 300);
          
          const isAboveLimit1 = point.amount > dailyLimit;
          const isAboveLimit2 = data[i + 1].amount > dailyLimit;
          
          // If crossing the limit, split into two triangular areas
          if (isAboveLimit1 !== isAboveLimit2) {
            // Calculate intersection point with daily limit line
            const slope = (y2 - y1) / (x2 - x1);
            const intersectX = x1 + (limitY - y1) / slope;
            
            return (
              <g key={`area-${i}`}>
                {/* First triangle (from start to intersection) */}
                <path
                  d={`M ${x1} ${y1} L ${intersectX} ${limitY} L ${x1} ${limitY} Z`}
                  fill={isAboveLimit1 ? "url(#redFill)" : "url(#greenFill)"}
                />
                {/* Second triangle (from intersection to end) */}
                <path
                  d={`M ${intersectX} ${limitY} L ${x2} ${y2} L ${x2} ${limitY} Z`}
                  fill={isAboveLimit2 ? "url(#redFill)" : "url(#greenFill)"}
                />
              </g>
            );
          }
          
          // Both points on same side - create single quadrilateral
          const fillColor = isAboveLimit1 ? "url(#redFill)" : "url(#greenFill)";
          const pathData = `M ${x1} ${y1} L ${x2} ${y2} L ${x2} ${limitY} L ${x1} ${limitY} Z`;
          
          return (
            <path
              key={`area-${i}`}
              d={pathData}
              fill={fillColor}
            />
          );
        })}

        {/* Line path - now with instant color changes */}
        {data.map((point, i) => {
          if (i === data.length - 1) return null;
          
          const x1 = getX(i, 800);
          const y1 = getY(point.amount, 300);
          const x2 = getX(i + 1, 800);
          const y2 = getY(data[i + 1].amount, 300);
          
          const isAboveLimit1 = point.amount > dailyLimit;
          const isAboveLimit2 = data[i + 1].amount > dailyLimit;
          
          // If crossing the limit, draw two line segments split at intersection
          if (isAboveLimit1 !== isAboveLimit2) {
            // Calculate intersection point with daily limit line
            const limitY = getY(dailyLimit, 300);
            const slope = (y2 - y1) / (x2 - x1);
            const intersectX = x1 + (limitY - y1) / slope;
            
            return (
              <g key={i}>
                {/* First segment */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={intersectX}
                  y2={limitY}
                  stroke={isAboveLimit1 ? "#ef4444" : "#10b981"}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {/* Second segment */}
                <line
                  x1={intersectX}
                  y1={limitY}
                  x2={x2}
                  y2={y2}
                  stroke={isAboveLimit2 ? "#ef4444" : "#10b981"}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </g>
            );
          }
          
          // Both points on same side of limit - single color
          const strokeColor = isAboveLimit1 ? "#ef4444" : "#10b981";
          
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={strokeColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
          );
        })}

        {/* Data points */}
        {data.map((point, i) => {
          const x = getX(i, 800);
          const y = getY(point.amount, 300);
          const isAboveLimit = point.amount > dailyLimit;
          const color = isAboveLimit ? "#ef4444" : "#10b981";
          
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="6"
                fill={color}
                stroke="white"
                strokeWidth="2"
              />
              {/* Tooltip on hover */}
              <title>${point.amount}</title>
            </g>
          );
        })}

        {/* X-axis labels */}
        {data.map((point, i) => {
          const x = getX(i, 800);
          return (
            <text
              key={i}
              x={x}
              y={300 - padding.bottom + 25}
              textAnchor="middle"
              className="text-sm fill-slate-600 font-medium"
              style={{ fontSize: '13px' }}
            >
              {point.day}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export function ProgressList() {
  return <Placeholder label="ProgressList" />;
}

export function SummaryCircle() {
  return <Placeholder label="SummaryCircle" />;
}

export function HeatMapCalendar() {
  return <Placeholder label="HeatMapCalendar" />;
}

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [expenseName, setExpenseName] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [category, setCategory] = React.useState("Food");

  const categories = ["Food", "Transportation", "Shopping", "Entertainment", "Bills", "Healthcare", "Other"];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log({ expenseName, amount, category });
    // Reset form
    setExpenseName("");
    setAmount("");
    setCategory("Food");
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Popup Form */}
      {isOpen && (
        <div className="popup-slide-up absolute bottom-20 right-0 w-80 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Add Expense</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Expense Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Expense Name
              </label>
              <input
                type="text"
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
                placeholder="e.g., Lunch at cafe"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                  $
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pl-7 text-sm text-slate-900 placeholder-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add Expense
            </button>
          </form>

          {/* Arrow pointing to button */}
          <div className="absolute -bottom-2 right-6 h-4 w-4 rotate-45 border-b border-r border-slate-200 bg-white" />
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Add"
        className={`flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl transition ${
          isOpen ? "rotate-45 scale-110" : "hover:scale-110"
        } hover:shadow-2xl`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}
