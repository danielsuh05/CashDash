/**
 * DateTimeField.jsx
 *
 * Controlled date/time input, storing ISO strings. Minimal implementation uses datetime-local.
 */

/**
 * @param {Object} props
 * @param {string|Date} props.value
 * @param {(value: string) => void} props.onChange
 * @param {boolean} [props.defaultToNow]
 */
export default function DateTimeField({ value, onChange, defaultToNow }) {
  const iso = normalizeToIso(value, defaultToNow)
  const dtLocal = isoToDatetimeLocal(iso)
  return (
    <input
      className="w-full border p-2 rounded"
      type="datetime-local"
      value={dtLocal}
      onChange={(e) => onChange?.(datetimeLocalToIso(e.target.value))}
    />
  )
}

function normalizeToIso(value, defaultToNow) {
  if (!value && defaultToNow) return new Date().toISOString()
  if (!value) return ''
  return value instanceof Date ? value.toISOString() : String(value)
}

function isoToDatetimeLocal(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  // Format YYYY-MM-DDTHH:MM for datetime-local
  const pad = (n) => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const min = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

function datetimeLocalToIso(dt) {
  if (!dt) return ''
  const d = new Date(dt)
  return d.toISOString()
}


