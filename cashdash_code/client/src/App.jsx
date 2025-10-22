import { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import AuthPage from './components/auth/AuthPage.jsx'
import ExpenseLogger from './components/expense/ExpenseLogger.jsx'
import './App.css'

function AppContent() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return (
    <main className="min-h-screen w-full">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <header className="space-y-1 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold">CashDash — Expense Logger</h1>
            <p className="text-sm text-gray-600">Track expenses and income with simple forms.</p>
            <p className="text-sm text-gray-500">Welcome, {user.email}!</p>
          </div>
          <button
            onClick={signOut}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Sign Out
          </button>
        </header>

        {/* Expense Logger Module */}
        <section>
          <ExpenseLogger onChange={(data) => console.log('ExpenseLogger changed', data)} />
        </section>
      </div>
    </main>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
