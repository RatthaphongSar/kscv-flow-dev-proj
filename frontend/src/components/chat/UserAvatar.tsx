const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-lg',
}

export default function UserAvatar({ name, size = 'sm' }) {
  const initial = name?.charAt(0)?.toUpperCase() || '?'
  const cls = sizeMap[size]

  return (
    <div
      className={`${cls} rounded-full bg-[#0A4DAD] flex items-center justify-center text-white font-medium`}
    >
      {initial}
    </div>
  )
}
