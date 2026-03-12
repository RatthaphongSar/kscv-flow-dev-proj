const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-lg',
}

export default function UserAvatar({
  name,
  size = 'sm',
  onClick,
  className = '',
}: {
  name: string
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  className?: string
}) {
  const initial = name?.charAt(0)?.toUpperCase() || '?'
  const cls = sizeMap[size]
  const isClickable = typeof onClick === 'function'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${cls} ${className} rounded-full bg-[#0A4DAD] flex items-center justify-center text-white font-medium ${isClickable ? 'cursor-pointer hover:opacity-90 transition' : ''}`}
      aria-label={name ? `View ${name}` : 'View user'}
    >
      {initial}
    </button>
  )
}
