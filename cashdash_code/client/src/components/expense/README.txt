Expense Module (Client)

How to integrate
- Import `ExpenseLogger` into `src/App.jsx` (or a page) and render it.
- Optional: pass `initialExpenses` / `initialIncome` arrays and an `onChange` callback.
- Minimal Tailwind utility classes only; no visual design decisions.

Data shape
- { id, name, category, amount, date, notes }
- date is an ISO string; id is generated via crypto.randomUUID().

Services
- src/services/expenses.js and src/services/income.js provide async CRUD in-memory.
- Swap to REST later without touching components.

Files
- ExpenseLogger.jsx: container wiring CRUD and subcomponents
- ExpenseForm.jsx: add/edit expense
- ExpenseList.jsx: list with edit/delete
- IncomeManager.jsx: manage income entries
- CategoryPicker.jsx: basic category selector
- QuickPresets.jsx: optional preset buttons
- NotesField.jsx: controlled textarea
- DateTimeField.jsx: ISO-based datetime-local input

TODO
- Hook CategoryPicker to shared taxonomy
- Replace in-memory services with backend REST
- Add validation and tests
- Style refinement per design system
