/**
 * ExpenseForm.jsx
 *
 * Controlled form to add or edit an expense entry.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import DateTimeField from './DateTimeField.jsx'
import NotesField from './NotesField.jsx'

/**
 * @typedef {Object} ExpenseInput
 * @property {string} name
 * @property {string} category
 * @property {number} amount
 * @property {string} date - ISO string
 * @property {string} [notes]
 */

/**
 * @param {Object} props
 * @param {ExpenseInput | null} props.initialValue
 * @param {(value: ExpenseInput) => void} props.onSubmit
 * @param {() => void} props.onCancel
 * @param {boolean} [props.autoFocus]
 * @param {import('react').ReactNode} [props.categorySlot]
 */
export default function ExpenseForm({ initialValue, onSubmit, onCancel, autoFocus = true }) {
  const nowIso = useMemo(() => new Date().toISOString(), [])
  const [name, setName] = useState(initialValue?.name ?? '')
  const [category, setCategory] = useState(initialValue?.category ?? '')
  const [amount, setAmount] = useState(initialValue?.amount ?? 0)
  const [date, setDate] = useState(initialValue?.date ?? nowIso)
  const [notes, setNotes] = useState(initialValue?.notes ?? '')

  const amountRef = useRef(null)
  useEffect(() => {
    if (autoFocus && amountRef.current) {
      amountRef.current.focus()
    }
  }, [autoFocus])

  function handleSubmit(e) {
    e.preventDefault()
    const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    onSubmit({ name, category, amount: Number.isFinite(parsedAmount) ? parsedAmount : 0, date, notes })
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
    if (e.key === 'Escape') {
      onCancel?.()
    }
  }

  return (
    <form className="w-full space-y-3" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="block text-sm">Amount</label>
          <input
            ref={amountRef}
            className="w-full border p-2 rounded"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm">Name</label>
          <input
            className="w-full border p-2 rounded"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What was this expense?"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="block text-sm">Category</label>
          <input
            className="w-full border p-2 rounded"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm">Date</label>
          <DateTimeField value={date} onChange={setDate} defaultToNow />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-sm">Notes</label>
        <NotesField value={notes} onChange={setNotes} placeholder="Optional notes" />
      </div>

      <div className="flex items-center gap-2">
        <button className="border px-3 py-2 rounded" type="submit">Save</button>
        <button className="border px-3 py-2 rounded" type="button" onClick={() => onCancel?.()}>Cancel</button>
      </div>
    </form>
  )
}


