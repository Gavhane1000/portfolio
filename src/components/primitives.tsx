import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react'
import { motion, useInView, useMotionValue, useSpring, useMotionTemplate } from 'motion/react'

export const EASE = [0.22, 1, 0.36, 1] as const

/** Fades + lifts content in once it scrolls into view. */
export function Reveal({ children, delay = 0, y = 24, className = '' }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

/** Word-by-word masked reveal for big headlines. Segments wrapped in *asterisks* render in the serif accent. */
export function SplitWords({
  text,
  className = '',
  delay = 0,
  stagger = 0.06,
  animateOnMount = false,
}: {
  text: string
  className?: string
  delay?: number
  stagger?: number
  animateOnMount?: boolean
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const show = animateOnMount || inView
  const words = text.split(' ')
  return (
    <span ref={ref} className={className} aria-label={text.replace(/\*/g, '')}>
      {words.map((word, i) => {
        if (word === '\n') return <br key={i} />
        const serif = word.startsWith('*')
        const clean = word.replace(/\*/g, '')
        return (
          <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
            <motion.span
              className={`inline-block ${serif ? 'accent-word font-serif italic font-normal tracking-normal px-[0.06em]' : ''}`}
              initial={{ y: '110%' }}
              animate={show ? { y: '0%' } : undefined}
              transition={{ duration: 0.9, ease: EASE, delay: delay + i * stagger }}
            >
              {clean}
              {i < words.length - 1 && ' '}
            </motion.span>
          </span>
        )
      })}
    </span>
  )
}

/** Slightly follows the cursor while hovered. */
export function Magnetic({ children, strength = 0.3, className = '' }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useSpring(0, { stiffness: 220, damping: 18, mass: 0.4 })
  const y = useSpring(0, { stiffness: 220, damping: 18, mass: 0.4 })
  return (
    <motion.div
      ref={ref}
      className={`inline-block ${className}`}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return
        const r = ref.current!.getBoundingClientRect()
        x.set((e.clientX - (r.left + r.width / 2)) * strength)
        y.set((e.clientY - (r.top + r.height / 2)) * strength)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}

type ButtonProps = { variant?: 'primary' | 'ghost'; children: ReactNode } & ComponentProps<'a'>

/** Pill CTA with a sliding text swap on hover. */
export function PillButton({ variant = 'primary', children, className = '', ...rest }: ButtonProps) {
  const base =
    'group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-3.5 text-sm font-medium transition-colors duration-300 cursor-pointer select-none'
  const styles =
    variant === 'primary'
      ? 'bg-accent text-on-accent hover:shadow-[0_0_40px_var(--glow)]'
      : 'border border-line-strong text-fg hover:border-fg/60 bg-transparent'
  return (
    <Magnetic strength={0.25}>
      <a className={`${base} ${styles} ${className}`} {...rest}>
        <span className="relative block overflow-hidden">
          <span className="flex items-center gap-2 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-full">
            {children}
          </span>
          <span className="absolute inset-0 flex translate-y-full items-center gap-2 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-y-0" aria-hidden>
            {children}
          </span>
        </span>
      </a>
    </Magnetic>
  )
}

/** "// 02 · Selected work" label used at the top of each section. */
export function SectionLabel({ index, children }: { index: string; children: ReactNode }) {
  return (
    <Reveal className="mb-8 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted md:mb-12">
      <span className="text-accent-ink">{index}</span>
      <span className="h-px w-10 bg-line-strong" />
      <span>{children}</span>
    </Reveal>
  )
}

/** Counts up from 0 when scrolled into view. */
export function CountUp({ to, prefix = '', suffix = '', className = '', start = true }: { to: number; prefix?: string; suffix?: string; className?: string; start?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -2% 0px' })
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView || !start) return
    const t0 = performance.now() + 900
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - t0) / 1800))
      setVal(Math.round(to * (1 - Math.pow(1 - p, 4))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, start, to])
  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}
      {val}
      {suffix}
    </span>
  )
}

/** Card with a soft lime spotlight that follows the cursor, and optional 3D tilt toward it. */
export function SpotlightCard({ children, className = '', tilt = false }: { children: ReactNode; className?: string; tilt?: boolean }) {
  const mx = useMotionValue(-400)
  const my = useMotionValue(-400)
  const rx = useSpring(0, { stiffness: 180, damping: 18 })
  const ry = useSpring(0, { stiffness: 180, damping: 18 })
  const bg = useMotionTemplate`radial-gradient(420px circle at ${mx}px ${my}px, var(--glow), transparent 70%)`
  return (
    <motion.div
      className={`group relative overflow-hidden rounded-3xl border border-line bg-elev/60 ${className}`}
      style={tilt ? { rotateX: rx, rotateY: ry, transformPerspective: 1000 } : undefined}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        mx.set(e.clientX - r.left)
        my.set(e.clientY - r.top)
        if (tilt && e.pointerType === 'mouse') {
          rx.set(((e.clientY - r.top) / r.height - 0.5) * -8)
          ry.set(((e.clientX - r.left) / r.width - 0.5) * 10)
        }
      }}
      onPointerLeave={() => {
        mx.set(-400)
        my.set(-400)
        rx.set(0)
        ry.set(0)
      }}
    >
      <motion.div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: bg }} />
      <div className="relative h-full">{children}</div>
    </motion.div>
  )
}

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1320px] px-5 md:px-10 ${className}`}>{children}</div>
}
