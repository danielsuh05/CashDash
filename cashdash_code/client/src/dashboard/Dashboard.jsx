import React from "react";
import Navbar from "../components/Navbar.jsx";
import PieChartCustom from "../components/PieChartCustom.jsx";
import ProgressList from "../components/ProgressList.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import CalendarPricing from "../components/Heatmap.jsx";
import { LineChart } from "../components/LineChart.jsx";
import { FloatingActionButton } from '../components/PlusButtonPopup.jsx'; 

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [currentDate, setCurrentDate] = React.useState(new Date(2025, 9, 1)); // October 2025

  // Sample data - in production, this would come from your backend API
  // Format: { "YYYY-MM-DD": amount }
  const sampleData = {
    "2025-10-01": 120,
    "2025-10-02": 280,
    "2025-10-03": 95,
    "2025-10-04": 145,
    "2025-10-05": 155,
    "2025-10-06": 180,
    "2025-10-07": 220,
    "2025-10-08": 110,
    "2025-10-09": 135,
    "2025-10-10": 300,
    "2025-10-11": 320,
    "2025-10-12": 160,
    "2025-10-13": 85,
    "2025-10-14": 240,
    "2025-10-15": 125,
    "2025-10-16": 200,
    "2025-10-17": 140,
    "2025-10-18": 350,
    "2025-10-19": 310,
    "2025-10-20": 165,
    "2025-10-21": 105,
    "2025-10-22": 130,
    "2025-10-23": 148,
    "2025-10-24": 270,
    "2025-10-25": 185,
    "2025-10-26": 115,
    "2025-10-27": 100,
    "2025-10-28": 195,
    "2025-10-29": 175,
    "2025-10-30": 142,
    "2025-10-31": 90,
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

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
          <PieChartCustom />
          <ProgressList />
        </div>

        <div className="mb-6">
          <Panel title={null} fullHeight>
            <CalendarPricing 
              data={sampleData}
              budget={150}
              date={currentDate}
              onPreviousMonth={handlePreviousMonth}
              onNextMonth={handleNextMonth}
            />
          </Panel>
        </div>

        <FloatingActionButton />
      </div>
    </div>
  );
}

function Panel({ title, children, fullHeight = false, action = null }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      {title && (
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide text-slate-700">{title}</h3>
          {action && <div>{action}</div>}
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

// ProgressList is provided by components/ProgressList.jsx

export function SummaryCircle() {
  return <Placeholder label="SummaryCircle" />;
}

export function HeatMapCalendar() {
  return <Placeholder label="HeatMapCalendar" />;
}
