import { useCallback, useSyncExternalStore } from 'react'

type Theme = 'dark' | 'light'
const listeners = new Set<() => void>()

function get(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

export function useTheme() {
  const theme = useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    get,
    () => 'dark' as Theme,
  )
  const toggle = useCallback((origin?: { x: number; y: number }) => {
    const next: Theme = get() === 'dark' ? 'light' : 'dark'
    const apply = () => {
      document.documentElement.dataset.theme = next
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#0A0B0A' : '#E6E5DC')
      try {
        localStorage.setItem('theme', next)
      } catch {
        /* storage unavailable */
      }
      listeners.forEach((l) => l())
    }
    // Circular reveal from the toggle where supported, instant swap elsewhere.
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } }
    if (!doc.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return apply()
    const { x, y } = origin ?? { x: window.innerWidth / 2, y: 0 }
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    doc.startViewTransition(apply).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' },
      )
    })
  }, [])
  return { theme, toggle }
}
