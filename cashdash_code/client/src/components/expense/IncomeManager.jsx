/**
 * IncomeManager.jsx
 *
 * Manages income records similarly to expenses. Minimal structure.
 */

import { useMemo, useState } from 'react'
import DateTimeField from './DateTimeField.jsx'

/**
 * @param {Object} props
 * @param {Array<{id: string, name: string, category: string, amount: number, date: string, notes?: string}>} props.items
 * @param {(value: {name: string, category: string, amount: number, date: string, notes?: string}) => void} props.onAdd
 * @param {(id: string, patch: Partial<{name: string, category: string, amount: number, date: string, notes?: string}>) => void} props.onEdit
 * @param {(id: string) => void} props.onDelete
 */
export default function IncomeManager({ items, onAdd, onEdit, onDelete }) {
  const nowIso = useMemo(() => new Date().toISOString(), [])
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState(0)
  const [date, setDate] = useState(nowIso)

  function handleAdd(e) {
    e.preventDefault()
    const parsed = typeof amount === 'string' ? parseFloat(amount) : amount
    onAdd?.({ name, category, amount: Number.isFinite(parsed) ? parsed : 0, date })
    setName('')
    setCategory('')
    setAmount(0)
    setDate(new Date().toISOString())
  }

  return (
    <div className="space-y-3">
      <form className="grid grid-cols-1 md:grid-cols-4 gap-3" onSubmit={handleAdd}>
        <input className="border p-2 rounded" type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="border p-2 rounded" type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <input className="border p-2 rounded" type="number" step="0.01" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <DateTimeField value={date} onChange={setDate} />
        <div className="md:col-span-4">
          <button className="border px-3 py-2 rounded" type="submit">Add Income</button>
        </div>
      </form>

      <ul className="space-y-2">
        {(items || []).length === 0 ? (
          <li className="text-sm text-gray-600">No income yet.</li>
        ) : (
          items.map((item) => (
            <li key={item.id} className="border p-3 rounded flex items-start justify-between gap-3 bg-white/50">
              <div className="space-y-1">
                <div className="text-sm font-medium">{item.name} <span className="font-normal">— {item.category}</span></div>
                <div className="text-sm">${item.amount.toFixed(2)} • {new Date(item.date).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="border px-2 py-1 text-sm rounded" onClick={() => onEdit?.(item.id, { /* TODO: wire edit UI */ })}>Edit</button>
                <button className="border px-2 py-1 text-sm rounded" onClick={() => onDelete?.(item.id)}>Delete</button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}


