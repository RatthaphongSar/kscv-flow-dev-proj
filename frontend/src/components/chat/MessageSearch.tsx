export default function MessageSearch({ value, onChange }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-500 mb-1">
        Search in conversation
      </label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Type to search..."
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A4DAD]"
      />
    </div>
  )
}
