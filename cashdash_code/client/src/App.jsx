import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ExpenseLogger from './components/expense/ExpenseLogger.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <main className="min-h-screen w-full">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <header className="space-y-1">
            <h1 className="text-2xl font-semibold">CashDash — Expense Logger</h1>
            <p className="text-sm text-gray-600">Track expenses and income with simple forms.</p>
          </header>

          {/* Expense Logger Module */}
          <section>
            <ExpenseLogger onChange={(data) => console.log('ExpenseLogger changed', data)} />
          </section>
        </div>
      </main>
    </>
  )
}

export default App
