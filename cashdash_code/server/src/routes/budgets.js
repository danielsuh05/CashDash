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

// update budgets
router.patch('/budgets', requireAuth, async (req, res) => {
  const user = req.user
  const { categoryName, newBudget } = req.body

  if (!categoryName || typeof categoryName !== 'string') {
    return res.status(400).json({ error: 'Category name is required' })
  }

  if (typeof newBudget !== 'number' || newBudget <= 0) {
    return res.status(400).json({ error: 'New budget must be a positive number' })
  }

  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

    const { data: category, error: categoryError } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .single()

    if (categoryError || !category) {
      return res.status(404).json({ error: 'Category not found' })
    }

    const newBudgetCents = Math.round(newBudget * 100)

    const { data: updatedBudget, error: updateError } = await supabaseAdmin
      .from('budgets')
      .update({ limit_cents: newBudgetCents })
      .eq('user_id', user.id)
      .eq('category_id', category.id)
      .gte('start_date', startOfMonth)
      .lte('start_date', endOfMonth)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating budget:', updateError)
      return res.status(500).json({ error: updateError.message })
    }

    if (!updatedBudget) {
      return res.status(404).json({ error: 'Budget not found for this category in the current month' })
    }

    res.json({ 
      success: true, 
      budget: {
        category: categoryName,
        limit: newBudget
      }
    })
  } catch (error) {
    console.error('Unexpected error in PATCH /budgets:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/budgets', requireAuth, async (req, res) => {
  const user = req.user
  const { categoryName, budget } = req.body

  if (!categoryName || typeof categoryName !== 'string' || categoryName.trim().length === 0) {
    return res.status(400).json({ error: 'Category name is required' })
  }

  if (typeof budget !== 'number' || budget <= 0) {
    return res.status(400).json({ error: 'Budget must be a positive number' })
  }

  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    // check if not the same name
    const { data: existingCategory, error: checkError } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('name', categoryName.trim())
      .maybeSingle()

    if (checkError) {
      console.error('Error checking category:', checkError)
      return res.status(500).json({ error: checkError.message })
    }

    let categoryId

    if (existingCategory) {
      // ensure not already a category
      const { data: existingBudget } = await supabaseAdmin
        .from('budgets')
        .select('id')
        .eq('user_id', user.id)
        .eq('category_id', existingCategory.id)
        .gte('start_date', startOfMonth)
        .maybeSingle()

      if (existingBudget) {
        return res.status(400).json({ error: 'Budget already exists for this category this month' })
      }

      categoryId = existingCategory.id
    } else {
      const { data: newCategory, error: categoryError } = await supabaseAdmin
        .from('categories')
        .insert({ name: categoryName.trim() })
        .select()
        .single()

      if (categoryError) {
        console.error('Error creating category:', categoryError)
        return res.status(500).json({ error: categoryError.message })
      }

      categoryId = newCategory.id
    }

    const budgetCents = Math.round(budget * 100)

    const { data: newBudget, error: budgetError } = await supabaseAdmin
      .from('budgets')
      .insert({
        user_id: user.id,
        category_id: categoryId,
        limit_cents: budgetCents,
        start_date: startOfMonth
      })
      .select()
      .single()

    if (budgetError) {
      console.error('Error creating budget:', budgetError)
      return res.status(500).json({ error: budgetError.message })
    }

    res.status(201).json({
      success: true,
      budget: {
        id: newBudget.id,
        category: categoryName.trim(),
        limit: budget,
        spent: 0
      }
    })
  } catch (error) {
    console.error('Unexpected error in POST /budgets:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})