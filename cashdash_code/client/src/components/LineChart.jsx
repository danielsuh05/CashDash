import React from "react";
import { useCurrency } from '../contexts/CurrencyContext.jsx';

export function LineChart() {

  //sample data and budgetLimit for now, will replace with API data later
  const data = [
    { month: "Jan", amount: 420 },
    { month: "Feb", amount: 435 },
    { month: "Mar", amount: 450 },
    { month: "Apr", amount: 390 },
    { month: "May", amount: 470 },
    { month: "Jun", amount: 510 },
    { month: "Jul", amount: 480 },
    { month: "Aug", amount: 530 },
    { month: "Sep", amount: 460 },
    { month: "Oct", amount: 500 },
    { month: "Nov", amount: 540 },
    { month: "Dec", amount: 600 },
  ];

  const budgetLimit = 500;

  //for currency formatting
  const { formatCurrency } = useCurrency();

  //Make budgetLimit is approximately centered to the graph
  const maxData = Math.max(...data.map(d => d.amount));
  const minData = Math.min(...data.map(d => d.amount));

  const halfRange = Math.max(Math.abs(maxData - budgetLimit), Math.abs(minData - budgetLimit));
  const paddingRange = halfRange * 0.15;

  const topValue = budgetLimit + halfRange + paddingRange;
  let bottomValue = budgetLimit - halfRange - paddingRange;
  if (bottomValue < 0) bottomValue = 0;
  
  const padding = { top: 20, right: -75, bottom: 40, left: -100 };

  const getX = (index, width) => {
    const chartWidth = width - padding.left - padding.right;
    return padding.left + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (value, height) => {
    const chartHeight = height - padding.top - padding.bottom;
    //Map y values from [bottomValue..topValue] to [padding.top .. padding.top+chartHeight]
    const t = (value - bottomValue) / (topValue - bottomValue);
    return padding.top + (1 - t) * chartHeight;
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
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="redFill" x1="0%" y1="50%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {(() => {
          //Have 5 horizontal grid lines based on dynamic values from budget
          const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(bottomValue + t * (topValue - bottomValue)));
          return ticks.map((value, idx) => {
            const y = getY(value, 300);
            return (
              <g key={idx}>
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
                  {formatCurrency(value)}
                </text>
              </g>
            );
          });
        })()}

        <line
          //Draw the budget limit line (dotted)
          x1={padding.left}
          y1={getY(budgetLimit, 300)}
          x2={800 - padding.right}
          y2={getY(budgetLimit, 300)}
          stroke="#94a3b8"
          strokeWidth="2"
          strokeDasharray="6,4"
        />
        <text
          x={800 - padding.right + 7}
          y={getY(budgetLimit, 300) + 4}
          className="text-xs fill-slate-500 font-medium"
          style={{ fontSize: '11px' }}
        >
          {"Budget Limit"}
        </text>

        
        {data.map((point, i) => {
          // Fill the areas between the lines and the dotted monthly limit line
          if (i === data.length - 1) return null;
          
          const x1 = getX(i, 800);
          const y1 = getY(point.amount, 300);
          const x2 = getX(i + 1, 800);
          const y2 = getY(data[i + 1].amount, 300);
          const limitY = getY(budgetLimit, 300);
          
          const isAboveLimit1 = point.amount > budgetLimit;
          const isAboveLimit2 = data[i + 1].amount > budgetLimit;
          
          // If crossing the limit, split into two triangular areas
          if (isAboveLimit1 !== isAboveLimit2) {
            // Calculate intersection point with budget limit line
            const slope = (y2 - y1) / (x2 - x1);
            const intersectX = x1 + (limitY - y1) / slope;
            
            return (
              <g key={`area-${i}`}>
                <path
                  // First triangle (from start to intersection)
                  d={`M ${x1} ${y1} L ${intersectX} ${limitY} L ${x1} ${limitY} Z`}
                  fill={isAboveLimit1 ? "url(#redFill)" : "url(#greenFill)"}
                />
                <path
                  //Second triangle (from intersection to end)
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

        {data.map((point, i) => {
          //Line path - now with instant color changes
          if (i === data.length - 1) return null;
          
          const x1 = getX(i, 800);
          const y1 = getY(point.amount, 300);
          const x2 = getX(i + 1, 800);
          const y2 = getY(data[i + 1].amount, 300);
          
          const isAboveLimit1 = point.amount > budgetLimit;
          const isAboveLimit2 = data[i + 1].amount > budgetLimit;
          
          // If crossing the limit, draw two line segments split at intersection
          if (isAboveLimit1 !== isAboveLimit2) {
            // Calculate intersection point with budget limit line
            const limitY = getY(budgetLimit, 300);
            const slope = (y2 - y1) / (x2 - x1);
            const intersectX = x1 + (limitY - y1) / slope;
            
            return (
              <g key={i}>
                <line
                  // First segment
                  x1={x1}
                  y1={y1}
                  x2={intersectX}
                  y2={limitY}
                  stroke={isAboveLimit1 ? "#ef4444" : "#10b981"}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <line
                  // Second segment
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

        {data.map((point, i) => {
          //Data points
          const x = getX(i, 800);
          const y = getY(point.amount, 300);
          const isAboveLimit = point.amount > budgetLimit;
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
              <title>${point.amount}</title>
            </g>
          );
        })}

        {data.map((point, i) => {
          //Label the x-axis
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
              {point.month}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
