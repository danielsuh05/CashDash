import React from 'react';
import { useCurrency } from '../contexts/CurrencyContext.jsx';
import { updateBudget, createBudget, getBudgets } from '../services/budgets.js';

function Panel({ title, children, action = null }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      {title && (
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="h-[260px] md:h-[300px]">{children}</div>
    </section>
  );
}

function percent(spent, budget) {
  if (!budget || budget <= 0) return 0;
  return Math.round((spent / budget) * 100);
}

//ProgressList - Budget progress list matching the provided mock

// Helper function to get currency symbol from currency code
function getCurrencySymbol(currencyCode) {
  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    // Extract the symbol from a formatted number
    const parts = formatter.formatToParts(1000);
    const symbolPart = parts.find(part => part.type === 'currency');
    return symbolPart ? symbolPart.value : '$';
  } catch (err) {
    return '$'; // Fallback to $ if there's an error
  }
}

export default function ProgressList({ refreshKey = 0, onDataChanged }) {
  const { formatCurrency, currency } = useCurrency();
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [newItem, setNewItem] = React.useState(null);
  const [editingValues, setEditingValues] = React.useState({});

  const fetchBudgets = React.useCallback(async () => {
    try {
      setLoading(true);
      const budgetData = await getBudgets();
      setItems(budgetData);
      setError(null);
    } catch (err) {
      console.error('Error fetching budgets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets, refreshKey]);

  const handleBudgetChange = (index, value) => {
    setEditingValues(prev => ({
      ...prev,
      [index]: value
    }));
  };

  const handleBudgetBlur = async (index) => {
    const value = editingValues[index];
    if (value === undefined) return; // No change made
    
    const newBudget = parseFloat(value);
    if (!isNaN(newBudget) && newBudget > 0) {
      try {
        const categoryName = items[index].name;
        await updateBudget(categoryName, newBudget);
        
        const updated = [...items];
        updated[index].budget = newBudget;
        setItems(updated);
      } catch (error) {
        console.error('Failed to update budget:', error);
        alert('Failed to update budget: ' + error.message);
        // Reset to original value on error
        const updated = {...editingValues};
        delete updated[index];
        setEditingValues(updated);
      }
    } else {
      // Invalid value so reset to original
      const updated = {...editingValues};
      delete updated[index];
      setEditingValues(updated);
    }
  };

  const handleBudgetKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.target.blur(); 
    } else if (e.key === 'Escape') {
      // Reset to original value
      const updated = {...editingValues};
      delete updated[index];
      setEditingValues(updated);
      e.target.blur();
    }
  };

  const saveNewItem = async () => {
    if (!newItem || !newItem.name || !newItem.budget) return;
    
    const budgetVal = parseFloat(newItem.budget);
    if (isNaN(budgetVal) || budgetVal <= 0) {
      alert("Please enter a valid budget amount");
      return;
    }
    
    setLoading(true);
    try {
      await createBudget(newItem.name, budgetVal);
      await fetchBudgets();
      setNewItem(null);
      
      // Trigger refresh of other components (budget creation may create a new category)
      if (onDataChanged) {
        onDataChanged();
      }
    } catch (err) {
      console.error('Error creating budget:', err);
      alert('Failed to create budget: ' + err.message);
      setLoading(false);
    }
  };

  const handleNewItemKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveNewItem();
    } else if (e.key === 'Escape') {
      setNewItem(null);
    }
  };


  const actionButtons = (
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
        onClick={() => newItem ? setNewItem(null) : setNewItem({ name: '', budget: '' })}
        className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 ${
          newItem 
            ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
            : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
        }`}
        title={newItem ? "Cancel" : "Add new budget"}
      >
        {newItem ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        )}
      </button>
    </div>
  );

  return (
    <Panel title="Goals / Budgets" action={actionButtons}>
      {loading ? (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div>Loading budgets...</div>
        </div>
      ) : error ? (
        <div className="flex h-full items-center justify-center text-red-600">
          <p className="text-sm">Error loading budgets: {error}</p>
        </div>
      ) : (
        <div className="h-full overflow-auto p-1">
        {items.length === 0 && !newItem ? (
          <div className="flex h-full items-center justify-center text-slate-500">
            <p className="text-sm">No budgets found. Add a new goal to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {newItem && (
              <div className="flex flex-col">
                <div className="mb-2">
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    onKeyDown={handleNewItemKeyDown}
                    placeholder="Category Name"
                    autoFocus
                    className="text-sm font-semibold text-black bg-transparent rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>
                <div className="mb-3 flex items-baseline gap-1">
                  <span className="text-2xl font-semibold text-slate-600">
                    {formatCurrency(0)}
                  </span>
                  <span className="text-2xl text-slate-400">/ </span>
                  <div className="flex items-stretch gap-2">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-2xl font-semibold text-slate-400 pointer-events-none z-10">
                        {getCurrencySymbol(currency)}
                      </span>
                      <input
                        type="number"
                        value={newItem.budget}
                        onChange={(e) => setNewItem({ ...newItem, budget: e.target.value })}
                        onKeyDown={handleNewItemKeyDown}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="text-2xl font-semibold text-slate-400 bg-transparent rounded px-2 py-0 pl-6 pr-2 focus:outline-none focus:ring-2 focus:ring-slate-300 w-28 leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        style={{ lineHeight: '1' }}
                      />
                    </div>
                    <button
                      onClick={saveNewItem}
                      className="flex items-center justify-center rounded bg-green-600 px-3 text-xs font-semibold text-white hover:bg-green-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
                <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: '0%',
                      backgroundColor: '#6366f1',
                    }}
                  />
                </div>
              </div>
            )}
            {items.map((item, index) => {
          const p = percent(item.spent, item.budget);
          const clamped = Math.max(0, Math.min(100, p));
          const isOverBudget = item.spent > item.budget;
          const isNearBudget = !isOverBudget && p >= 80; // within 20% of budget (80% or more)
          // Color priority: red if over, orange if within 20%, indigo otherwise
          const progressColor = isOverBudget ? '#ef4444' : (isNearBudget ? '#f97316' : '#6366f1'); // red-500 if over, orange-500 if near, indigo-500 otherwise
          const currentEditValue = editingValues[index] !== undefined 
            ? editingValues[index] 
            : item.budget.toString();

          return (
            <div
              key={item.name}
              className="flex flex-col"
              aria-label={`${item.name} ${formatCurrency(item.spent)} of ${formatCurrency(item.budget)} (${clamped}%)`}
            >
              {/* Category Header */}
              <div className="mb-2">
                <div className="text-sm font-semibold text-black">{item.name}</div>
              </div>

              {/* Spending Details */}
              <div className="mb-3 flex items-baseline gap-1">
                <span 
                  className="text-2xl font-semibold text-slate-600"
                >
                  {formatCurrency(item.spent)}
                </span>
                <span className="text-2xl text-slate-400">/ </span>
                {isEditMode ? (
                  <div className="relative inline-block">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-2xl font-semibold text-slate-400 pointer-events-none z-10">
                      {getCurrencySymbol(currency)}
                    </span>
                    <input
                      type="number"
                      value={currentEditValue}
                      onChange={(e) => handleBudgetChange(index, e.target.value)}
                      onBlur={() => handleBudgetBlur(index)}
                      onKeyDown={(e) => handleBudgetKeyDown(e, index)}
                      step="0.01"
                      min="0"
                      className="text-2xl font-semibold text-slate-400 bg-white border border-slate-300 rounded px-2 py-0 pl-6 pr-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-28 leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      style={{ lineHeight: '1' }}
                    />
                  </div>
                ) : (
                  <span className="text-2xl font-semibold text-slate-400">{item.budget === 0 ? 'N/A' : formatCurrency(item.budget)}</span>
                )}
              </div>

              {/* Progress bar */}
              <div
                className="relative h-4 w-full overflow-hidden rounded-full bg-slate-200"
                style={item.budget === 0 ? {
                  backgroundImage: 'linear-gradient(45deg, #94a3b8 25%, transparent 25%, transparent 50%, #94a3b8 50%, #94a3b8 75%, transparent 75%, transparent)',
                  backgroundSize: '1rem 1rem'
                } : {}}
              >
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${Math.min(100, clamped)}%`,
                    backgroundColor: progressColor,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
        )}
        </div>
      )}

    </Panel>
  );
}
