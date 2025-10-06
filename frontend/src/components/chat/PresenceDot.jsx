// src/components/chat/PresenceDot.jsx
export default function PresenceDot({ online }) {
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full ${online ? 'bg-emerald-500' : 'bg-slate-300'}`}
      aria-label={online ? 'online' : 'offline'}
    />
  )
}
