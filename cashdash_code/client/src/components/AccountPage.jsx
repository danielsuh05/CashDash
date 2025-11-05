import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useCurrency } from '../contexts/CurrencyContext.jsx'
import { supabase } from '../lib/supabaseClient.js'
import { apiCall } from '../utils/api.js'
import Navbar from './Navbar.jsx'
import './AccountPage.css'

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
]

export default function AccountPage() {
  const { user, signOut } = useAuth()
  const { currency: contextCurrency, updateCurrency } = useCurrency()
  const [profile, setProfile] = useState(null)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  // Email state
  const [email, setEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)

  // Password state
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Currency state - sync with context
  const [currency, setCurrency] = useState(contextCurrency || 'USD')
  const [currencyLoading, setCurrencyLoading] = useState(false)

  // Sync local currency state with context
  useEffect(() => {
    setCurrency(contextCurrency || 'USD')
  }, [contextCurrency])

  useEffect(() => {
    if (user) {
      setEmail(user.email || '')
      loadProfile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadProfile = async () => {
    try {
      const data = await apiCall('/profile')
      setProfile(data)
      // Only update currency if it exists in the profile
      if (data.currency) {
        setCurrency(data.currency)
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
      setMessage('Failed to load profile settings')
      setMessageType('error')
    }
  }

  const showMessage = (msg, type) => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => {
      setMessage('')
      setMessageType('')
    }, 5000)
  }

  const handleEmailUpdate = async (e) => {
    e.preventDefault()
    setEmailLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.updateUser({
        email: email
      })

      if (error) throw error

      showMessage('Email update request sent! Please check your new email for confirmation.', 'success')
    } catch (error) {
      showMessage(error.message || 'Failed to update email', 'error')
    } finally {
      setEmailLoading(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    setPasswordLoading(true)
    setMessage('')

    if (password !== confirmPassword) {
      showMessage('Passwords do not match', 'error')
      setPasswordLoading(false)
      return
    }

    if (password.length < 6) {
      showMessage('Password must be at least 6 characters', 'error')
      setPasswordLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      showMessage('Password updated successfully!', 'success')
      setPassword('')
      setConfirmPassword('')
    } catch (error) {
      showMessage(error.message || 'Failed to update password', 'error')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleCurrencyChange = async (newCurrency) => {
    // Prevent multiple clicks
    if (currencyLoading) return
    if (newCurrency === currency) return
    
    const oldCurrency = currency
    
    // Update UI
    setCurrency(newCurrency)
    setCurrencyLoading(true)
    setMessage('')

    try {
      const response = await apiCall('/profile', {
        method: 'PATCH',
        body: JSON.stringify({ currency: newCurrency })
      })
      
      // Update profile state with server response
      setProfile(response)
      // Ensure currency matches what server returned
      const savedCurrency = response.currency || newCurrency
      setCurrency(savedCurrency)
      // Update the currency context so all components update
      updateCurrency(savedCurrency)
    } catch (error) {
      // Revert on error
      setCurrency(oldCurrency)
      const errorMsg = error.message || 'Failed to update currency'
      showMessage(errorMsg, 'error')
      console.error('Currency update error:', error)
    } finally {
      setCurrencyLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} onSignOut={signOut} />
      <div className="mx-auto w-full max-w-4xl p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg text-sm ${
            messageType === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Email Section */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Email Address</h2>
          <p className="text-sm text-slate-600 mb-4">
            Update your email address. You'll receive a confirmation email at the new address.
          </p>
          <form onSubmit={handleEmailUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-white placeholder-gray-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            <button
              type="submit"
              disabled={emailLoading || email === user?.email}
              className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {emailLoading ? 'Updating...' : 'Update Email'}
            </button>
          </form>
        </section>

        {/* Password Section */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Password</h2>
          <p className="text-sm text-slate-600 mb-4">
            Change your password. Make sure it's at least 6 characters long.
          </p>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-white placeholder-gray-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 bg-white placeholder-gray-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            <button
              type="submit"
              disabled={passwordLoading || !password || !confirmPassword}
              className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </section>

        {/* Currency Section */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Currency</h2>
          <p className="text-sm text-slate-600 mb-4">
            Select your preferred currency for displaying amounts throughout the app.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Currency</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {CURRENCIES.map((curr) => {
                const isSelected = currency === curr.code
                return (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => handleCurrencyChange(curr.code)}
                    disabled={currencyLoading}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isSelected
                        ? 'border-indigo-600 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`text-2xl font-semibold ${
                        isSelected ? 'text-indigo-600' : 'text-slate-700'
                      }`}>
                        {curr.symbol}
                      </div>
                      <div className={`text-xs font-medium ${
                        isSelected ? 'text-indigo-700' : 'text-slate-600'
                      }`}>
                        {curr.code}
                      </div>
                      <div className={`text-xs ${
                        isSelected ? 'text-indigo-600' : 'text-slate-500'
                      }`}>
                        {curr.name}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <svg
                          className="w-5 h-5 text-indigo-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

