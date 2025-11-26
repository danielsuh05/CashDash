import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import { CurrencyProvider } from './contexts/CurrencyContext.jsx'
import { BudgetProvider } from './contexts/BudgetContext.jsx'
import AuthPage from './components/auth/AuthPage.jsx'
import Dashboard from './dashboard/Dashboard.jsx'
import AccountPage from './components/AccountPage.jsx'
import './App.css'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <Routes>
      {!user ? (
        <Route path="*" element={<AuthPage />} />
      ) : (
        <>
          <Route path="/" element={<Dashboard />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <BudgetProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </BudgetProvider>
      </CurrencyProvider>
    </AuthProvider>
  )
}

export default App
