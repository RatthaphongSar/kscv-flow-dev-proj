export default function MessageInput({ text, setText, onSubmit, isLoading = false }) {
  const disabled = !text.trim() || isLoading

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault()
      onSubmit?.()
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      {/* ช่องพิมพ์ */}
      <div className="flex-1">
        <input
          className="w-full bg-[#111827] border border-[#374151] rounded-lg px-4 py-2.5 text-sm
                     text-gray-100 placeholder:text-gray-500
                     focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          placeholder="พิมพ์ข้อความ... (Enter ส่ง)"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
      </div>

      {/* ปุ่มเครื่องมือ */}
      <button
        type="button"
        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-200 
                   hover:bg-[#1f2937] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="แนบไฟล์"
        disabled={isLoading}
      >
        <span className="text-lg">📎</span>
      </button>

      {/* ปุ่มส่ง */}
      <button
        type="submit"
        disabled={disabled}
        className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center
                   hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed 
                   transition-colors duration-200 font-semibold"
        title="ส่งข้อความ (Enter)"
      >
        {isLoading ? '⏳' : '→'}
      </button>
    </form>
  )
}
