/**
 * CategoryPicker.jsx
 *
 * Minimal category selector. Placeholder for icon-based UI later.
 */

/**
 * @param {Object} props
 * @param {string|null} props.value
 * @param {string[]} props.options
 * @param {(value: string) => void} props.onChange
 */
export default function CategoryPicker({ value, options, onChange }) {
  return (
    <select className="w-full border p-2 rounded" value={value ?? ''} onChange={(e) => onChange?.(e.target.value)}>
      <option value="">Select category</option>
      {(options || []).map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  )
}


