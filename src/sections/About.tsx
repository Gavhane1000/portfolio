import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { Download, MapPin } from 'lucide-react'
import { Container, PillButton, Reveal, SectionLabel } from '../components/primitives'
import { marquee, profile } from '../data/profile'

export function Marquee() {
  const items = [...marquee, ...marquee]
  return (
    <div className="relative border-y border-line py-6 md:py-8" aria-hidden>
      <div className="mask-fade-x flex overflow-hidden">
        <div className="animate-marquee flex shrink-0 items-center gap-8 pr-8 md:gap-12 md:pr-12">
          {items.map((m, i) => (
            <span key={i} className="flex items-center gap-8 whitespace-nowrap text-3xl font-medium tracking-tight md:gap-12 md:text-5xl">
              <span className={i % 2 ? 'text-outline' : ''}>{m}</span>
              <span className="text-accent-ink text-xl md:text-2xl">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

const STATEMENT =
  "I work where models meet real users. For 4+ years I've turned messy enterprise workflows into AI systems people rely on: agents that reason over knowledge graphs, document pipelines that cite their sources, and platforms that grow from 8 users to 120 on the same hardware."

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.16, 1])
  const highlight = /^(AI|agents|knowledge|graphs,|cite|8|120)/.test(word)
  return (
    <motion.span style={{ opacity }} className={highlight ? 'text-accent-ink' : undefined}>
      {word}{' '}
    </motion.span>
  )
}

export function About() {
  const textRef = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: textRef, offset: ['start 0.85', 'end 0.45'] })
  const words = STATEMENT.split(' ')

  const imgRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: imgProgress } = useScroll({ target: imgRef, offset: ['start end', 'end start'] })
  const imgY = useTransform(imgProgress, [0, 1], ['-8%', '8%'])

  return (
    <section id="about" className="py-28 md:py-40">
      <Container>
        <SectionLabel index="01">About</SectionLabel>
        <div className="grid gap-14 lg:grid-cols-[380px_1fr] lg:gap-20">
          <Reveal>
            <div ref={imgRef} className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-surface">
              <motion.img
                src={profile.photo}
                alt={`Portrait of ${profile.name}`}
                className="absolute inset-x-0 top-[-8%] h-[116%] w-full object-cover grayscale-[0.2]"
                style={{ y: imgY }}
                loading="lazy"
              />
              <div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-2xl border border-line bg-bg/70 px-4 py-3 text-xs backdrop-blur-md">
                <span className="flex items-center gap-1.5 text-muted">
                  <MapPin className="size-3.5 text-accent-ink" /> {profile.location}
                </span>
                <span className="font-mono text-muted">18.52°N 73.86°E</span>
              </div>
            </div>
          </Reveal>

          <div className="flex flex-col justify-between gap-12">
            <p ref={textRef} className="text-[clamp(1.6rem,3.4cqw,3.1rem)] font-medium leading-[1.18] tracking-[-0.03em]">
              {words.map((w, i) => (
                <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
              ))}
            </p>

            <Reveal className="grid gap-6 border-t border-line pt-8 sm:grid-cols-3">
              {[
                ['Currently', 'Product Engineer @ Intellect Design Arena'],
                ['Previously', 'Software Developer @ LTIMindtree'],
                ['Education', 'B.E. Computer Engineering · 9.02 CGPA'],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">{k}</div>
                  <div className="mt-2 text-sm leading-snug">{v}</div>
                </div>
              ))}
            </Reveal>
            <Reveal>
              <PillButton variant="ghost" href={profile.resume} download>
                <Download className="size-4" /> Download résumé
              </PillButton>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  )
}
