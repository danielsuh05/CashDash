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

export default function ProgressList() {
  const { formatCurrency, currency } = useCurrency();
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [showAddModal, setShowAddModal] = React.useState(false);
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
  }, [fetchBudgets]);

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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  <span className="text-2xl font-semibold text-slate-400">{formatCurrency(item.budget)}</span>
                )}
              </div>

              {/* Progress bar */}
              <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-200">
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
  const [selectedCategory, setSelectedCategory] = React.useState(null);
  const [budget, setBudget] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [categories, setCategories] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [loadingCategories, setLoadingCategories] = React.useState(true);

  // Fetch categories on component mount
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { getCategories } = await import('../services/budgets.js');
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.category-search-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSearchTerm(category.name);
    setShowDropdown(false);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true);
    
    // Clear selected category if search doesn't exactly match selected category
    if (selectedCategory && selectedCategory.name.toLowerCase() !== value.toLowerCase()) {
      setSelectedCategory(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const categoryNameToUse = selectedCategory ? selectedCategory.name : searchTerm.trim();
    
    if (categoryNameToUse && budget && parseFloat(budget) > 0) {
      setIsSubmitting(true);
      try {
        await onAdd(categoryNameToUse, parseFloat(budget));
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
          {/* Category Search */}
          <div className="relative">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Category
            </label>
            {loadingCategories ? (
              <div className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                Loading categories...
              </div>
            ) : (
              <div className="relative category-search-container">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search for a category..."
                  required
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                    selectedCategory 
                      ? 'border-green-300 bg-green-50 focus:border-green-500' 
                      : 'border-slate-300 bg-white focus:border-indigo-500'
                  }`}
                />
                
                {/* Dropdown */}
                {showDropdown && filteredCategories.length > 0 && (
                  <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                    {filteredCategories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleCategorySelect(category)}
                        className="block w-full px-3 py-2 text-left text-sm text-slate-900 hover:bg-indigo-50 hover:text-indigo-900 transition"
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* No results message with option to create new */}
                {showDropdown && searchTerm && filteredCategories.length === 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                    <p className="text-sm text-slate-500 mb-2">No categories found matching "{searchTerm}"</p>
                    <p className="text-xs text-indigo-600">✨ Press Enter or click "Add Budget" to create this as a new category</p>
                  </div>
                )}
              </div>
            )}
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
              disabled={isSubmitting || (!selectedCategory && !searchTerm.trim())}
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