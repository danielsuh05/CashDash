import { PieChart } from '@mui/x-charts/PieChart'
import { useState, useEffect } from 'react'
import { getExpenseCategories } from '../services/expenses.js'

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

export default function PieChartCustom() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const categories = await getExpenseCategories()
        
        // Transform the API data to the format expected by PieChart
        const chartData = categories.map((category, index) => ({
          id: index,
          value: category.total_cents / 100, // Convert cents to dollars
          label: category.category_name,
          percentage: category.pct
        }))
        
        setData(chartData)
      } catch (err) {
        console.error('Failed to fetch expense categories:', err)
        setError(err.message)
        // Fallback to sample data
        setData([
          { id: 0, value: 10, label: 'Category A' },
          { id: 1, value: 15, label: 'Category B' },
          { id: 2, value: 20, label: 'Category C' },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Panel title="Categories">
      {loading ? (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div>Loading categories...</div>
        </div>
      ) : error && data.length === 0 ? (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div>Error loading data: {error}</div>
        </div>
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <PieChart
            series={[
              {
                data: data,
                innerRadius: 65,
                outerRadius: 100,
                valueFormatter: (value) => {
                  const percentage = (value.value / total) * 100;
                  return `${Math.round(percentage)}%`;
                },
              },
            ]}
            width={400}
          />
        </div>
      )}
    </Panel>
  );
}