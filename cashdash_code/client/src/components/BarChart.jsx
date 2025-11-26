import React, { useMemo, useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  Cell,
} from "recharts";
import { useCurrency } from "../contexts/CurrencyContext.jsx";
import { useBudget } from "../contexts/BudgetContext.jsx";
import { getMonthlyExpenses } from "../services/expenses.js";
import { getBudgets } from "../services/budgets.js";

export function SpendingBarChart() {
  const [rawData, setRawData] = useState([]);
  const [budgetLimit, setBudgetLimit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { formatCurrency } = useCurrency();
  const { budgetVersion } = useBudget();

  //get the monthly expense data and budget limit
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        //fetch both monthly expenses and budgets
        const [expensesData, budgetsData] = await Promise.all([
          getMonthlyExpenses(),
          getBudgets()
        ]);
        
        //calculate total budget limit by summing all category budgets
        const totalBudget = budgetsData.reduce((sum, category) => sum + category.budget, 0);
        
        setRawData(expensesData);
        setBudgetLimit(totalBudget);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [budgetVersion]);

  //preprocess data for spending over time view
  //calculate Y-axis domain with some padding
  const { data, bottomValue, topValue } = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return {
        data: [],
        bottomValue: 0,
        topValue: budgetLimit * 1.2 || 100
      };
    }

    const amounts = rawData.map((d) => d.amount);
    
    //include budget limit in the range calculation to ensure it's always visible
    const maxValue = Math.max(...amounts, budgetLimit);
    
    //add padding to the domain
    const topPadding = maxValue * 0.25;
    const bottomPadding = maxValue * 0.1;
    
    const top = maxValue + topPadding;
    const bottom = Math.max(0, -bottomPadding);

    const processed = rawData.map((d) => {
      return {
        ...d,
        amount: d.amount,
      };
    });

    return {
      data: processed,
      bottomValue: bottom,
      topValue: top,
    };
  }, [rawData, budgetLimit]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;
    const amount = payload.find((p) => p.dataKey === "amount")?.value;
    if (amount == null) return null;

    return (
      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
        <div className="font-medium text-slate-700">{label}</div>
        <div className="mt-1 text-slate-500">
          Spent: <span className="font-semibold">{formatCurrency(amount)}</span>
        </div>
        <div className="text-slate-400 text-[11px]">
          Budget limit: {formatCurrency(budgetLimit)}
        </div>
      </div>
    );
  };

  //loading state if data is being fetched
  if (loading) {
    return (
      <div className="relative h-full w-full flex items-center justify-center">
        <div className="text-slate-500 text-sm">Loading spending data...</div>
      </div>
    );
  }

  //error state if there was an error fetching data
  if (error) {
    return (
      <div className="relative h-full w-full flex items-center justify-center">
        <div className="text-red-500 text-sm">Error loading data: {error}</div>
      </div>
    );
  }

  //empty state if no data is available
  if (!rawData || rawData.length === 0) {
    return (
      <div className="relative h-full w-full flex items-center justify-center">
        <div className="text-slate-500 text-sm">No spending data available yet</div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 30, right: 100, bottom: 20, left: 10 }}
          barGap={8}
        >
          <CartesianGrid 
            stroke="#e2e8f0" 
            strokeDasharray="3 3" 
            vertical={false}
            strokeOpacity={0.5}
          />

          <XAxis
            dataKey="month"
            tick={{ fill: "#475569", fontSize: 13, fontWeight: 500 }}
            axisLine={false}
            tickMargin={10}
            tickLine={false}
          />

          <YAxis
            tickFormatter={(value) => formatCurrency(value)}
            tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            tickMargin={15}
            width={75}
            domain={[bottomValue, topValue]}
          />
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }}
            wrapperStyle={{ pointerEvents: 'auto' }}
          />
          <Bar
            dataKey="amount"
            radius={[8, 8, 8, 8]}
            maxBarSize={40}
            isAnimationActive={false}
          >
            {data.map((entry, index) => {
              const isAboveLimit = entry.amount > budgetLimit;
              //soft green for under budget, soft red for over budget
              const color = isAboveLimit 
                ? "rgba(239, 68, 68, 0.85)" 
                : "rgba(16, 185, 129, 0.85)";
              const hoverColor = isAboveLimit
                ? "rgba(239, 68, 68, 1)"      //bighter red on hover
                : "rgba(16, 185, 129, 1)";    //brighter green on hover
              
              return (
                <Cell 
                  key={`cell-${index}`} 
                  fill={color}
                  style={{ 
                    transition: 'all 0.2s ease',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0))',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.fill = hoverColor;
                    e.target.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.fill = color;
                    e.target.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0))';
                  }}
                />
              );
            })}
          </Bar>

          <ReferenceLine
            y={budgetLimit}
            stroke="#6366f1"
            strokeDasharray="6 4"
            strokeWidth={2}
            label={{
              position: "right",
              value: "Budget Limit",
              fill: "#6366f1",
              fontSize: 11,
              fontWeight: 600,
              offset: 10,
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
