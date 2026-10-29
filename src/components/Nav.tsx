import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { Menu, Moon, Sparkles, Sun, X } from 'lucide-react'
import { scrollToId, lockScroll } from '../lib/smoothScroll'
import { useTheme } from '../lib/theme'
import { openChat } from '../lib/chat'
import { profile } from '../data/profile'
import { EASE } from './primitives'

const LINKS = [
  { id: 'work', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'services', label: 'Services' },
  { id: 'contact', label: 'Contact' },
]

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="relative grid size-8 place-items-center rounded-full bg-accent text-[13px] font-bold tracking-tight text-on-accent">SG</span>
      <span className="hidden text-sm font-medium tracking-tight sm:block">{profile.name}</span>
    </span>
  )
}

export function Nav() {
  const { theme, toggle } = useTheme()
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState(false)
  const [isMac, setIsMac] = useState(true)

  useEffect(() => setIsMac(/Mac|iPhone|iPad/.test(navigator.platform)), [])

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setHidden(y > prev && y > 400 && !menu)
    setScrolled(y > 40)
  })

  useEffect(() => {
    if (!menu) return
    lockScroll(true)
    return () => lockScroll(false)
  }, [menu])

  const go = (id: string) => {
    setMenu(false)
    setTimeout(() => scrollToId(id), menu ? 350 : 0)
  }

  return (
    <>
      <motion.header
        className="fixed left-0 right-[var(--chat-offset)] top-0 z-50 px-3 pt-3 transition-[right] duration-500 ease-[cubic-bezier(.22,1,.36,1)] md:px-6 md:pt-4"
        animate={{ y: hidden ? '-120%' : '0%' }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        <nav
          className={`mx-auto flex max-w-[1320px] items-center justify-between rounded-full px-3 py-2 transition-[background-color,border-color,backdrop-filter] duration-500 md:px-4 ${
            scrolled ? 'border border-line bg-bg/70 backdrop-blur-xl' : 'border border-transparent'
          }`}
        >
          <button onClick={() => go('top')} className="cursor-pointer" aria-label="Back to top">
            <Logo />
          </button>

          <ul className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <li key={l.id}>
                <button onClick={() => go(l.id)} className="group relative cursor-pointer rounded-full px-4 py-2 text-sm text-muted transition-colors hover:text-fg">
                  {l.label}
                  <span className="absolute inset-x-4 bottom-1 h-px origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100" />
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openChat()}
              className="group flex cursor-pointer items-center gap-2 rounded-full border border-line-strong bg-surface/60 py-2 pl-3 pr-2 text-sm transition-colors hover:border-accent-ink"
            >
              <Sparkles className="size-4 text-accent-ink" />
              <span className="hidden sm:inline">Ask Sage</span>
              <kbd className="hidden rounded-md border border-line bg-bg px-1.5 py-0.5 font-mono text-[10px] text-muted lg:inline">{isMac ? '⌘' : 'Ctrl'} K</kbd>
            </button>
            <button
              onClick={(e) => toggle({ x: e.clientX, y: e.clientY })}
              className="grid size-9 cursor-pointer place-items-center rounded-full border border-line-strong transition-colors hover:border-accent-ink"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
                </motion.span>
              </AnimatePresence>
            </button>
            <button
              onClick={() => setMenu((m) => !m)}
              className="grid size-9 cursor-pointer place-items-center rounded-full bg-fg text-bg md:hidden"
              aria-label={menu ? 'Close menu' : 'Open menu'}
              aria-expanded={menu}
            >
              {menu ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menu && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col justify-end bg-bg px-6 pb-10 pt-24 md:hidden"
            initial={{ clipPath: 'circle(0% at calc(100% - 40px) 36px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 40px) 36px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 40px) 36px)' }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul className="space-y-2">
              {LINKS.map((l, i) => (
                <li key={l.id} className="overflow-hidden">
                  <motion.button
                    onClick={() => go(l.id)}
                    className="flex w-full cursor-pointer items-baseline gap-4 py-1 text-left text-5xl font-medium tracking-tight"
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.6, ease: EASE, delay: 0.15 + i * 0.06 }}
                  >
                    <span className="font-mono text-xs text-accent-ink">0{i + 1}</span>
                    {l.label}
                  </motion.button>
                </li>
              ))}
            </ul>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-12 border-t border-line pt-6 font-mono text-xs text-muted">
              {profile.email}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
