import { createContext, useContext, useState, useCallback } from 'react'

const BudgetContext = createContext({})

export const useBudget = () => {
  return useContext(BudgetContext)
}

export const BudgetProvider = ({ children }) => {
  const [budgetVersion, setBudgetVersion] = useState(0)

  //gets a refresh of budget data across all components
  const refreshBudgets = useCallback(() => {
    setBudgetVersion(prev => prev + 1)
  }, [])

  return (
    <BudgetContext.Provider value={{ budgetVersion, refreshBudgets }}>
      {children}
    </BudgetContext.Provider>
  )
}
