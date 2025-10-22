import React from "react";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import CalendarPricing from "../components/Heatmap.jsx";

export default function Dashboard() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} onSignOut={handleSignOut} />

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
            <PieChart />
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
  return <Placeholder label="LineChart" />;
}

export function ProgressList() {
  return <Placeholder label="ProgressList" />;
}

export function SummaryCircle() {
  return <Placeholder label="SummaryCircle" />;
}

export function PieChart() {
  return <Placeholder label="PieChart" />;
}

export function HeatMapCalendar() {
  return <Placeholder label="HeatMapCalendar" />;
}



export function FloatingActionButton() {
  return (
    <button
      aria-label="Add"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl transition hover:scale-110 hover:shadow-2xl"
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
  );
}
