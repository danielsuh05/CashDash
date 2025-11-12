import express from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import { supabaseAdmin } from '../utils/supabaseAdmin.js'
import { startOfMonth, endOfMonth } from '../utils/getDates.js';

export const router = express.Router()

// Get all available categories
router.get('/categories', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('id, name')
      .order('name')

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json(data)
  } catch (err) {
    console.error('Error fetching categories:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create a new expense
router.post('/expenses', requireAuth, async (req, res) => {
  const user = req.user
  const { title, amount_cents, category_id } = req.body

  // Validate required fields
  if (!title || amount_cents === undefined || !category_id) {
    return res.status(400).json({ 
      error: 'Missing required fields: title, amount_cents, and category_id are required' 
    })
  }

  // Validate amount_cents is a positive integer
  if (typeof amount_cents !== 'number' || amount_cents <= 0 || !Number.isInteger(amount_cents)) {
    return res.status(400).json({ 
      error: 'amount_cents must be a positive integer representing cents' 
    })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('expenses')
      .insert({
        user_id: user.id,
        title: title.trim(),
        amount_cents,
        category_id,
        occurred_at: new Date().toISOString()
      })
      .select(`
        id,
        title,
        amount_cents,
        occurred_at,
        categories(id, name)
      `)
      .single()

    if (error) {
      console.error('Database error creating expense:', error)
      return res.status(400).json({ error: error.message })
    }

    res.status(201).json(data)
  } catch (err) {
    console.error('Error creating expense:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get all expenses for a user
router.get('/expenses/categories', requireAuth, async (req, res) => {
  const user = req.user

  const { data, error } = await supabaseAdmin
    .from('expenses')
    .select(`
        category_id,
        amount_cents,
        categories(name)
    `)
    .eq('user_id', user.id)
    .gt('amount_cents', 0)
    .gte('occurred_at', startOfMonth)
    .lte('occurred_at', endOfMonth)
    .order('amount_cents', { ascending: false })

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Group and aggregate in JavaScript
  const categoryTotals = data.reduce((acc, expense) => {
    const categoryName = expense.categories?.name || 'Unknown';
    if (!acc[categoryName]) {
      acc[categoryName] = { total_cents: 0, tx_count: 0 };
    }
    acc[categoryName].total_cents += expense.amount_cents;
    acc[categoryName].tx_count += 1;
    return acc;
  }, {});

  // Convert to array and calculate percentages
  const grand = Object.values(categoryTotals).reduce((s, r) => s + r.total_cents, 0);
  const withPct = Object.entries(categoryTotals).map(([categoryName, totals]) => ({
    category_name: categoryName,
    total_cents: totals.total_cents,
    tx_count: totals.tx_count,
    pct: grand ? Math.round((100 * totals.total_cents / grand) * 100) / 100 : 0
  })).sort((a, b) => b.total_cents - a.total_cents);

  res.json(withPct);
})

// Get recent expenses (last 7 days) for the current user
router.get('/expenses/recent', requireAuth, async (req, res) => {
  const user = req.user
  
  // Calculate date 7 days ago
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  try {
    const { data, error } = await supabaseAdmin
      .from('expenses')
      .select(`
        id,
        title,
        amount_cents,
        occurred_at,
        categories(id, name)
      `)
      .eq('user_id', user.id)
      .gte('occurred_at', sevenDaysAgo.toISOString())
      .order('occurred_at', { ascending: false })

    if (error) {
      console.error('Database error fetching recent expenses:', error)
      return res.status(500).json({ error: error.message })
    }

    // Transform the data to match the expected format for the frontend
    const transformedData = data.map(expense => ({
      id: expense.id,
      name: expense.title,
      description: expense.title,
      amount: expense.amount_cents / 100, // Convert cents to dollars
      date: expense.occurred_at,
      created_at: expense.occurred_at,
      category: expense.categories?.name || 'Uncategorized'
    }))

    res.json(transformedData)
  } catch (err) {
    console.error('Error fetching recent expenses:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})