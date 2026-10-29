import { useEffect, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUp, ArrowUpRight, Check, Copy, Download, Loader2, Send } from 'lucide-react'
import { Container, EASE, Magnetic, Reveal, SectionLabel, SplitWords } from '../components/primitives'
import { GithubIcon, LinkedinIcon } from '../lib/icons'
import { profile } from '../data/profile'
import { scrollToId } from '../lib/smoothScroll'

const INTENTS = ['Hiring for a role', 'Freelance project', 'Just saying hi'] as const

const EMAILJS = {
  service: import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined,
  template: import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined,
  key: import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined,
}

type Status = 'idle' | 'sending' | 'sent' | 'error'

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">{label}</span>
      <input
        {...props}
        className="mt-2 w-full border-b border-line-strong bg-transparent pb-3 text-lg outline-none transition-colors placeholder:text-muted/50 focus:border-accent-ink"
      />
    </label>
  )
}

function ContactForm() {
  const [intent, setIntent] = useState<(typeof INTENTS)[number]>(INTENTS[0])
  const [status, setStatus] = useState<Status>('idle')

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    if (data.get('company_website')) return // honeypot
    const payload = {
      from_name: String(data.get('name') ?? ''),
      reply_to: String(data.get('email') ?? ''),
      intent,
      message: String(data.get('message') ?? ''),
    }

    if (!EMAILJS.service || !EMAILJS.template || !EMAILJS.key) {
      // Not configured yet: fall back to the visitor's mail client.
      const body = `${payload.message}\n\n— ${payload.from_name} (${payload.reply_to})`
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(`[Portfolio] ${intent}`)}&body=${encodeURIComponent(body)}`
      return
    }

    setStatus('sending')
    try {
      const emailjs = (await import('@emailjs/browser')).default
      await emailjs.send(EMAILJS.service, EMAILJS.template, payload, { publicKey: EMAILJS.key })
      setStatus('sent')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={submit} className="rounded-[28px] border border-line bg-elev/70 p-6 md:p-10">
      <div>
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">I'm reaching out about</span>
        <div className="mt-3 flex flex-wrap gap-2">
          {INTENTS.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setIntent(t)}
              className={`relative cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors ${intent === t ? 'border-transparent text-on-accent' : 'border-line-strong text-muted hover:text-fg'}`}
            >
              {intent === t && <motion.span layoutId="intent-pill" className="absolute inset-0 rounded-full bg-accent" transition={{ type: 'spring', bounce: 0.15, duration: 0.45 }} />}
              <span className="relative">{t}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <Field label="Your name" name="name" required autoComplete="name" placeholder="Jane Doe" />
        <Field label="Email" name="email" type="email" required autoComplete="email" placeholder="jane@company.com" />
      </div>
      <label className="mt-8 block">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Message</span>
        <textarea
          name="message"
          required
          rows={4}
          maxLength={2000}
          placeholder={intent === 'Freelance project' ? 'What are we building? Timeline, scope, budget range…' : 'Tell me about the role and the team…'}
          className="mt-2 w-full resize-none border-b border-line-strong bg-transparent pb-3 text-lg outline-none transition-colors placeholder:text-muted/50 focus:border-accent-ink"
        />
      </label>
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <AnimatePresence mode="wait">
          <motion.p
            key={status}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={`text-sm ${status === 'error' ? 'text-red-400' : status === 'sent' ? 'text-accent-ink' : 'text-muted'}`}
            role="status"
          >
            {status === 'sent' && 'Message received. I usually reply within a day.'}
            {status === 'error' && `Something went wrong. Email me directly at ${profile.email}.`}
            {(status === 'idle' || status === 'sending') && 'I reply within 24 hours.'}
          </motion.p>
        </AnimatePresence>
        <Magnetic>
          <button
            type="submit"
            disabled={status === 'sending'}
            className="group flex cursor-pointer items-center gap-3 rounded-full bg-accent py-3.5 pl-6 pr-3.5 text-sm font-medium text-on-accent transition-shadow hover:shadow-[0_0_40px_var(--glow)] disabled:opacity-70"
          >
            {status === 'sent' ? 'Sent' : 'Send message'}
            <span className="grid size-8 place-items-center rounded-full bg-on-accent text-accent transition-transform duration-300 group-hover:rotate-[-35deg]">
              {status === 'sending' ? <Loader2 className="size-4 animate-spin" /> : status === 'sent' ? <Check className="size-4" /> : <Send className="size-3.5" />}
            </span>
          </button>
        </Magnetic>
      </div>
    </form>
  )
}

function CopyEmail() {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(profile.email).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1800)
        })
      }}
      className="group flex w-full cursor-pointer items-center justify-between gap-4 border-b border-line py-5 text-left"
    >
      <span>
        <span className="block font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Email</span>
        <span className="mt-1 block break-all text-lg transition-colors group-hover:text-accent-ink md:text-xl">{profile.email}</span>
      </span>
      <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line-strong text-muted transition-colors group-hover:border-accent-ink group-hover:text-accent-ink">
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </span>
    </button>
  )
}

function LinkRow({ href, label, value, icon, download }: { href: string; label: string; value: string; icon: React.ReactNode; download?: boolean }) {
  return (
    <a href={href} target={download ? undefined : '_blank'} rel="noreferrer" download={download} className="group flex items-center justify-between gap-4 border-b border-line py-5">
      <span>
        <span className="block font-mono text-[11px] uppercase tracking-[0.2em] text-muted">{label}</span>
        <span className="mt-1 block text-lg transition-colors group-hover:text-accent-ink md:text-xl">{value}</span>
      </span>
      <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line-strong text-muted transition-all duration-300 group-hover:border-accent-ink group-hover:text-accent-ink">
        {icon}
      </span>
    </a>
  )
}

export function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden py-28 md:py-40">
      <div className="pointer-events-none absolute -left-40 bottom-0 size-[50vw] rounded-full bg-[radial-gradient(circle,var(--glow),transparent_65%)] blur-3xl" />
      <Container className="relative">
        <SectionLabel index="07">Contact</SectionLabel>
        <h2 className="max-w-[14ch] text-[clamp(3rem,9cqw,8.5rem)] font-semibold leading-[0.9] tracking-[-0.055em]">
          <SplitWords text="Let’s build something *intelligent.*" />
        </h2>

        <div className="mt-16 grid gap-12 md:mt-24 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
          <Reveal>
            <ContactForm />
          </Reveal>
          <Reveal delay={0.1} className="flex flex-col">
            <CopyEmail />
            <LinkRow href={profile.linkedin} label="LinkedIn" value="in/shubham-gavhane1080" icon={<LinkedinIcon className="size-4" />} />
            <LinkRow href={profile.github} label="GitHub" value="Gavhane1000" icon={<GithubIcon className="size-4" />} />
            <LinkRow href={profile.resume} label="Résumé" value="Download PDF" icon={<Download className="size-4" />} download />
          </Reveal>
        </div>
      </Container>
    </section>
  )
}

function PuneClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30)
    return () => clearInterval(t)
  }, [])
  return <>{now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })} IST</>
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line pt-14">
      <Container className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-6 text-sm text-muted">
          <div className="flex items-center gap-6">
            <span>
              Pune · <PuneClock />
            </span>
            <a href={profile.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-fg">
              LinkedIn <ArrowUpRight className="size-3.5" />
            </a>
            <a href={profile.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-fg">
              GitHub <ArrowUpRight className="size-3.5" />
            </a>
          </div>
          <button onClick={() => scrollToId('top')} className="group inline-flex cursor-pointer items-center gap-2 hover:text-fg">
            Back to top
            <span className="grid size-8 place-items-center rounded-full border border-line-strong transition-colors group-hover:border-accent-ink group-hover:text-accent-ink">
              <ArrowUp className="size-3.5" />
            </span>
          </button>
        </div>
      </Container>
      <motion.div
        className="pointer-events-none mt-10 select-none whitespace-nowrap text-center text-[17.5cqw] font-semibold leading-[0.78] tracking-[-0.07em]"
        initial={{ y: '40%', opacity: 0 }}
        whileInView={{ y: '0%', opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: EASE }}
        aria-hidden
      >
        <span className="relative inline-block">
          <span className="text-outline">Shubham</span>
          <span className="animate-fill-sweep absolute inset-0 text-accent-ink">Shubham</span>
        </span>
        <span className="text-accent-ink">.</span>
      </motion.div>
      <Container>
        <div className="flex flex-wrap justify-between gap-2 border-t border-line pt-6 pb-24 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          <span>© {new Date().getFullYear()} {profile.name}</span>
          <span>Designed &amp; built by me</span>
        </div>
      </Container>
    </footer>
  )
}
