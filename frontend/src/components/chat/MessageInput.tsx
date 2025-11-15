export default function MessageInput({ text, setText, onSubmit }) {
  const disabled = !text.trim()

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-3">
      {/* ไอคอนเครื่องมือซ้าย */}
      <div className="flex items-center gap-2 text-xl text-gray-400">
        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#111827]"
        >
          😊
        </button>
        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#111827]"
        >
          📎
        </button>
        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#111827]"
        >
          🖼️
        </button>
      </div>

      {/* ช่องพิมพ์ */}
      <div className="flex-1">
        <input
          className="w-full bg-[#020617] border border-[#374151] rounded-md px-3 py-2 text-sm
                     text-gray-100 placeholder:text-gray-500
                     focus:outline-none focus:ring-1 focus:ring-violet-500"
          placeholder="พิมพ์ข้อความที่นี่..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
      </div>

      {/* ปุ่มส่ง */}
      <button
        type="submit"
        disabled={disabled}
        className="w-9 h-9 rounded-full bg-violet-600 text-white flex items-center justify-center
                   hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ➤
      </button>
    </form>
  )
}
