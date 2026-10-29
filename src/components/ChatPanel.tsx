import { Fragment, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { ArrowUp, RotateCcw, Sparkles, X } from 'lucide-react'
import { closeChat, openChat, takePendingPrompt, useChatOpen } from '../lib/chat'

type Msg = { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  'Why should we hire Shubham?',
  'What has he built with LLM agents?',
  'Tell me about the Trade Finance platform',
  'Is he available for freelance work?',
]

/** Renders the model's plain-text answer with "- " bullets and **bold**. */
function Rich({ text }: { text: string }) {
  const inline = (s: string): ReactNode[] =>
    s.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={i} className="font-semibold text-fg">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      ),
    )
  const blocks = text.split('\n').filter((l, i, a) => l.trim() || (i > 0 && a[i - 1].trim()))
  return (
    <div className="space-y-1.5">
      {blocks.map((l, i) => {
        const bullet = /^\s*[-*•]\s+/.test(l)
        if (!l.trim()) return <div key={i} className="h-1" />
        return bullet ? (
          <div key={i} className="flex gap-2.5">
            <span className="mt-[9px] size-1 shrink-0 rounded-full bg-accent-ink" />
            <span>{inline(l.replace(/^\s*[-*•]\s+/, ''))}</span>
          </div>
        ) : (
          <p key={i}>{inline(l)}</p>
        )
      })}
    </div>
  )
}

