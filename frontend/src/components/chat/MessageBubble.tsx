import UserAvatar from './UserAvatar'

export default function MessageBubble({ isOwn, username, content, time }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`flex max-w-2xl gap-2 ${
          isOwn ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        <div className="mt-1">
          <UserAvatar name={username} size="sm" />
        </div>

        <div className="flex flex-col max-w-xl">
          <span
            className={`text-[11px] mb-1 ${
              isOwn ? 'text-right text-gray-400' : 'text-left text-gray-400'
            }`}
          >
            {username}
          </span>

          <div
            className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words
            ${
              isOwn
                ? 'bg-violet-600 text-white'
                : 'bg-[#111827] text-gray-100'
            }`}
          >
            <p>{content}</p>
            <div
              className={`text-[10px] mt-1 ${
                isOwn ? 'text-violet-100 text-right' : 'text-gray-400 text-right'
              }`}
            >
              {time}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
