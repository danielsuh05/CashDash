import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import AuthPage from './components/auth/AuthPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Achievements from './pages/Achievements.jsx'
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

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/achievements" element={<Achievements />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
