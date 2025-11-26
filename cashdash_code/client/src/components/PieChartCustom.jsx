import { useState, useEffect } from 'react'
import { getExpenseCategories } from '../services/expenses.js'
import {interpolateSpectral} from 'd3-scale-chromatic';

// Generate rainbow colors dynamically (Material UI style)
const generateRainbowColors = (count) => {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const t = count > 1 ? (i + 0.2) / (count - 1) : 0.95;
    colors.push(interpolateSpectral(t));
  }
  return colors;
};

function Panel({ title, children, action = null }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      {title && (
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide text-slate-700">{title}</h3>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="h-[260px] md:h-[300px]">{children}</div>
    </section>
  );
}

function Legend({ data, colors }) {
  return (
    <div className="h-full overflow-y-auto pr-2">
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded flex-shrink-0"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="text-sm text-slate-700 leading-snug">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomPieChart({ data }) {
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Generate rainbow colors based on data length
  const colors = generateRainbowColors(data.length);
  
  // Calculate angles for each slice
  let currentAngle = -90; // Start at top
  const slices = data.map((item, index) => {
    const percentage = item.value / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;
    
    return {
      ...item,
      startAngle,
      endAngle,
      percentage: percentage * 100,
      color: colors[index]
    };
  });

  const size = 280;
  const center = size / 2;
  const outerRadius = size / 2 - 10;
  const innerRadius = outerRadius * 0.5; // 50% inner radius for donut effect

  // Create SVG path for donut slice
  const createSlicePath = (startAngle, endAngle, outerRadius, innerRadius) => {
    // Handle full circle case (single category)
    if (endAngle - startAngle >= 359.9) {
      return `M ${center} ${center - outerRadius}
              A ${outerRadius} ${outerRadius} 0 1 1 ${center} ${center + outerRadius}
              A ${outerRadius} ${outerRadius} 0 1 1 ${center} ${center - outerRadius}
              M ${center} ${center - innerRadius}
              A ${innerRadius} ${innerRadius} 0 1 0 ${center} ${center + innerRadius}
              A ${innerRadius} ${innerRadius} 0 1 0 ${center} ${center - innerRadius}
              Z`;
    }

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1Outer = center + outerRadius * Math.cos(startRad);
    const y1Outer = center + outerRadius * Math.sin(startRad);
    const x2Outer = center + outerRadius * Math.cos(endRad);
    const y2Outer = center + outerRadius * Math.sin(endRad);
    
    const x1Inner = center + innerRadius * Math.cos(startRad);
    const y1Inner = center + innerRadius * Math.sin(startRad);
    const x2Inner = center + innerRadius * Math.cos(endRad);
    const y2Inner = center + innerRadius * Math.sin(endRad);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${x1Outer} ${y1Outer} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2Outer} ${y2Outer} L ${x2Inner} ${y2Inner} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1Inner} ${y1Inner} Z`;
  };

  // Calculate tooltip position
  const getTooltipPosition = (index) => {
    if (index === null) return { x: 0, y: 0 };
    const slice = slices[index];
    const midAngle = slice.startAngle + (slice.endAngle - slice.startAngle) / 2;
    const rad = (midAngle * Math.PI) / 180;
    const radius = outerRadius + 20; // Position outside the chart
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad)
    };
  };

  const tooltipPos = getTooltipPosition(hoveredSlice);

  return (
    <div className="relative">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
        {slices.map((slice, index) => (
          <path
            key={index}
            d={createSlicePath(slice.startAngle, slice.endAngle, outerRadius, innerRadius)}
            fill={slice.color}
            stroke="white"
            strokeWidth="0.5"
            className="transition-opacity cursor-pointer"
            style={{ opacity: hoveredSlice === null || hoveredSlice === index ? 1 : 0.6 }}
            onMouseEnter={() => setHoveredSlice(index)}
            onMouseLeave={() => setHoveredSlice(null)}
          >
            <title>{slice.label}: {Math.round(slice.percentage)}%</title>
          </path>
        ))}
      </svg>
      {hoveredSlice !== null && (
        <div 
          className="absolute bg-white rounded-lg shadow-lg px-3 py-2 pointer-events-none border border-slate-200 z-10"
          style={{ 
            left: tooltipPos.x, 
            top: tooltipPos.y,
            transform: 'translate(-50%, -50%)',
            whiteSpace: 'nowrap'
          }}
        >
          <div className="text-sm font-semibold text-slate-800">{slices[hoveredSlice].label}</div>
          <div className="text-lg font-bold text-slate-800">{Math.round(slices[hoveredSlice].percentage)}%</div>
        </div>
      )}
    </div>
  );
}

export default function PieChartCustom({ refreshKey = 0 }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const categories = await getExpenseCategories()
        
        // Transform the API data
        const chartData = categories.map((category, index) => ({
          id: index,
          value: category.total_cents / 100,
          label: category.category_name,
          percentage: category.pct
        }))
        
        setData(chartData)
      } catch (err) {
        console.error('Failed to fetch expense categories:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [refreshKey])

  return (
    <Panel title="Categories">
      {loading ? (
        <div className="flex h-full items-center justify-center">
          <div>Loading categories...</div>
        </div>
      ) : error ? (
        <div className="flex h-full items-center justify-center text-red-600">
          <p className="text-sm">Error loading categories: {error}</p>
        </div>
      ) : (
        <div className="flex h-full gap-8">
          <div className="flex-1 flex items-center justify-center">
            <CustomPieChart data={data} />
          </div>
          <div className="flex-shrink-0 flex items-center" style={{ width: '150px' }}>
            <div style={{ height: '66.67%', width: '100%' }}>
              <Legend data={data} colors={generateRainbowColors(data.length)} />
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}