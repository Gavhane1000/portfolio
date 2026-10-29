import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { ArrowDown, ArrowUpRight, Sparkles } from 'lucide-react'
import { KnowledgeGraph } from '../components/KnowledgeGraph'
import { Container, CountUp, EASE, PillButton, SplitWords } from '../components/primitives'
import { profile, stats } from '../data/profile'
import { scrollToId } from '../lib/smoothScroll'
import { openChat } from '../lib/chat'

export function Hero({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const graphScale = useTransform(scrollYProgress, [0, 1], [1, 1.35])
  const graphOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-25%'])
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.8, ease: EASE, delay },
  })

  return (
    <section id="top" ref={ref} className="relative min-h-[100svh] overflow-hidden">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -right-40 top-1/4 size-[60vw] rounded-full bg-[radial-gradient(circle,var(--glow),transparent_65%)] blur-3xl" />

      <motion.div
        className="absolute inset-0"
        style={{ scale: graphScale, opacity: graphOpacity }}
        initial={{ filter: 'blur(12px)' }}
        animate={ready ? { filter: 'blur(0px)' } : undefined}
        transition={{ duration: 1.4, ease: EASE }}
      >
        <div className="h-full opacity-40 lg:opacity-100">
          <KnowledgeGraph />
        </div>
      </motion.div>

      <motion.div style={{ y: textY, opacity: textOpacity }} className="relative z-10 flex min-h-[100svh] flex-col justify-end pb-8 pt-28 md:pb-10">
        <Container>
          <motion.div {...fade(0.1)} className="mb-8 inline-flex items-center gap-3 rounded-full border border-line bg-bg/60 py-1.5 pl-2.5 pr-4 text-xs text-muted backdrop-blur-md md:mb-10">
            <span className="relative flex size-2">
              <span className="absolute inset-0 rounded-full bg-accent-ink animate-pulse-ring" />
              <span className="relative size-2 rounded-full bg-accent-ink" />
            </span>
            {profile.availability}
          </motion.div>

          <h1 className="max-w-[15ch] text-[13.5cqw] font-semibold leading-[0.92] tracking-[-0.055em] sm:text-[11cqw] lg:text-[7.4cqw] 2xl:text-[min(124px,7.4cqw)]">
            {ready && (
              <SplitWords animateOnMount text="I build AI products that *actually* ship." delay={0.15} stagger={0.07} />
            )}
            {!ready && <span className="invisible">I build AI products that actually ship.</span>}
          </h1>

          <div className="mt-8 grid gap-8 md:mt-10 lg:grid-cols-[minmax(0,560px)_1fr] lg:items-end">
            <motion.p {...fade(0.7)} className="max-w-xl text-base leading-relaxed text-muted md:text-lg">
              I'm <span className="text-fg">{profile.name}</span>, a Product Engineer who takes GenAI from POC to production:{' '}
              <span className="text-fg">LLM agents, RAG, knowledge graphs</span> and the full-stack systems that make them scale.
            </motion.p>
            <motion.div {...fade(0.85)} className="flex flex-wrap gap-3 lg:justify-end">
              <PillButton
                href="#work"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToId('work')
                }}
              >
                See the work <ArrowUpRight className="size-4" />
              </PillButton>
              <PillButton
                variant="ghost"
                href="#ask"
                onClick={(e) => {
                  e.preventDefault()
                  openChat()
                }}
              >
                <Sparkles className="size-4 text-accent-ink" /> Ask Sage, my AI
              </PillButton>
            </motion.div>
          </div>

          <motion.dl {...fade(1)} className="mt-14 grid grid-cols-2 border-t border-line md:mt-16 md:grid-cols-4">
            {stats.map((s, i) => (
              <div key={s.label} className={`py-5 pr-4 md:py-6 ${i > 0 ? 'md:border-l md:border-line md:pl-6' : ''} ${i % 2 === 1 ? 'border-l border-line pl-4 md:pl-6' : ''} ${i > 1 ? 'border-t border-line md:border-t-0' : ''}`}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-3xl font-semibold tracking-tight md:text-4xl">
                  <CountUp start={ready} to={s.value} prefix={s.prefix} suffix={s.suffix} />
                </dd>
                <dd className="mt-1 text-xs text-muted md:text-sm">{s.label}</dd>
              </div>
            ))}
          </motion.dl>
        </Container>
      </motion.div>

      <motion.button
        onClick={() => scrollToId('about')}
        className="absolute bottom-8 right-6 z-10 hidden cursor-pointer items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted xl:flex"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : undefined}
        transition={{ delay: 1.4 }}
        aria-label="Scroll down"
      >
        <motion.span animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>
          <ArrowDown className="size-3.5" />
        </motion.span>
      </motion.button>
    </section>
  )
}
