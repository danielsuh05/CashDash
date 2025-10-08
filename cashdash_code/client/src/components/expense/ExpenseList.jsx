/**
 * ExpenseList.jsx
 *
 * Renders a list of expenses with edit/delete actions.
 */

/**
 * @param {Object} props
 * @param {Array<{id: string, name: string, category: string, amount: number, date: string, notes?: string}>} props.items
 * @param {(item: any) => void} props.onEdit
 * @param {(id: string) => void} props.onDelete
 */
export default function ExpenseList({ items, onEdit, onDelete }) {
  if (!items || items.length === 0) {
    return <div className="text-sm text-gray-600">No expenses yet.</div>
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className="border p-3 rounded flex items-start justify-between gap-3 bg-white/50">
          <div className="space-y-1">
            <div className="text-sm font-medium">{item.name} <span className="font-normal">— {item.category}</span></div>
            <div className="text-sm">${item.amount.toFixed(2)} • {new Date(item.date).toLocaleString()}</div>
            {item.notes ? <div className="text-xs text-gray-600">{item.notes}</div> : null}
          </div>
          <div className="flex items-center gap-2">
            <button className="border px-2 py-1 text-sm rounded" onClick={() => onEdit?.(item)}>Edit</button>
            <button className="border px-2 py-1 text-sm rounded" onClick={() => onDelete?.(item.id)}>Delete</button>
          </div>
        </li>
      ))}
    </ul>
  )
}


