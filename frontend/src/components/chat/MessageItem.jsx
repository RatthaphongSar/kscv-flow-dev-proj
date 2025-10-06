// src/components/chat/MessageItem.jsx
import dayjs from 'dayjs'
import clsx from 'clsx'

export default function MessageItem({ me, msg }) {
  const ts = dayjs(msg.createdAt).format('HH:mm')
  return (
    <div className={clsx('flex mb-2', me ? 'justify-end' : 'justify-start')}>
      <div className={clsx(
        'max-w-[75%] rounded-2xl px-3 py-2 shadow-sm',
        me ? 'bg-primary text-white' : 'bg-surface'
      )}>
        {!me && <div className="text-xs text-slate-500 mb-0.5">{msg.user?.username}</div>}
        <div className="whitespace-pre-wrap break-words">{msg.content}</div>
        <div className={clsx('mt-1 text-[11px]', me ? 'text-white/70' : 'text-slate-500')}>
          {ts} {me && msg._status === 'sending' && '• Sending'}
          {me && msg._status === 'sent' && '• Sent'}
          {me && msg._status === 'read' && '• Read'}
        </div>
      </div>
    </div>
  )
}
