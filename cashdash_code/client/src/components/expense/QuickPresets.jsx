/**
 * QuickPresets.jsx
 *
 * Optional preset buttons for quick entry. Renders nothing if no presets.
 */

/**
 * @param {Object} props
 * @param {Array<Partial<{name: string, category: string, amount: number, notes: string}>>} props.presets
 * @param {(preset: any) => void} props.onSelect
 */
export default function QuickPresets({ presets, onSelect }) {
  if (!presets || presets.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((p, idx) => (
        <button
          key={idx}
          className="border px-2 py-1 text-sm rounded"
          onClick={() => onSelect?.(p)}
        >
          {p.name || p.category || 'Preset'}
        </button>
      ))}
    </div>
  )
}


