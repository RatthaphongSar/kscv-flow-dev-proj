import React, { useRef, useState, useEffect } from 'react';

export function MessageInput({ onSend } : { onSend: (text: string) => void }) {
  const [text, setText] = useState('');
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (taRef.current) taRef.current.style.height = 'auto';
  }, []);

  function submit() {
    const v = text.trim();
    if (!v) return;
    onSend(v);
    setText('');
  }

  return (
    <div className="p-4 border-t bg-white">
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-md hover:bg-gray-100">
          <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none"><path d="M14 9l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <textarea
          ref={taRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={1}
          className="flex-1 resize-none rounded-xl p-3 bg-[#F5F9FF] focus:outline-none"
          placeholder="พิมพ์ข้อความ..."
        />
        <button onClick={submit} className="bg-[#0A4DAD] text-white px-4 py-2 rounded-lg">Send</button>
      </div>
    </div>
  );
}

export default MessageInput;
