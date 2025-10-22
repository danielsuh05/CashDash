import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Top Navigation Bar */}
      <nav className="top-nav">
        <div className="nav-left">Logo</div>
        <div className="nav-center">Achievements/Challenges</div>
        <div className="nav-right">Profile/Settings</div>
      </nav>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Granularity Label */}
        <div className="granularity-label">
          Change granularity of time
        </div>

        {/* KPI Boxes */}
        <div className="kpi-section">
          <div className="kpi-box">
            <div className="kpi-text">$500/$1000 this month</div>
          </div>
          <div className="kpi-box">
            <div className="kpi-text"># months under</div>
          </div>
        </div>

        {/* Line Chart Panel */}
        <div className="chart-panel">
          <div className="chart-header">
            <div className="y-axis-label">Expenses</div>
          </div>
          <div className="chart-content">
            {/* Placeholder for line chart */}
            <svg className="chart-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline
                points="5,80 20,60 35,70 50,40 65,55 80,30 95,45"
                fill="none"
                stroke="#999"
                strokeWidth="0.5"
              />
            </svg>
          </div>
          <div className="x-axis-label">Month</div>
        </div>

        {/* Two Panels: Bars and Circle */}
        <div className="visualization-section">
          <div className="bars-panel">
            <div className="bar-item"></div>
            <div className="bar-item"></div>
            <div className="bar-item"></div>
            <div className="bar-item"></div>
            <div className="bar-item"></div>
          </div>
          <div className="circle-panel">
            <div className="circle-placeholder"></div>
          </div>
        </div>

        {/* Grid of Cards */}
        <div className="cards-grid">
          {[...Array(25)].map((_, index) => (
            <div key={index} className="card-item"></div>
          ))}
        </div>
      </div>

      {/* Floating Add Button */}
      <button className="floating-add-button">+</button>
    </div>
  );
};

export default Dashboard;
