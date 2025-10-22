import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import AuthPage from './components/auth/AuthPage.jsx'
import Dashboard from './dashboard/Dashboard.jsx'
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

  if (!user) {
    return <AuthPage />
  }

  return <>
    <Dashboard />
  </>;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
