// src/components/chat/Composer.jsx
import { useEffect, useRef, useState } from 'react'

export default function Composer({ onSend, onTyping }) {
  const [text, setText] = useState('')
  const typingRef = useRef(false)
  const idleTimer = useRef(null)

  useEffect(() => () => clearTimeout(idleTimer.current), [])

  function handleChange(e) {
    setText(e.target.value)
    if (!typingRef.current) {
      typingRef.current = true
      onTyping?.(true)
    }
    clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => {
      typingRef.current = false
      onTyping?.(false)
    }, 900)
  }

  function submit(e) {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    onSend?.(t)
    setText('')
    onTyping?.(false)
  }

  return (
    <form onSubmit={submit} className="p-3 border-t flex gap-2">
      <input
        value={text}
        onChange={handleChange}
        placeholder="Message…"
        className="flex-1 border rounded-lg px-3 py-2"
      />
      <button className="bg-primary text-white rounded-lg px-4" type="submit">Send</button>
    </form>
  )
}
