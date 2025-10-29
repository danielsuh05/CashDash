import express from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import { supabaseAdmin } from '../utils/supabaseAdmin.js'

export const router = express.Router()

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