// frontend/src/hooks/useChatScroll.ts
/**
 * Custom hook for advanced chat scroll behavior
 * Handles:
 * - Detecting if user is at bottom or scrolled up
 * - Smooth scroll to bottom
 * - Infinite scroll detection (scroll to top for older messages)
 * - Scroll position preservation when new messages prepended
 */

import { useRef, useEffect, useCallback, useState } from 'react'

interface UseChatScrollOptions {
  /** Pixel threshold for "at bottom" detection (default: 100) */
  bottomThreshold?: number
  /** Pixel threshold for "at top" detection for infinite scroll (default: 150) */
  topThreshold?: number
}

interface UseChatScrollReturn {
  /** Ref to attach to scrollable container */
  scrollContainerRef: React.RefObject<HTMLDivElement>
  /** Whether user is at or near the bottom */
  isAtBottom: boolean
  /** Whether user is at or near the top (for infinite scroll trigger) */
  isAtTop: boolean
  /** Scroll to bottom smoothly */
  scrollToBottom: (behavior?: ScrollBehavior) => void
  /** Preserve scroll position before adding new messages to top */
  preserveScrollPosition: () => void
  /** Adjust scroll position after adding new messages (call after DOM update) */
  restoreScrollPosition: () => void
}

/**
 * Hook for managing chat scroll behavior with flex-col-reverse layout
 * 
 * Usage:
 * ```tsx
 * const { scrollContainerRef, isAtBottom, isAtTop, scrollToBottom } = useChatScroll()
 * return <div ref={scrollContainerRef} onScroll={...} className="flex-col-reverse">...</div>
 * ```
 */
export function useChatScroll(
  options: UseChatScrollOptions = {}
): UseChatScrollReturn {
  const { bottomThreshold = 100, topThreshold = 150 } = options

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [isAtTop, setIsAtTop] = useState(false)

  // Store scroll height before prepending messages (for infinite scroll)
  const scrollHeightBeforeRef = useRef(0)
  const scrollTopBeforeRef = useRef(0)

  /**
   * Check scroll position and update state
   * For flex-col-reverse:
   * - scrollTop ≈ 0 means at BOTTOM (reversed)
   * - scrollTop is large means scrolled UP (reversed)
   */
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return

    const { scrollTop, scrollHeight, clientHeight } = el

    // At bottom: scrollTop is very small (close to 0)
    const atBottom = scrollTop < bottomThreshold
    setIsAtBottom(atBottom)

    // At top: distance from bottom is very small
    // For flex-col-reverse, "top" means large scrollHeight - scrollTop - clientHeight
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight
    const atTop = distanceFromBottom < topThreshold
    setIsAtTop(atTop)
  }, [bottomThreshold, topThreshold])

  /**
   * Smooth scroll to bottom (for flex-col-reverse, this means scrollTop = 0)
   */
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const el = scrollContainerRef.current
    if (!el) return

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      if (typeof el.scrollTo === 'function') {
        el.scrollTo({ top: 0, behavior })
      } else {
        el.scrollTop = 0
      }
    })
  }, [])

  /**
   * Call BEFORE prepending old messages to capture current scroll state
   * This enables scroll position restoration after new DOM elements are added
   */
  const preserveScrollPosition = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return

    scrollHeightBeforeRef.current = el.scrollHeight
    scrollTopBeforeRef.current = el.scrollTop
  }, [])

  /**
   * Call AFTER prepending old messages (after DOM update completes)
   * Adjusts scrollTop so previously visible messages stay in same viewport position
   * 
   * Formula for flex-col-reverse with prepended messages:
   * - Old messages are added at the END (bottom) of the reversed list
   * - scrollHeight increases by (new scrollHeight - old scrollHeight)
   * - To keep the same messages visible, increase scrollTop by the same amount
   */
  const restoreScrollPosition = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return

    requestAnimationFrame(() => {
      const heightDifference = el.scrollHeight - scrollHeightBeforeRef.current
      el.scrollTop = scrollTopBeforeRef.current + heightDifference
    })
  }, [])

  // Attach scroll listener
  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return

    el.addEventListener('scroll', handleScroll)
    return () => el.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return {
    scrollContainerRef,
    isAtBottom,
    isAtTop,
    scrollToBottom,
    preserveScrollPosition,
    restoreScrollPosition,
  }
}
