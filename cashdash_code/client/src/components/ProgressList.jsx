import React from 'react';
import { useCurrency } from '../contexts/CurrencyContext.jsx';
import { updateBudget, createBudget, getBudgets } from '../services/budgets.js';

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

function percent(spent, budget) {
  if (!budget || budget <= 0) return 0;
  return Math.round((spent / budget) * 100);
}

function progressToColor(p) {
  const clamped = Math.max(0, Math.min(100, p));
  const hue = 120 - (120 * clamped) / 100; // 120 (green) -> 0 (red)
  // Lightness: increase from 30% to 60% up to ~70%, then slightly darker to 50% at 100%
  const lightness = clamped < 70
    ? 30 + (30 * clamped) / 70
    : 60 - (10 * (clamped - 70)) / 30;
  const saturation = 80; // vivid color
  return `hsl(${Math.round(hue)}, ${saturation}%, ${Math.round(lightness)}%)`;
}

//ProgressList - Budget progress list matching the provided mock

export default function ProgressList() {
  const { formatCurrency } = useCurrency();
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [editingIndex, setEditingIndex] = React.useState(null);
  const [editValue, setEditValue] = React.useState("");

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
  }, [fetchBudgets]);

  const handleStartEdit = (index, currentBudget) => {
    setEditingIndex(index);
    setEditValue(currentBudget.toString());
  };

  const handleSaveEdit = async (index) => {
    const newBudget = parseFloat(editValue);
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
      }
    }
    setEditingIndex(null);
    setEditValue("");
  };

  const handleAddBudget = async (categoryName, budget) => {
    try {
      await createBudget(categoryName, budget);

      await fetchBudgets();
      setShowAddModal(false);
    } catch (err) {
      console.error('Error creating budget:', err);
      alert('Failed to create budget: ' + err.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue("");
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      handleSaveEdit(index);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
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
        onClick={() => setShowAddModal(true)}
        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        title="Add new budget"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
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
        <div className="h-full overflow-auto pr-1">
        {items.length === 0 ? (
          <div className="flex h-full items-center justify-center text-slate-500">
            <p className="text-sm">No budgets found. Add a new goal to get started!</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {items.map((item, index) => {
          const p = percent(item.spent, item.budget);
          const clamped = Math.max(0, Math.min(100, p));
          const overBy = Math.max(0, item.spent - item.budget);
          const left = Math.max(0, item.budget - item.spent);
          const isOver = overBy > 0;
          const isEditing = isEditMode && editingIndex === index;

          return (
            <li
              key={item.name}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              aria-label={`${item.name} ${formatCurrency(item.spent)} of ${formatCurrency(item.budget)} (${clamped}%)`}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-800">{item.name}</div>
                <div className="text-sm flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{formatCurrency(item.spent)}</span>
                  <span className="text-slate-400"> / </span>
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                          $
                        </span>
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          onBlur={() => handleSaveEdit(index)}
                          autoFocus
                          step="0.01"
                          min="0"
                          className="w-24 rounded border border-indigo-500 bg-white px-2 py-0.5 pl-5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                    </div>
                  ) : isEditMode ? (
                    <button
                      onClick={() => handleStartEdit(index, item.budget)}
                      className="text-slate-600 hover:text-indigo-600 transition underline decoration-dotted"
                      title="Click to edit budget"
                    >
                      {formatCurrency(item.budget)}
                    </button>
                  ) : (
                    <span className="text-slate-400">{formatCurrency(item.budget)}</span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative mb-2 h-4 w-full overflow-hidden rounded-full bg-slate-200 md:h-5">
                <div
                  className={`h-full transition-all`}
                  style={{
                    width: `${Math.min(100, clamped)}%`,
                    backgroundColor: isOver ? '#EF4444' : progressToColor(clamped),
                  }}
                />
                {/* Centered percentage text */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="text-[11px] font-semibold text-white drop-shadow-sm">{clamped}%</span>
                </div>
              </div>

              {/* Footer right: left/over */}
              <div className="flex items-center justify-end">
                {isOver ? (
                  <span className="text-xs font-semibold text-red-600">{formatCurrency(overBy)} over</span>
                ) : (
                  <span className="text-xs font-semibold text-green-600">{formatCurrency(left)} left</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
        )}
        </div>
      )}

      {/* Add Budget Modal */}
      {showAddModal && (
        <AddBudgetModal 
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddBudget}
        />
      )}
    </Panel>
  );
}

function AddBudgetModal({ onClose, onAdd }) {
  const [name, setName] = React.useState("");
  const [budget, setBudget] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name && budget && parseFloat(budget) > 0) {
      setIsSubmitting(true);
      try {
        await onAdd(name, parseFloat(budget));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">Add New Budget</h3>
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
          {/* Category Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Category Name
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

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding...' : 'Add Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}