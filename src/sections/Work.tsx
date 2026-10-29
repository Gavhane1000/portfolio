import { useLayoutEffect, useRef, useState } from 'react'
import { motion, useInView, useScroll, useTransform, type MotionValue } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { Container, EASE, Reveal, SectionLabel, SplitWords, SpotlightCard } from '../components/primitives'
import { agentic, sideProjects, work, type CaseStudy } from '../data/profile'
import { useMediaQuery } from '../hooks/useMediaQuery'

const STACK_QUERY = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)'

/** Agent-console style execution trace shown on each case study. */
const TRACES: Record<string, string[]> = {
  'trade-finance': ['ingest  lc_bundle.pdf', 'classify  jev · per page, parallel', 'route   34 agents · rag + dkg', 'check   compliance & scrutiny', 'done    ~3m  (was 8m)'],
  air: ['recv    pacs.008 · remittance', 'parse   structured? → deterministic', 'agent   extract invoices + evidence', 'decide  match · score · route', 'done    ~1,000 records / day'],
  'i3d-expert': ['recv    mixed_docs[ ]', 'plan    orchestrator → tools', 'agent   classify · cross-domain', 'agent   extract key-values', 'ground  dkg · trace ✓'],
  'ticket-agent': ['recv    ticket #48213', 'graph   arangodb · related ops', 'reason  llm → resolution plan', 'act     apply fix + notify', 'done    −30% time-to-resolve'],
  mlops: ['init    project scaffold', 'lint    vscode-ext · standards', 'train   versioned pipeline', 'deploy  k8s · rollout', 'done    lifecycle managed'],
  'alert-ml': ['recv    1,284 alerts', 'model   correlate · cluster', 'triage  auto-assign P1/P2', 'notify  owners', 'done    patent ✓'],
}

function Trace({ lines }: { lines: string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20% 0px' })
  return (
    <div ref={ref} className="rounded-2xl border border-line bg-bg/80 p-4 font-mono text-[11.5px] leading-6 md:text-xs">
      <div className="mb-2 flex items-center gap-1.5 border-b border-line pb-2.5">
        <span className="size-2 rounded-full bg-line-strong" />
        <span className="size-2 rounded-full bg-line-strong" />
        <span className="size-2 rounded-full bg-accent" />
        <span className="ml-2 text-muted">agent.trace</span>
      </div>
      {lines.map((l, i) => {
        const [cmd, ...rest] = l.split(/\s{2,}/)
        const last = i === lines.length - 1
        return (
          <motion.div
            key={l}
            initial={{ opacity: 0, x: -6 }}
            animate={inView ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.35, delay: 0.25 + i * 0.22, ease: EASE }}
            className="flex gap-3 whitespace-nowrap"
          >
            <span className={last ? 'text-accent-ink' : 'text-muted'}>{last ? '✓' : '›'}</span>
            <span className={`w-14 shrink-0 ${last ? 'text-accent-ink' : 'text-muted'}`}>{cmd}</span>
            <span className={`truncate ${last ? 'text-accent-ink' : ''}`}>{rest.join(' ')}</span>
          </motion.div>
        )
      })}
    </div>
  )
}

const STACK_TOP = 88
const STACK_STEP = 12

type CardProps = {
  c: CaseStudy
  i: number
  total: number
  progress: MotionValue<number>
  stacking: boolean
  height: number | null
  innerRef: (el: HTMLDivElement | null) => void
}

