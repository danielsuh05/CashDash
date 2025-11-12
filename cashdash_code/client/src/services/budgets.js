import { apiCall } from '../utils/api.js'

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

// Create a new category and budget
export async function createBudget(categoryName, budget) {
  return await apiCall('/budgets', {
    method: 'POST',
    body: JSON.stringify({ categoryName, budget })
  })
}