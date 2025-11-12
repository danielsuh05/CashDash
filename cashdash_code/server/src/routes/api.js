import express from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import { supabaseAdmin } from '../utils/supabaseAdmin.js'
import { router as expensesRouter } from './expenses.js'
import { router as budgetsRouter } from './budgets.js'

export const router = express.Router()

router.use(expensesRouter)
router.use(budgetsRouter)

router.get('/profile', requireAuth, async (req, res) => {
  const user = req.user

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

// Update profile
router.patch('/profile', requireAuth, async (req, res) => {
  const user = req.user
  const body = req.body || {}

  // Only allow updating specific fields
  const allowedFields = ['currency']
  const updatePayload = {}
  
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updatePayload[field] = body[field]
    }
  }

  if (Object.keys(updatePayload).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updatePayload)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Database update error:', error)
      return res.status(400).json({ error: error.message || 'Failed to update profile' })
    }
    
    res.json(data)
  } catch (err) {
    console.error('Unexpected error updating profile:', err)
    res.status(500).json({ error: err.message || 'Internal server error' })
  }
})

// Ensure a profile exists for the authenticated user; create with defaults if missing
router.post('/profiles/ensure', requireAuth, async (req, res) => {
  const user = req.user
  const body = req.body || {}

  // Try to find existing profile
  const { data: existing, error: findError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!findError && existing) {
    return res.json(existing)
  }

  // Build defaults
  const usernameFromAuth = user?.user_metadata?.username || user?.user_metadata?.full_name || null
  const username = body?.username || usernameFromAuth

  const insertPayload = {
    user_id: user.id,
    username,
    xp: 0,
    streak_current: 0,
    last_activity_date: new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  }

  const { data: created, error: insertError } = await supabaseAdmin
    .from('profiles')
    .insert(insertPayload)
    .select()
    .single()

  if (insertError) {
    // If conflict because it already exists (race), fetch and return
    if (insertError.code === '23505' || (insertError.message && insertError.message.toLowerCase().includes('duplicate'))) {
      const { data: after, error: afterErr } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (afterErr) return res.status(400).json({ error: afterErr.message })
      return res.json(after)
    }
    return res.status(400).json({ error: insertError.message })
  }

  res.json(created)
})