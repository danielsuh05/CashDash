import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext.jsx'
import { apiCall } from '../utils/api.js'

const CurrencyContext = createContext({})

export const useCurrency = () => {
  return useContext(CurrencyContext)
}

export const CurrencyProvider = ({ children }) => {
  const { user } = useAuth()
  const [currency, setCurrency] = useState('USD')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadCurrency()
    } else {
      setCurrency('USD')
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadCurrency = async () => {
    try {
      const profile = await apiCall('/profile')
      setCurrency(profile.currency || 'USD')
    } catch (error) {
      console.error('Failed to load currency:', error)
      setCurrency('USD')
    } finally {
      setLoading(false)
    }
  }

  const updateCurrency = (newCurrency) => {
    setCurrency(newCurrency)
  }

  const formatCurrency = (amount) => {
    if (amount == null || amount === '') return ''
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const value = {
    currency,
    updateCurrency,
    formatCurrency,
    loading
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

