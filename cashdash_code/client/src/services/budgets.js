import { apiCall } from '../utils/api.js'

// Get budget data with spending information
export async function getBudgets() {
  return await apiCall('/budgets')
}