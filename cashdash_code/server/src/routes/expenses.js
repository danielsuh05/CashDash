import express from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import { supabaseAdmin } from '../utils/supabaseAdmin.js'
import { startOfMonth, endOfMonth } from '../utils/getDates.js';

export const router = express.Router()

// Get all available categories (user-specific)
router.get('/categories', requireAuth, async (req, res) => {
  const user = req.user

  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('id, name')
      .eq('user_id', user.id)
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
  const { title, amount_cents, categoryName } = req.body

  // Validate required fields
  if (!title || amount_cents === undefined || !categoryName) {
    return res.status(400).json({ 
      error: 'Missing required fields: title, amount_cents, and categoryName are required' 
    })
  }

  // Validate amount_cents is a positive integer
  if (typeof amount_cents !== 'number' || amount_cents <= 0 || !Number.isInteger(amount_cents)) {
    return res.status(400).json({ 
      error: 'amount_cents must be a positive integer representing cents' 
    })
  }

  if (typeof categoryName !== 'string' || categoryName.trim().length === 0) {
    return res.status(400).json({ error: 'Category name must be a non-empty string' })
  }

  try {
    const trimmedCategoryName = categoryName.trim()

    // Check if category exists for this user (case-insensitive)
    // First get all categories for the user to do case-insensitive comparison
    const { data: allCategories, error: allCategoriesError } = await supabaseAdmin
      .from('categories')
      .select('id, name')
      .eq('user_id', user.id)

    if (allCategoriesError) {
      console.error('Error fetching categories:', allCategoriesError)
      return res.status(500).json({ error: allCategoriesError.message })
    }

    // Find category with case-insensitive match
    let category = allCategories?.find(
      cat => cat.name.toLowerCase() === trimmedCategoryName.toLowerCase()
    )

    // If category doesn't exist, create it
    if (!category) {
      const { data: newCategory, error: createCategoryError } = await supabaseAdmin
        .from('categories')
        .insert({
          name: trimmedCategoryName,
          user_id: user.id
        })
        .select('id, name')
        .single()

      if (createCategoryError) {
        // Check if error is due to duplicate (database constraint)
        if (createCategoryError.code === '23505' || createCategoryError.message.includes('duplicate')) {
          return res.status(400).json({ 
            error: `Category "${trimmedCategoryName}" already exists. Please use the existing category.` 
          })
        }
        console.error('Error creating category:', createCategoryError)
        return res.status(500).json({ error: createCategoryError.message })
      }

      category = newCategory
    }

    const { data, error } = await supabaseAdmin
      .from('expenses')
      .insert({
        user_id: user.id,
        title: title.trim(),
        amount_cents,
        category_id: category.id,
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

//get monthly expenses for the past 12 months, used for bar chart
//this endpoint aggregates expenses by month, returning total spending per month
router.get('/expenses/monthly', requireAuth, async (req, res) => {
  const user = req.user
  
  try {
    //calculate date 12 months ago from now
    const now = new Date()
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)
    
    const { data, error } = await supabaseAdmin
      .from('expenses')
      .select('amount_cents, occurred_at')
      .eq('user_id', user.id)
      .gte('occurred_at', twelveMonthsAgo.toISOString())
      .order('occurred_at', { ascending: true })

    if (error) {
      console.error('Database error fetching monthly expenses:', error)
      return res.status(500).json({ error: error.message })
    }

    //group expenses by the month
    const monthlyTotals = {}
    
    data.forEach(expense => {
      const date = new Date(expense.occurred_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = {
          month: monthKey,
          year: date.getFullYear(),
          monthNum: date.getMonth(),
          total_cents: 0
        }
      }
      
      monthlyTotals[monthKey].total_cents += expense.amount_cents
    })

    //convert to array and sort by date
    const monthlyData = Object.values(monthlyTotals).sort((a, b) => {
      return a.year !== b.year ? a.year - b.year : a.monthNum - b.monthNum
    })

    //format month names by three letter abbreviations
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const formattedData = monthlyData.map(item => ({
      month: monthNames[item.monthNum],
      amount: item.total_cents / 100, //convert cents to dollars
      year: item.year,
      fullDate: item.month
    }))

    res.json(formattedData)
  } catch (err) {
    console.error('Error fetching monthly expenses:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})