function CaseCard({ c, i, total, progress, stacking, height, innerRef }: CardProps) {
  const last = i === total - 1
  // Cards underneath shrink slightly and dim as later cards cover them; the top (last) card never does.
  const scale = useTransform(progress, [i / total, 1], [1, 1 - (total - 1 - i) * 0.03])
  const dim = useTransform(progress, [(i + 0.4) / total, (i + 1) / total], [0, 0.4])
  return (
    <div className={stacking ? 'sticky pb-6' : 'pb-5'} style={stacking ? { top: STACK_TOP, paddingTop: i * STACK_STEP } : undefined}>
      <motion.article
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.8, ease: EASE }}
        style={stacking ? { scale, height: height ?? undefined } : undefined}
        className="relative origin-top overflow-hidden rounded-[28px] border border-line bg-elev shadow-[var(--shadow-card)]"
      >
        {stacking && !last && <motion.div className="pointer-events-none absolute inset-0 z-10 bg-bg" style={{ opacity: dim }} />}
        <div ref={innerRef} className="grid gap-8 p-6 md:p-10 lg:grid-cols-[1.25fr_1fr] lg:gap-12">
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              <span className="text-accent-ink">{c.index}</span>
              <span>{c.company}</span>
              <span className="h-px w-6 bg-line-strong" />
              <span>{c.year}</span>
            </div>
            <h3 className="mt-4 text-3xl font-semibold leading-[1.02] tracking-[-0.035em] md:text-[2.75rem]">{c.title}</h3>
            <p className="mt-2 font-serif text-xl italic md:text-2xl"><span className="accent-word px-1">{c.kicker}</span></p>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted md:text-[15px]">{c.problem}</p>
            <ul className="mt-5 space-y-2">
              {c.build.map((b) => (
                <li key={b} className="flex gap-3 text-sm leading-relaxed">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent-ink" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              {c.impact.map((m, k) => (
                <div key={m.label} className={`rounded-2xl border border-line p-4 md:p-5 ${k === 0 ? 'col-span-2 bg-accent text-on-accent border-transparent' : 'bg-surface/60'}`}>
                  <div className={`font-semibold tracking-[-0.04em] ${k === 0 ? 'text-4xl md:text-6xl' : 'text-2xl md:text-3xl'}`}>{m.value}</div>
                  <div className={`mt-1 text-xs ${k === 0 ? 'text-on-accent/70' : 'text-muted'}`}>{m.label}</div>
                </div>
              ))}
            </div>
            {TRACES[c.id] && <Trace lines={TRACES[c.id]} />}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {c.stack.map((s) => (
                <span key={s} className="rounded-full border border-line px-2.5 py-1 text-[11px] text-muted">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.article>
    </div>
  )
}

export function Work() {
  const stackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: stackRef, offset: ['start start', 'end end'] })
  const canStack = useMediaQuery(STACK_QUERY)
  const innerRefs = useRef<(HTMLDivElement | null)[]>([])
  const [cardH, setCardH] = useState<number | null>(null)
  const [viewH, setViewH] = useState(() => window.innerHeight)

  // Every card takes the tallest card's height so each one fully covers the one beneath it.
  useLayoutEffect(() => {
    const measure = () => {
      let max = 0
      for (const el of innerRefs.current) if (el) max = Math.max(max, el.offsetHeight)
      setCardH(max ? max + 2 : null) // + top/bottom border
      setViewH(window.innerHeight)
    }
    measure()
    const ro = new ResizeObserver(measure)
    innerRefs.current.forEach((el) => el && ro.observe(el))
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  // Only stack when the tallest card fits under the nav with every card's offset.
  const stacking = canStack && cardH !== null && STACK_TOP + (work.length - 1) * STACK_STEP + cardH + 24 <= viewH

  return (
    <section id="work" className="py-28 md:py-40">
      <Container>
        <SectionLabel index="02">Selected work</SectionLabel>
        <div className="mb-16 grid gap-6 md:mb-24 lg:grid-cols-[1fr_380px] lg:items-end">
          <h2 className="text-[clamp(2.6rem,7cqw,6.5rem)] font-semibold leading-[0.95] tracking-[-0.05em]">
            <SplitWords text="Systems in *production,* not demos." />
          </h2>
          <Reveal>
            <p className="text-sm leading-relaxed text-muted md:text-base">
              Each project below is running in production, owned end to end, and measured by the business outcomes it moved.
            </p>
          </Reveal>
        </div>

        {/* The trailing space lets the finished stack rest before it scrolls away as one piece. */}
        <div ref={stackRef} className="relative" style={stacking ? { paddingBottom: '22vh' } : undefined}>
          {work.map((c, i) => (
            <CaseCard
              key={c.id}
              c={c}
              i={i}
              total={work.length}
              progress={scrollYProgress}
              stacking={stacking}
              height={cardH}
              innerRef={(el) => (innerRefs.current[i] = el)}
            />
          ))}
        </div>

        <div className="mt-20 md:mt-28">
          <div className="mb-8 grid gap-4 md:grid-cols-[1fr_380px] md:items-end">
            <h3 className="text-[clamp(1.9rem,4cqw,3.4rem)] font-semibold leading-[1] tracking-[-0.04em]">
              <SplitWords text="Agentic engineering with *Claude Code.*" />
            </h3>
            <Reveal>
              <p className="text-sm leading-relaxed text-muted">Making AI part of how software gets built: product knowledge, QA and design systems packaged as skills and agents.</p>
            </Reveal>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {agentic.map((a, i) => (
              <Reveal key={a.title} delay={i * 0.08}>
                <SpotlightCard tilt className="flex h-full flex-col p-6 md:p-8">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-line-strong px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent-ink">{a.tag}</span>
                    <span className="font-mono text-xs text-muted">0{i + 1}</span>
                  </div>
                  <div className="mt-8 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">{a.metric}</div>
                  <h4 className="mt-4 text-xl font-semibold tracking-tight">{a.title}</h4>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{a.desc}</p>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-20 md:mt-28">
          <Reveal className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-muted">Also built</Reveal>
          <div className="grid gap-4 md:grid-cols-2">
            {sideProjects.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08}>
                <SpotlightCard tilt className="h-full p-6 md:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold tracking-tight md:text-2xl">{p.title}</h3>
                    <ArrowUpRight className="size-5 shrink-0 text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-ink" />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{p.desc}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {p.stack.map((s) => (
                      <span key={s} className="rounded-full bg-surface px-3 py-1 text-xs text-muted">
                        {s}
                      </span>
                    ))}
                  </div>
                </SpotlightCard>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
