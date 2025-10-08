/**
 * expenses.js
 *
 * Minimal in-memory CRUD service. Async signatures so we can swap to REST later.
 */

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


