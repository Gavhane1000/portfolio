import Lenis from 'lenis'

// Kept on window so a hot reload replaces the instance instead of stacking a second one
// that fights the first over scroll position.
declare global {
  interface Window {
    __lenis?: { lenis: Lenis; raf: number }
  }
}

function current() {
  return window.__lenis?.lenis ?? null
}

export function initSmoothScroll() {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  if (window.__lenis) {
    cancelAnimationFrame(window.__lenis.raf)
    window.__lenis.lenis.destroy()
    window.__lenis = undefined
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4) })
  const state = { lenis, raf: 0 }
  const raf = (time: number) => {
    lenis.raf(time)
    state.raf = requestAnimationFrame(raf)
  }
  state.raf = requestAnimationFrame(raf)
  window.__lenis = state
}

export function scrollToId(id: string) {
  const lenis = current()
  if (id === 'top') {
    if (lenis) lenis.scrollTo(0, { force: true })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: -20, force: true })
  else el.scrollIntoView({ behavior: 'smooth' })
}

export function lockScroll(locked: boolean) {
  const lenis = current()
  if (lenis) (locked ? lenis.stop() : lenis.start())
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}
