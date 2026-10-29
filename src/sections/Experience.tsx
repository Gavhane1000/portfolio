import { useRef } from 'react'
import { motion, useInView, useScroll, useSpring } from 'motion/react'
import { Container, EASE, SectionLabel, SplitWords } from '../components/primitives'
import { experience } from '../data/profile'

function Run({ job, i }: { job: (typeof experience)[number]; i: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20% 0px' })
  const current = i === 0
  return (
    <div ref={ref} className="relative pl-10 md:pl-14">
      <span className={`absolute left-0 top-1.5 grid size-[22px] place-items-center rounded-full border ${current ? 'border-accent-ink bg-accent/25' : 'border-line-strong bg-bg'}`}>
        <span className={`size-2 rounded-full ${current ? 'bg-accent-ink' : 'bg-muted'}`} />
      </span>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.7, ease: EASE }}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h3 className="text-2xl font-semibold tracking-[-0.03em] md:text-4xl">{job.company}</h3>
          <span className="font-mono text-xs text-muted">{job.period}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-3 text-sm text-muted md:text-base">
          <span className="text-fg">{job.role}</span>
          <span className="h-px w-4 bg-line-strong" />
          <span>{job.location}</span>
          {current && <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-on-accent">now</span>}
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-elev/70 font-mono text-[12px] md:text-[13px]">
          <div className="border-b border-line px-4 py-2.5 text-muted">
            <span className="text-accent-ink">$</span> run {job.company.toLowerCase().split(' ')[0]} --role "{job.role.split(' ·')[0]}"
          </div>
          <div className="space-y-1.5 px-4 py-4">
            {job.log.map((l, k) => (
              <motion.div
                key={l}
                className="flex gap-3"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : undefined}
                transition={{ duration: 0.3, delay: 0.35 + k * 0.15 }}
              >
                <span className="text-accent-ink">✓</span>
                <span className="leading-relaxed">{l}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export function Experience() {
  const listRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 0.7', 'end 0.6'] })
  const line = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  return (
    <section id="experience" className="py-28 md:py-40">
      <Container>
        <SectionLabel index="04">Experience</SectionLabel>
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <h2 className="text-[clamp(2.6rem,6cqw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.05em]">
              <SplitWords text="4+ years of *shipping.*" />
            </h2>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted md:text-base">
              From enterprise MLOps to agentic GenAI platforms, always owning the outcome rather than just the ticket.
            </p>
          </div>

          <div ref={listRef} className="relative space-y-16 md:space-y-20">
            <div className="absolute bottom-2 left-[10.5px] top-2 w-px bg-line" />
            <motion.div className="absolute left-[10.5px] top-2 bottom-2 w-px origin-top bg-accent-ink" style={{ scaleY: line }} />
            {experience.map((job, i) => (
              <Run key={job.company} job={job} i={i} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
