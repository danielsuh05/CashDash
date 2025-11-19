/**
 * expenses.js
 *
 * Minimal in-memory CRUD service. Async signatures so we can swap to REST later.
 */
import { apiCall } from '../utils/api.js'

const store = {
  items: [],
}

/**
 * @param {{name: string, category: string, amount: number, date?: string, notes?: string}} input
 */
export async function create(input) {
  const item = {
    id: crypto.randomUUID(),
    name: input.name ?? '',
    category: input.category ?? '',
    amount: Number(input.amount ?? 0),
    date: input.date || new Date().toISOString(),
    notes: input.notes || '',
  }
  store.items.unshift(item)
  return item
}

export async function list() {
  return [...store.items]
}

// Fetch all available categories
export async function getCategories() {
  return apiCall('/categories')
}

// Fetch expense categories summary (existing function)
export async function getExpenseCategories() {
  return apiCall('/expenses/categories')
}

// Create a new expense
export async function createExpense(expenseData) {
  const { title, amount, categoryName } = expenseData
  
  // Convert amount from dollars to cents
  const amount_cents = Math.round(parseFloat(amount) * 100)
  
  return apiCall('/expenses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      amount_cents,
      categoryName
    })
  })
}

// Fetch recent expenses (last 7 days)
export async function getRecentExpenses() {
  return apiCall('/expenses/recent')
}

export async function update(id, patch) {
  const idx = store.items.findIndex((x) => x.id === id)
  if (idx === -1) return null
  const current = store.items[idx]
  const next = {
    ...current,
    ...patch,
    amount: patch?.amount != null ? Number(patch.amount) : current.amount,
  }
  store.items[idx] = next
  return next
}

export async function remove(id) {
  const idx = store.items.findIndex((x) => x.id === id)
  if (idx === -1) return false
  store.items.splice(idx, 1)
  return true
}


