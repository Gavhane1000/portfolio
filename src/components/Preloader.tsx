import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { EASE } from './primitives'
import { lockScroll } from '../lib/smoothScroll'

const LINES = ['loading context · 4 yrs', 'spawning agents · 30–40', 'linking knowledge graph', 'ready']

function seenThisSession() {
  try {
    return sessionStorage.getItem('booted') === '1'
  } catch {
    return false
  }
}

/** Short "agent boot" intro, shown once per session. */
export function Preloader({ onDone }: { onDone: () => void }) {
  const [show] = useState(() => !seenThisSession() && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [visible, setVisible] = useState(show)
  const [pct, setPct] = useState(0)

  useEffect(() => {
    if (!show) {
      onDone()
      return
    }
    lockScroll(true)
    const start = performance.now()
    const DURATION = 1700
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / DURATION)
      setPct(Math.round((1 - Math.pow(1 - p, 3)) * 100))
      if (p < 1) raf = requestAnimationFrame(tick)
      else
        setTimeout(() => {
          try {
            sessionStorage.setItem('booted', '1')
          } catch {
            /* ignore */
          }
          setVisible(false)
          lockScroll(false)
          onDone()
        }, 220)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const lineCount = Math.min(LINES.length, Math.floor(pct / 25) + 1)

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-bg p-6 md:p-10"
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          initial={{ clipPath: 'inset(0 0 0% 0)' }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.2em] text-muted">
            <span>shubham.agent</span>
            <span>v2026</span>
          </div>
          <div className="space-y-1.5 font-mono text-sm text-muted">
            {LINES.slice(0, lineCount).map((l, i) => (
              <motion.div key={l} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: EASE }}>
                <span className={i === lineCount - 1 ? 'text-accent-ink' : ''}>{i === LINES.length - 1 ? '✓' : '›'}</span> {l}
              </motion.div>
            ))}
          </div>
          <div className="flex items-end justify-between">
            <div className="h-px flex-1 origin-left bg-line-strong">
              <div className="h-px bg-accent" style={{ width: `${pct}%` }} />
            </div>
            <span className="ml-6 text-[22vw] font-semibold leading-[0.8] tracking-[-0.06em] tabular-nums md:text-[13vw]">
              {pct}
              <span className="text-accent-ink">%</span>
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
