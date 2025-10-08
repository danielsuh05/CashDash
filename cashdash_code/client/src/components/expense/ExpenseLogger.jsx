/**
 * ExpenseLogger.jsx
 *
 * Container component that manages expenses and income state, wires CRUD services,
 * and coordinates child components (form, list, helpers).
 *
 * This file intentionally keeps styling minimal and uses Tailwind utility placeholders
 * only for basic layout. Teams can refine visuals later.
 */

import { useCallback, useMemo, useState } from 'react'
import ExpenseForm from './ExpenseForm.jsx'
import ExpenseList from './ExpenseList.jsx'
import IncomeManager from './IncomeManager.jsx'
import CategoryPicker from './CategoryPicker.jsx'
import QuickPresets from './QuickPresets.jsx'

import * as expenseService from '../../services/expenses.js'
import * as incomeService from '../../services/income.js'

/**
 * @typedef {Object} MoneyEntry
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {number} amount
 * @property {string} date - ISO string
 * @property {string} [notes]
 */

/**
 * @param {Object} props
 * @param {MoneyEntry[]} [props.initialExpenses]
 * @param {MoneyEntry[]} [props.initialIncome]
 * @param {(data: { expenses: MoneyEntry[]; income: MoneyEntry[] }) => void} [props.onChange]
 */
export default function ExpenseLogger({ initialExpenses = [], initialIncome = [], onChange }) {
  const [expenses, setExpenses] = useState(initialExpenses)
  const [income, setIncome] = useState(initialIncome)
  const [editingExpense, setEditingExpense] = useState(null)

  // Example category options; replace with team-provided taxonomy later if available
  const categoryOptions = useMemo(() => [
    'Food',
    'Transport',
    'Housing',
    'Entertainment',
    'Utilities',
    'Health',
    'Other',
  ], [])

  const notifyChange = useCallback((nextExpenses, nextIncome) => {
    if (typeof onChange === 'function') {
      onChange({ expenses: nextExpenses, income: nextIncome })
    }
  }, [onChange])

  const handleAddExpense = useCallback(async (input) => {
    const created = await expenseService.create(input)
    setExpenses((prev) => {
      const next = [created, ...prev]
      notifyChange(next, income)
      return next
    })
  }, [income, notifyChange])

  const handleEditExpense = useCallback(async (id, patch) => {
    const updated = await expenseService.update(id, patch)
    setExpenses((prev) => {
      const next = prev.map((e) => (e.id === id ? updated : e))
      notifyChange(next, income)
      return next
    })
    setEditingExpense(null)
  }, [income, notifyChange])

  const handleDeleteExpense = useCallback(async (id) => {
    await expenseService.remove(id)
    setExpenses((prev) => {
      const next = prev.filter((e) => e.id !== id)
      notifyChange(next, income)
      return next
    })
  }, [income, notifyChange])

  const handleAddIncome = useCallback(async (input) => {
    const created = await incomeService.create(input)
    setIncome((prev) => {
      const next = [created, ...prev]
      notifyChange(expenses, next)
      return next
    })
  }, [expenses, notifyChange])

  const handleEditIncome = useCallback(async (id, patch) => {
    const updated = await incomeService.update(id, patch)
    setIncome((prev) => {
      const next = prev.map((e) => (e.id === id ? updated : e))
      notifyChange(expenses, next)
      return next
    })
  }, [expenses, notifyChange])

  const handleDeleteIncome = useCallback(async (id) => {
    await incomeService.remove(id)
    setIncome((prev) => {
      const next = prev.filter((e) => e.id !== id)
      notifyChange(expenses, next)
      return next
    })
  }, [expenses, notifyChange])

  return (
    <section className="w-full max-w-3xl mx-auto p-4 space-y-8">
      {/* TODO: Replace with app-level context or props for categories if available */}
      <div className="space-y-3">
        <h2 className="text-lg font-medium">Add Expense</h2>
        <ExpenseForm
          key={editingExpense ? `edit-${editingExpense.id}` : 'create'}
          initialValue={editingExpense}
          onSubmit={(value) => {
            if (editingExpense) {
              handleEditExpense(editingExpense.id, value)
            } else {
              handleAddExpense(value)
            }
          }}
          onCancel={() => setEditingExpense(null)}
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-medium">Expenses</h2>
        <ExpenseList
          items={expenses}
          onEdit={(item) => setEditingExpense(item)}
          onDelete={(id) => handleDeleteExpense(id)}
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-medium">Income</h2>
        <IncomeManager
          items={income}
          onAdd={(value) => handleAddIncome(value)}
          onEdit={(id, patch) => handleEditIncome(id, patch)}
          onDelete={(id) => handleDeleteIncome(id)}
        />
      </div>

      {/* Optional helpers */}
      <div className="space-y-2">
        <QuickPresets presets={[]} onSelect={() => {}} />
      </div>
    </section>
  )
}


