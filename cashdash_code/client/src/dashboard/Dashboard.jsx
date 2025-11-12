import React from "react";
import Navbar from "../components/Navbar.jsx";
import PieChartCustom from "../components/PieChartCustom.jsx";
import ProgressList from "../components/ProgressList.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import RecentPurchases from "../components/RecentPurchases.jsx";
import { LineChart } from "../components/LineChart.jsx";
import { FloatingActionButton } from '../components/AddExpenseButton.jsx'; 

export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} onSignOut={signOut} />

      <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
        

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
            <RecentPurchases purchases={[]} />
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
