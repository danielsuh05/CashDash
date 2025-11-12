import express from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import { supabaseAdmin } from '../utils/supabaseAdmin.js'

export const router = express.Router()

// Get budgets with spending data for the current user
router.get('/budgets', requireAuth, async (req, res) => {
  const user = req.user

  try {
    // Get the start of the current month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

    // First, get all budgets for the user with category information
    const { data: budgets, error: budgetsError } = await supabaseAdmin
      .from('budgets')
      .select(`
        *,
        categories(name)
      `)
      .eq('user_id', user.id)
      .gte('start_date', startOfMonth)
      .lte('start_date', endOfMonth)
    

    if (budgetsError) {
      console.error('Error fetching budgets:', budgetsError)
      return res.status(500).json({ error: budgetsError.message })
    }

    // Get spending data for each category in the current month
    const { data: expenses, error: expensesError } = await supabaseAdmin
      .from('expenses')
      .select(`
        category_id,
        amount_cents
      `)
      .eq('user_id', user.id)
      .gte('occurred_at', startOfMonth)
      .lte('occurred_at', endOfMonth)

    if (expensesError) {
      console.error('Error fetching expenses:', expensesError)
      return res.status(500).json({ error: expensesError.message })
    }

    // Group expenses by category_id and sum amounts
    const expensesByCategory = expenses.reduce((acc, expense) => {
      if (!acc[expense.category_id]) {
        acc[expense.category_id] = 0
      }
      acc[expense.category_id] += expense.amount_cents
      return acc
    }, {})

    // Combine budget and spending data
    const budgetData = budgets.map(budget => {
      const spentCents = expensesByCategory[budget.category_id] || 0
      
      return {
        name: budget.categories?.name || 'Unknown Category',
        spent: spentCents / 100, // Convert cents to dollars
        budget: budget.limit_cents / 100 // Convert cents to dollars
      }
    })

    res.json(budgetData)
  } catch (error) {
    console.error('Unexpected error in /budgets:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})