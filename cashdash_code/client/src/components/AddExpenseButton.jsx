
import React from 'react';
import { getCategories, createExpense } from '../services/expenses.js';

export function FloatingActionButton() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [expenseName, setExpenseName] = React.useState("");
    const [amount, setAmount] = React.useState("");
    const [selectedCategory, setSelectedCategory] = React.useState(null);
    const [categories, setCategories] = React.useState([]);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [showDropdown, setShowDropdown] = React.useState(false);
    const [loadingCategories, setLoadingCategories] = React.useState(true);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState("");

    // Load categories when component mounts
    React.useEffect(() => {
        loadCategories();
    }, []);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDropdown && !event.target.closest('.expense-category-search-container')) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    const loadCategories = async () => {
        try {
            setLoadingCategories(true);
            const categoriesData = await getCategories();
            setCategories(categoriesData);
            // Don't auto-select first category - let user search and select
        } catch (err) {
            console.error('Failed to load categories:', err);
            setError('Failed to load categories');
        } finally {
            setLoadingCategories(false);
        }
    };
  
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
      setIsLoading(true);
      setError("");

      try {
        const categoryNameToUse = selectedCategory ? selectedCategory.name : searchTerm.trim();
        
        await createExpense({
          title: expenseName,
          amount: amount,
          categoryName: categoryNameToUse
        });
        
        // Reset form on success
        setExpenseName("");
        setAmount("");
        setSelectedCategory(null);
        setSearchTerm("");
        setIsOpen(false);
        
        // You might want to trigger a refresh of the dashboard here
        // window.location.reload(); // or use a callback prop
        
      } catch (err) {
        console.error('Failed to create expense:', err);
        setError(err.message || 'Failed to add expense');
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <div className="fixed bottom-6 right-6 z-50">
        {/* Popup Form */}
        {isOpen && (
          <div className="popup-slide-up absolute bottom-20 right-0 w-80 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Add Expense</h3>
              <button
                onClick={() => setIsOpen(false)}
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
                  className="h-5 w-5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
  
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              
              {/* Expense Name */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Expense Name
                </label>
                <input
                  type="text"
                  value={expenseName}
                  onChange={(e) => setExpenseName(e.target.value)}
                  placeholder="e.g., Lunch at cafe"
                  required
                  disabled={isLoading}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                />
              </div>
  
              {/* Amount */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                    disabled={isLoading}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pl-7 text-sm text-slate-900 placeholder-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                  />
                </div>
              </div>
  
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
                  <div className="relative expense-category-search-container">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="Search for a category..."
                      required
                      disabled={isLoading}
                      className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 ${
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
                        <p className="text-xs text-indigo-600">✨ Press Enter or click "Add Expense" to create this as a new category</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
  
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || (!selectedCategory && !searchTerm.trim())}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Adding...' : 'Add Expense'}
              </button>
            </form>
  
            {/* Arrow pointing to button */}
            <div className="absolute -bottom-2 right-6 h-4 w-4 rotate-45 border-b border-r border-slate-200 bg-white" />
          </div>
        )}
  
        {/* Floating Action Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Add"
          className={`flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl transition ${
            isOpen ? "rotate-45 scale-110" : "hover:scale-110"
          } hover:shadow-2xl`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    );
  }
  