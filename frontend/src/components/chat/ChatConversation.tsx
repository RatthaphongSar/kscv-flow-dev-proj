import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'

export default function ChatConversation({ messages, currentUser }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="space-y-3">
      {messages.map((m, index) => {
        const isOwn = m.userId === currentUser?.id
        const username = m.user?.username || 'Unknown User'
        const content = m.text || m.content || ''
        const time = new Date(m.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })

        return (
          <MessageBubble
            key={m.id ?? index}
            isOwn={isOwn}
            username={username}
            content={content}
            time={time}
          />
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
