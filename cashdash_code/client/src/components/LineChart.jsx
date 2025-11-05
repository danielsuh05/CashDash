import React from "react";

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
