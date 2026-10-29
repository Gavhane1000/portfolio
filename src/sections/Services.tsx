import { Bot, FileSearch, Layers, Rocket, Workflow } from 'lucide-react'
import { motion } from 'motion/react'
import { Container, EASE, Reveal, SectionLabel, SplitWords, SpotlightCard } from '../components/primitives'
import { process, recognition, services, skills } from '../data/profile'
import { SkillGlobe } from '../components/SkillGlobe'

const ICONS = [Bot, FileSearch, Layers, Workflow, Rocket]

export function Services() {
  return (
    <section id="services" className="py-28 md:py-40">
      <Container>
        <SectionLabel index="05">Services &amp; capabilities</SectionLabel>
        <div className="mb-16 grid gap-6 md:mb-20 lg:grid-cols-[1fr_380px] lg:items-end">
          <h2 className="text-[clamp(2.6rem,7cqw,6.5rem)] font-semibold leading-[0.95] tracking-[-0.05em]">
            <SplitWords text="Need an AI product built? *Let’s ship it.*" />
          </h2>
          <Reveal>
            <p className="text-sm leading-relaxed text-muted md:text-base">
              Hiring for a team or need a builder for a focused project? I go from fuzzy idea to a production system with real users and measurable impact.
            </p>
          </Reveal>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {services.map((s, i) => {
            const Icon = ICONS[i]
            return (
              <Reveal key={s.title} delay={(i % 2) * 0.08} className={i === services.length - 1 && services.length % 2 ? 'md:col-span-2' : ''}>
                <SpotlightCard tilt className="h-full p-7 md:p-9">
                  <div className="flex items-start justify-between">
                    <span className="grid size-12 place-items-center rounded-2xl border border-line bg-surface text-accent-ink transition-colors duration-300 group-hover:bg-accent group-hover:text-on-accent">
                      <Icon className="size-5" />
                    </span>
                    <span className="font-mono text-xs text-muted">0{i + 1}</span>
                  </div>
                  <h3 className="mt-10 text-2xl font-semibold tracking-[-0.03em] md:text-3xl">{s.title}</h3>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-muted md:text-[15px]">{s.desc}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {s.tags.map((t) => (
                      <span key={t} className="rounded-full border border-line px-3 py-1 text-xs text-muted">
                        {t}
                      </span>
                    ))}
                  </div>
                </SpotlightCard>
              </Reveal>
            )
          })}
        </div>

        {/* Process */}
        <div className="mt-24 md:mt-32">
          <Reveal className="mb-10 font-mono text-xs uppercase tracking-[0.2em] text-muted">How I work</Reveal>
          <div className="relative grid gap-10 md:grid-cols-4 md:gap-6">
            <motion.div
              className="absolute left-0 right-0 top-[7px] hidden h-px origin-left bg-line-strong md:block"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: '-15% 0px' }}
              transition={{ duration: 1.4, ease: EASE }}
            />
            {process.map((p, i) => (
              <Reveal key={p.step} delay={0.2 + i * 0.12} className="relative">
                <span className="relative block size-[15px] rounded-full border-2 border-accent-ink bg-bg" />
                <div className="mt-6 font-mono text-xs text-accent-ink">{p.step}</div>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{p.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Stack */}
        <div className="mt-24 md:mt-32">
          <Reveal className="mb-8 font-mono text-xs uppercase tracking-[0.2em] text-muted">Toolkit</Reveal>
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,460px)_1fr] lg:gap-16">
          <Reveal className="mx-auto w-full max-w-[460px]">
            <SkillGlobe />
          </Reveal>
          <div className="divide-y divide-line border-y border-line">
            {Object.entries(skills).map(([group, list], i) => (
              <Reveal key={group} delay={i * 0.05}>
                <div className="grid gap-3 py-6 md:grid-cols-[160px_1fr] md:items-center md:gap-8">
                  <div className="text-sm font-medium">{group}</div>
                  <div className="flex flex-wrap gap-2">
                    {list.map((s) => (
                      <span
                        key={s}
                        className="cursor-default rounded-full bg-surface px-3.5 py-1.5 text-[13px] text-muted transition-colors duration-200 hover:bg-accent hover:text-on-accent"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

export function Recognition() {
  return (
    <section className="py-20 md:py-28">
      <Container>
        <SectionLabel index="06">Recognition</SectionLabel>
        <ul className="border-t border-line">
          {recognition.map((r, i) => (
            <motion.li
              key={r.title}
              className="group relative overflow-hidden border-b border-line"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.8, ease: EASE, delay: i * 0.06 }}
            >
                <span className="absolute inset-0 origin-bottom scale-y-0 bg-accent transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-y-100" />
                <div className="relative grid gap-2 px-1 py-7 transition-colors duration-300 group-hover:text-on-accent md:grid-cols-[80px_1fr_1.2fr] md:items-center md:gap-8 md:px-4 md:py-9">
                  <span className="font-mono text-xs text-muted transition-colors group-hover:text-on-accent/70">0{i + 1}</span>
                  <h3 className="text-3xl font-semibold tracking-[-0.04em] md:text-5xl">{r.title}</h3>
                  <p className="text-sm text-muted transition-colors group-hover:text-on-accent/80 md:text-base">{r.desc}</p>
                </div>
            </motion.li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
