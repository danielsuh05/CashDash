wimport { apiCall } from '../utils/api.js'

// Get all categories for autocomplete
export async function getCategories() {
  return await apiCall('/categories')
}

// Get budget data with spending information
export async function getBudgets() {
  return await apiCall('/budgets')
}

// Update budget limit for a category
export async function updateBudget(categoryName, newBudget) {
  return await apiCall('/budgets', {
    method: 'PATCH',
    body: JSON.stringify({ categoryName, newBudget })
  })
}

// Create a new budget using category name (auto-creates category if needed)
export async function createBudget(categoryName, budget) {
  return await apiCall('/budgets', {
    method: 'POST',
    body: JSON.stringify({ categoryName, budget })
  })
}