// src/components/chat/ChatList.jsx
import PresenceDot from './PresenceDot'
import clsx from 'clsx'

export default function ChatList({ rooms, activeId, onPick }) {
  return (
    <div className="bg-surface p-3 rounded-lg border">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-medium">Rooms</h2>
      </div>
      <ul className="space-y-2 text-sm">
        {rooms.map(r => {
          const last = r.messages?.[0]
          return (
            <li
              key={r.id}
              className={clsx(
                'p-2 rounded cursor-pointer border',
                activeId === r.id ? 'bg-white border-primary' : 'hover:bg-white'
              )}
              onClick={() => onPick(r)}
            >
              <div className="flex items-center gap-2">
                <PresenceDot online={true /* TODO: wire presence */} />
                <div className="font-medium">{r.name}</div>
              </div>
              {last && (
                <div className="text-slate-500 text-xs mt-1 truncate">
                  {last.user?.username}: {last.content}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