export function ChatPanel() {
  const open = useChatOpen()
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // ⌘K / Ctrl+K toggles, Esc closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        open ? closeChat() : openChat()
      } else if (e.key === 'Escape' && open) closeChat()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    // Non-modal: the page stays scrollable and makes room for the panel (see .chat-open in index.css).
    document.documentElement.classList.toggle('chat-open', open)
    if (!open) return
    const t = setTimeout(() => inputRef.current?.focus(), 300)
    const pending = takePendingPrompt()
    if (pending) send(pending)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  async function send(text: string) {
    const q = text.trim()
    if (!q || busy) return
    const history: Msg[] = [...messages, { role: 'user', content: q }]
    setMessages([...history, { role: 'assistant', content: '' }])
    setInput('')
    setBusy(true)
    const ctrl = new AbortController()
    abortRef.current = ctrl
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
        signal: ctrl.signal,
      })
      if (!res.ok || !res.body) throw new Error((await res.text().catch(() => '')) || 'Request failed')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setMessages([...history, { role: 'assistant', content: acc }])
      }
      if (!acc.trim()) throw new Error('Empty response')
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      const msg = (err as Error).message
      setMessages([
        ...history,
        {
          role: 'assistant',
          content: msg && msg.length < 160 && !msg.startsWith('<') ? msg : "I couldn't reach my brain just now. Try again, or email shubhamgavhanework@gmail.com.",
        },
      ])
    } finally {
      setBusy(false)
    }
  }

  const reset = () => {
    abortRef.current?.abort()
    setMessages([])
    setBusy(false)
    inputRef.current?.focus()
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    send(input)
  }

  return (
    <AnimatePresence>
      {open && (
          <motion.aside
            key="chat"
            role="dialog"
            aria-modal={false}
            aria-label="Chat with Sage, Shubham's AI assistant"
            className="fixed bottom-2 right-2 z-[80] flex h-[62svh] w-[calc(100vw-16px)] flex-col overflow-hidden rounded-[24px] border border-line-strong bg-elev shadow-[0_30px_100px_-20px_rgba(0,0,0,0.55)] md:bottom-4 md:right-4 md:top-4 md:h-auto md:w-[420px] md:rounded-[28px]"
            initial={{ x: 'calc(100% + 24px)' }}
            animate={{ x: 0 }}
            exit={{ x: 'calc(100% + 24px)' }}
            transition={{ type: 'spring', bounce: 0.12, visualDuration: 0.45 }}
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="relative grid size-9 place-items-center rounded-full bg-accent text-on-accent">
                  <Sparkles className="size-4" />
                  {busy && <span className="absolute inset-0 rounded-full bg-accent animate-pulse-ring" />}
                </span>
                <div>
                  <div className="text-sm font-medium">Sage</div>
                  <div className="font-mono text-[11px] text-muted">{busy ? 'thinking…' : 'Shubham’s AI assistant · groq'}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button onClick={reset} className="grid size-9 cursor-pointer place-items-center rounded-full text-muted hover:bg-surface hover:text-fg" aria-label="New chat">
                    <RotateCcw className="size-4" />
                  </button>
                )}
                <button onClick={closeChat} className="grid size-9 cursor-pointer place-items-center rounded-full text-muted hover:bg-surface hover:text-fg" aria-label="Close">
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* messages */}
            <div ref={scrollRef} data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">
              {messages.length === 0 ? (
                <div>
                  <p className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">
                    Hi, I’m Sage. Ask me about <span className="accent-word px-1 font-serif font-normal italic">Shubham.</span>
                  </p>
                  <p className="mt-2 text-sm text-muted">Skills, projects, impact, availability. Answers come from his actual experience.</p>
                  <div className="mt-6 grid gap-2">
                    {SUGGESTIONS.map((s, i) => (
                      <motion.button
                        key={s}
                        onClick={() => send(s)}
                        className="cursor-pointer rounded-2xl border border-line bg-surface/50 p-4 text-left text-sm transition-colors hover:border-accent-ink hover:bg-surface"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }}
                      >
                        {s}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {messages.map((m, i) =>
                    m.role === 'user' ? (
                      <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-accent px-4 py-2.5 text-sm text-on-accent">{m.content}</div>
                      </motion.div>
                    ) : (
                      <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                        <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-line-strong">
                          <Sparkles className="size-3 text-accent-ink" />
                        </span>
                        <div className="min-w-0 flex-1 text-[15px] leading-relaxed text-fg/90">
                          {m.content ? (
                            <Rich text={m.content} />
                          ) : (
                            <span className="inline-flex gap-1 pt-2">
                              {[0, 1, 2].map((d) => (
                                <motion.span
                                  key={d}
                                  className="size-1.5 rounded-full bg-accent"
                                  animate={{ opacity: [0.2, 1, 0.2] }}
                                  transition={{ repeat: Infinity, duration: 1, delay: d * 0.15 }}
                                />
                              ))}
                            </span>
                          )}
                          {busy && i === messages.length - 1 && m.content && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-accent animate-blink" />}
                        </div>
                      </motion.div>
                    ),
                  )}
                </div>
              )}
            </div>

            {/* input */}
            <form onSubmit={submit} className="border-t border-line p-3">
              <div className="flex items-center gap-2 rounded-full border border-line-strong bg-bg pl-5 pr-1.5 transition-colors focus-within:border-accent-ink">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={600}
                  placeholder="Ask about projects, skills, availability…"
                  className="h-12 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || busy}
                  className="grid size-9 cursor-pointer place-items-center rounded-full bg-accent text-on-accent transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Send"
                >
                  <ArrowUp className="size-4" />
                </button>
              </div>
              <p className="mt-2 text-center font-mono text-[10px] text-muted">AI can make mistakes. Verify important details via email.</p>
            </form>
          </motion.aside>
      )}
    </AnimatePresence>
  )
}

/** Floating launcher that appears once the visitor scrolls past the hero. */
export function ChatLauncher() {
  const open = useChatOpen()
  const { scrollY } = useScroll()
  const [show, setShow] = useState(false)
  useMotionValueEvent(scrollY, 'change', (y) => setShow(y > window.innerHeight * 0.9))
  return (
    <AnimatePresence>
      {show && !open && (
        <motion.button
          key="launcher"
          onClick={() => openChat()}
          className="fixed bottom-5 right-5 z-50 flex cursor-pointer items-center gap-2 rounded-full bg-accent py-3 pl-4 pr-5 text-sm font-medium text-on-accent shadow-[0_10px_40px_-10px_var(--glow)] md:bottom-8 md:right-8"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
        >
          <Sparkles className="size-4" /> Ask Sage
        </motion.button>
      )}
    </AnimatePresence>
  )
}
