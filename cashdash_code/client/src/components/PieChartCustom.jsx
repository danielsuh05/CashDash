import { PieChart } from '@mui/x-charts/PieChart'
import { useState, useEffect } from 'react'
import { getExpenseCategories } from '../services/expenses.js'

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

  if (loading) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div>Loading categories...</div>
      </div>
    )
  }

  if (error && data.length === 0) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div>Error loading data: {error}</div>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
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
  );
}