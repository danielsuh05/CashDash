/**
 * NotesField.jsx
 *
 * Controlled textarea for expense notes.
 */

/**
 * @param {Object} props
 * @param {string} props.value
 * @param {(value: string) => void} props.onChange
 * @param {string} [props.placeholder]
 */
export default function NotesField({ value, onChange, placeholder }) {
  return (
    <textarea
      className="w-full border p-2 rounded min-h-[80px]"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
    />
  )
}


