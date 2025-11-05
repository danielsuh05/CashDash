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
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = React.useState(false);
  const [goals, setGoals] = React.useState([
    { name: 'Food & Dining', spent: 150, budget: 1000 },
    { name: 'Transportation', spent: 420, budget: 500 },
    { name: 'Entertainment', spent: 320, budget: 300 },
    { name: 'Shopping', spent: 680, budget: 800 },
    { name: 'Utilities', spent: 250, budget: 400 },
  ]);

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
          <Panel title="Categories">
            <PieChartCustom />
          </Panel>
          <Panel 
            title="Goals / Budgets"
            action={
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition focus:outline-none focus:ring-2 ${
                    isEditMode 
                      ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                      : 'bg-slate-600 text-white hover:bg-slate-700 focus:ring-slate-500'
                  }`}
                  title={isEditMode ? "Done editing" : "Edit budgets"}
                >
                  {isEditMode ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => setShowAddGoalModal(true)}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  title="Add new goal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
            }
          >
            <ProgressList 
              items={goals} 
              isEditMode={isEditMode}
              onUpdateBudget={(index, newBudget) => {
                const updated = [...goals];
                updated[index].budget = newBudget;
                setGoals(updated);
              }} 
            />
          </Panel>
        </div>

        {showAddGoalModal && (
          <AddGoalModal 
            onClose={() => setShowAddGoalModal(false)}
            onAdd={(newGoal) => {
              setGoals([...goals, { ...newGoal, spent: 0 }]);
              setShowAddGoalModal(false);
            }}
          />
        )}

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

function AddGoalModal({ onClose, onAdd }) {
  const [name, setName] = React.useState("");
  const [budget, setBudget] = React.useState("");
  const [type, setType] = React.useState("monthly");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && budget && parseFloat(budget) > 0) {
      onAdd({
        name,
        budget: parseFloat(budget),
        type,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">Add New Goal</h3>
          <button
            onClick={onClose}
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
              className="h-6 w-6"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Goal Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Goal Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Food & Dining"
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Budget Amount */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Budget Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                $
              </span>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pl-7 text-sm text-slate-900 placeholder-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Time Period
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
