import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'
import { Hand, Play, RotateCcw } from 'lucide-react'
import { Container, EASE, Magnetic, Reveal, SectionLabel, SplitWords } from '../components/primitives'
import { createOrbit, fitCanvas, project, readGraphColors, type Projected, type Vec3 } from '../lib/orbit'

type Kind = 'io' | 'hub' | 'agent' | 'dkg' | 'out'
type SceneNode = { id: string; label: string; desc: string; p: Vec3; kind: Kind; stage: number; pr: Projected }

const STEPS = [
  { title: 'Ingest', desc: 'Bundles of PDFs and scans arrive: LCs, invoices, bills of lading.' },
  { title: 'OCR + trace', desc: 'OCRmyPDF pipeline keeps a pointer to the source of every token.' },
  { title: 'Orchestrate', desc: 'The orchestrator plans the run and routes work to specialist agents.' },
  { title: 'Agents', desc: '30–40 specialised LLM agents classify, extract, check and validate in parallel.' },
  { title: 'Ground in DKG', desc: 'Answers are checked against a Domain Knowledge Graph, so nothing is hallucinated.' },
  { title: 'Traceable output', desc: 'A reviewer-ready result where every value links back to its source.' },
]

const AGENTS: [string, string][] = [
  ['Classifier', 'Classifies every page in parallel with a small decision model (Jev): ~5× faster than an LLM at ~1% of the cost.'],
  ['Extractor', 'Pulls key-value pairs along with their source coordinates.'],
  ['RAG', 'Retrieves the rules, clauses and precedent that apply.'],
  ['Compliance', 'Checks the transaction against regulations and policy.'],
  ['Scrutiny', 'Cross-verifies documents against each other for discrepancies.'],
  ['Validator', 'Validates every output against the knowledge graph.'],
  ['Summariser', 'Writes the reviewer-ready summary.'],
  ['Router', 'Decides which agent runs next, using tool/function calling.'],
]

const RING_Y = 0.12
const RING_R = 1.05

function buildScene() {
  const mk = (id: string, label: string, desc: string, p: Vec3, kind: Kind, stage: number): SceneNode => ({
    id, label, desc, p, kind, stage, pr: { sx: 0, sy: 0, scale: 1, depth: 0.5 },
  })
  const nodes: SceneNode[] = [
    mk('docs', 'Documents', STEPS[0].desc, { x: 0, y: -1.3, z: 0 }, 'io', 0),
    mk('ocr', 'OCR + trace', STEPS[1].desc, { x: 0, y: -0.88, z: 0 }, 'io', 1),
    mk('orch', 'Orchestrator', STEPS[2].desc, { x: 0, y: -0.42, z: 0 }, 'hub', 2),
    ...AGENTS.map(([label, desc], i) => {
      const a = (i / AGENTS.length) * Math.PI * 2
      return mk(`a${i}`, label, desc, { x: Math.cos(a) * RING_R, y: RING_Y, z: Math.sin(a) * RING_R }, 'agent', 3)
    }),
    mk('dkg', 'Knowledge Graph', STEPS[4].desc, { x: 0, y: RING_Y, z: 0 }, 'dkg', 4),
    mk('out', 'Traceable result', STEPS[5].desc, { x: 0, y: 0.95, z: 0 }, 'out', 5),
  ]
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]))
  const agentIds = AGENTS.map((_, i) => `a${i}`)
  const edges: [string, string, number][] = [
    ['docs', 'ocr', 1],
    ['ocr', 'orch', 1],
    ...agentIds.map((a) => ['orch', a, 0.8] as [string, string, number]),
    ...agentIds.map((a) => [a, 'dkg', 0.55] as [string, string, number]),
    ...agentIds.map((a, i) => [a, agentIds[(i + 1) % agentIds.length], 0.3] as [string, string, number]),
    ['dkg', 'out', 1],
  ]

  // The DKG core is itself a small graph: a cluster of points around the centre.
  const cluster: { p: Vec3; pr: Projected }[] = Array.from({ length: 30 }, (_, i) => {
    const golden = Math.PI * (3 - Math.sqrt(5))
    const y = 1 - (i / 29) * 2
    const r = Math.sqrt(1 - y * y)
    const s = 0.24 + ((i * 37) % 10) / 100
    return { p: { x: Math.cos(golden * i) * r * s, y: RING_Y + y * s, z: Math.sin(golden * i) * r * s }, pr: { sx: 0, sy: 0, scale: 1, depth: 0 } }
  })
  const clusterEdges: [number, number][] = []
  cluster.forEach((c, i) => {
    cluster
      .map((d, j) => ({ j, d: (d.p.x - c.p.x) ** 2 + (d.p.y - c.p.y) ** 2 + (d.p.z - c.p.z) ** 2 }))
      .filter((o) => o.j > i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
      .forEach(({ j }) => clusterEdges.push([i, j]))
  })
  const ring: { p: Vec3; pr: Projected }[] = Array.from({ length: 72 }, (_, i) => {
    const a = (i / 72) * Math.PI * 2
    return { p: { x: Math.cos(a) * RING_R, y: RING_Y, z: Math.sin(a) * RING_R }, pr: { sx: 0, sy: 0, scale: 1, depth: 0 } }
  })
  return { nodes, byId, edges, cluster, clusterEdges, ring, agentIds }
}

type Packet = { from: string; to: string; t: number; speed: number; strong: boolean }

function AgentScene({ stage, hint }: { stage: number; hint: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef(stage)
  const [hovered, setHovered] = useState<SceneNode | null>(null)
  const [dragged, setDragged] = useState(false)

  // Spawn the packets for each stage as the run advances.
  const spawnRef = useRef<(s: number) => void>(() => {})
  useEffect(() => {
    stageRef.current = stage
    spawnRef.current(stage)
  }, [stage])

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const scene = buildScene()
    const orbit = createOrbit(canvas, { rotX: -0.32, rotY: 0.4, autoSpin: 0.0016 })
    let { w, h } = fitCanvas(canvas, ctx)
    let colors = readGraphColors(canvas)
    const packets: Packet[] = []
    const mouse = { x: -1, y: -1, in: false }
    let hoverId: string | null = null
    let raf = 0
    let visible = false
    let last = 0
    let ambient = 0
    let outGlow = 0

    spawnRef.current = (s) => {
      const P = (from: string, to: string) => packets.push({ from, to, t: 0, speed: 0.022, strong: true })
      if (s === 0) P('docs', 'ocr')
      if (s === 1) P('ocr', 'orch')
      if (s === 2) scene.agentIds.forEach((a) => P('orch', a))
      if (s === 3) scene.agentIds.forEach((a) => P(a, 'dkg'))
      if (s === 4) {
        P('dkg', 'out')
        scene.agentIds.forEach((a, i) => i % 2 === 0 && P('dkg', a))
      }
      if (s === 5) outGlow = 1
    }

    const size = () => Math.min(w * 0.36, h * 0.36)
    const cx = () => w / 2
    const cy = () => h * 0.5

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      const S = size()
      const { rotX, rotY } = orbit
      for (const n of scene.nodes) project(n.p, rotX, rotY, cx(), cy(), S, n.pr)
      for (const c of scene.cluster) project(c.p, rotX, rotY, cx(), cy(), S, c.pr)
      for (const r of scene.ring) project(r.p, rotX, rotY, cx(), cy(), S, r.pr)
      const st = stageRef.current

      // orbit ring
      ctx.lineWidth = 1
      for (let i = 0; i < scene.ring.length; i++) {
        const a = scene.ring[i].pr, b = scene.ring[(i + 1) % scene.ring.length].pr
        ctx.strokeStyle = `rgb(${colors.fg} / ${0.04 + a.depth * 0.12})`
        ctx.setLineDash(i % 2 ? [] : [2, 4])
        ctx.beginPath()
        ctx.moveTo(a.sx, a.sy)
        ctx.lineTo(b.sx, b.sy)
        ctx.stroke()
      }
      ctx.setLineDash([])

      // edges
      for (const [a, b, weight] of scene.edges) {
        const A = scene.byId[a], B = scene.byId[b]
        const lit = hoverId && (hoverId === a || hoverId === b)
        const active = st >= 0 && (A.stage === st || B.stage === st) && Math.abs(A.stage - B.stage) <= 1
        const d = (A.pr.depth + B.pr.depth) / 2
        ctx.strokeStyle = lit || active ? `rgb(${colors.node} / ${0.4 + d * 0.5})` : `rgb(${colors.fg} / ${(0.05 + d * 0.16) * weight})`
        ctx.lineWidth = lit || active ? 1.4 : 1
        ctx.beginPath()
        ctx.moveTo(A.pr.sx, A.pr.sy)
        ctx.lineTo(B.pr.sx, B.pr.sy)
        ctx.stroke()
      }

      // DKG cluster
      const dkgActive = st === 4 || hoverId === 'dkg'
      for (const [i, j] of scene.clusterEdges) {
        const a = scene.cluster[i].pr, b = scene.cluster[j].pr
        ctx.strokeStyle = `rgb(${colors.node} / ${(dkgActive ? 0.35 : 0.14) + a.depth * 0.25})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(a.sx, a.sy)
        ctx.lineTo(b.sx, b.sy)
        ctx.stroke()
      }
      for (const c of scene.cluster) {
        ctx.fillStyle = `rgb(${colors.node} / ${0.3 + c.pr.depth * 0.6})`
        ctx.beginPath()
        ctx.arc(c.pr.sx, c.pr.sy, 1.6 * c.pr.scale, 0, Math.PI * 2)
        ctx.fill()
      }

      // packets
      for (let k = packets.length - 1; k >= 0; k--) {
        const p = packets[k]
        const A = scene.byId[p.from].pr, B = scene.byId[p.to].pr
        const x = A.sx + (B.sx - A.sx) * p.t
        const y = A.sy + (B.sy - A.sy) * p.t
        const rad = p.strong ? 14 : 8
        const g = ctx.createRadialGradient(x, y, 0, x, y, rad)
        g.addColorStop(0, `rgb(${colors.node} / ${p.strong ? 1 : 0.6})`)
        g.addColorStop(1, `rgb(${colors.node} / 0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, rad, 0, Math.PI * 2)
        ctx.fill()
      }

      // nodes, back to front
      const order = [...scene.nodes].sort((a, b) => a.pr.depth - b.pr.depth)
      ctx.textBaseline = 'middle'
      for (const n of order) {
        if (n.kind === 'dkg') continue
        const { sx, sy, scale, depth } = n.pr
        const active = n.stage === st || hoverId === n.id || (n.kind === 'out' && outGlow > 0.05)
        const base = n.kind === 'hub' ? 9 : n.kind === 'agent' ? 6 : 7
        const r = base * scale
        const alpha = 0.35 + depth * 0.65
        if (active) {
          const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 5)
          g.addColorStop(0, `rgb(${colors.node} / 0.35)`)
          g.addColorStop(1, `rgb(${colors.node} / 0)`)
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(sx, sy, r * 5, 0, Math.PI * 2)
          ctx.fill()
        }
        // shape: squares for I/O, circles for agents, double ring for the orchestrator
        ctx.fillStyle = active ? `rgb(${colors.node} / 1)` : `rgb(${colors.fg} / ${alpha * 0.9})`
        if (n.kind === 'io' || n.kind === 'out') {
          ctx.beginPath()
          ctx.roundRect(sx - r, sy - r, r * 2, r * 2, 2.5)
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.arc(sx, sy, r, 0, Math.PI * 2)
          ctx.fill()
        }
        if (n.kind === 'hub') {
          ctx.strokeStyle = `rgb(${colors.node} / ${0.5 * alpha})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(sx, sy, r + 6, 0, Math.PI * 2)
          ctx.stroke()
        }
        ctx.font = `${n.kind === 'agent' ? 400 : 500} ${n.kind === 'agent' ? 11 : 12}px "Geist Mono", ui-monospace, monospace`
        ctx.fillStyle = active ? `rgb(${colors.node} / 1)` : `rgb(${colors.fg} / ${0.25 + depth * 0.7})`
        ctx.fillText(n.label, sx + r + 9, sy)
      }
      // label for the DKG core
      const dk = scene.byId.dkg.pr
      ctx.font = '500 11px "Geist Mono", ui-monospace, monospace'
      ctx.fillStyle = `rgb(${colors.node} / ${dkgActive ? 1 : 0.75})`
      ctx.textAlign = 'center'
      ctx.fillText('DKG', dk.sx, dk.sy + size() * 0.36)
      ctx.textAlign = 'left'
    }

    const pick = () => {
      if (!mouse.in || orbit.dragging) return null
      let best: SceneNode | null = null
      let bestD = Infinity
      for (const n of scene.nodes) {
        const reach = n.kind === 'dkg' ? 45 : 28
        const d = Math.hypot(n.pr.sx - mouse.x, n.pr.sy - mouse.y)
        if (d < reach && d < bestD) {
          bestD = d
          best = n
        }
      }
      return best
    }

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      if (!visible) return
      const dt = Math.min(48, t - (last || t))
      last = t
      orbit.step(dt)
      if (orbit.touched) setDragged(true)

      // ambient chatter between agents when no run is in progress
      ambient += dt
      if (stageRef.current < 0 && ambient > 420) {
        ambient = 0
        const [a, b] = scene.edges[(Math.random() * scene.edges.length) | 0]
        packets.push(Math.random() > 0.5 ? { from: a, to: b, t: 0, speed: 0.012, strong: false } : { from: b, to: a, t: 0, speed: 0.012, strong: false })
      }
      for (let k = packets.length - 1; k >= 0; k--) {
        packets[k].t += packets[k].speed * (dt / 16)
        if (packets[k].t >= 1) packets.splice(k, 1)
      }
      outGlow *= 0.985
      draw()

      const hit = pick()
      const id = hit?.id ?? null
      if (id !== hoverId) {
        hoverId = id
        setHovered(hit)
        canvas.style.cursor = hit ? 'pointer' : orbit.dragging ? 'grabbing' : 'grab'
      }
      if (hit && tipRef.current) {
        const x = Math.min(Math.max(hit.pr.sx, 130), w - 130)
        tipRef.current.style.transform = `translate(${x}px, ${hit.pr.sy - 18}px) translate(-50%, -100%)`
      }
    }

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
      mouse.in = mouse.x >= 0 && mouse.y >= 0 && mouse.x <= r.width && mouse.y <= r.height
    }
    const onLeave = () => (mouse.in = false)

    const ro = new ResizeObserver(() => ({ w, h } = fitCanvas(canvas, ctx)))
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(canvas)
    const mo = new MutationObserver(() => (colors = readGraphColors(canvas)))
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onLeave)
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      orbit.dispose()
      ro.disconnect()
      io.disconnect()
      mo.disconnect()
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div className="relative h-[460px] md:h-[620px]">
      <canvas ref={canvasRef} className="block h-full w-full" aria-label="Interactive 3D diagram of a multi-agent document intelligence system" role="img" />
      <div
        ref={tipRef}
        className={`pointer-events-none absolute left-0 top-0 w-60 rounded-2xl border border-line-strong bg-bg/90 p-3.5 backdrop-blur-md transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-ink">{hovered?.kind === 'agent' ? 'Agent' : STEPS[hovered?.stage ?? 0]?.title}</div>
        <div className="mt-1 text-sm font-medium">{hovered?.label}</div>
        <div className="mt-1 text-xs leading-relaxed text-muted">{hovered?.desc}</div>
      </div>
      {hint && !dragged && (
        <motion.div
          className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-line bg-bg/70 px-3.5 py-1.5 font-mono text-[11px] text-muted backdrop-blur-md"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <motion.span animate={{ x: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}>
            <Hand className="size-3.5" />
          </motion.span>
          drag to rotate · hover to inspect
        </motion.div>
      )}
    </div>
  )
}

export function Architecture() {
  const [stage, setStage] = useState(-1)
  const [ran, setRan] = useState(false)
  const timer = useRef<number[]>([])
  const sectionRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: '-25% 0px' })

  const run = () => {
    timer.current.forEach(clearTimeout)
    setRan(true)
    timer.current = [...STEPS.map((_, i) => window.setTimeout(() => setStage(i), 150 + i * 1150)), window.setTimeout(() => setStage(-1), 150 + STEPS.length * 1150 + 600)]
  }

  // Auto-run once the first time the scene scrolls into view.
  useEffect(() => {
    if (inView && !ran) run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])
  useEffect(() => () => timer.current.forEach(clearTimeout), [])

  const running = stage >= 0

  return (
    <section id="architecture" data-theme="dark" className="band relative overflow-hidden py-28 md:py-40">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_70%_50%,#000_20%,transparent_70%)]" />
      <Container className="relative">
        <SectionLabel index="03">Under the hood</SectionLabel>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-10">
          <div className="flex flex-col">
            <h2 className="text-[clamp(2.6rem,6cqw,5.2rem)] font-semibold leading-[0.95] tracking-[-0.05em]">
              <SplitWords text="Inside an *agent system.*" />
            </h2>
            <Reveal>
              <p className="mt-6 text-sm leading-relaxed text-muted md:text-base">
                A simplified, interactive view of the multi-agent architecture I build for document-heavy workflows like Trade Finance and i3D Expert.
                Drag it, inspect each agent, or run a document through it.
              </p>
            </Reveal>

            <ol className="mt-10 space-y-1">
              {STEPS.map((s, i) => {
                const active = stage === i
                const done = running && i < stage
                return (
                  <li key={s.title} className="relative">
                    <button
                      onClick={() => {
                        timer.current.forEach(clearTimeout)
                        setStage(i)
                      }}
                      className={`relative flex w-full cursor-pointer gap-4 rounded-2xl px-4 py-3 text-left transition-colors ${active ? '' : 'hover:bg-surface/60'}`}
                    >
                      {active && <motion.span layoutId="arch-step" className="absolute inset-0 rounded-2xl border border-line-strong bg-surface" transition={{ duration: 0.4, ease: EASE }} />}
                      <span className={`relative mt-0.5 font-mono text-xs ${active || done ? 'text-accent-ink' : 'text-muted'}`}>{done ? '✓' : `0${i + 1}`}</span>
                      <span className="relative">
                        <span className={`block text-[15px] font-medium transition-colors ${active ? 'text-fg' : done ? 'text-fg/80' : 'text-muted'}`}>{s.title}</span>
                        <motion.span
                          className="block overflow-hidden text-sm leading-relaxed text-muted"
                          initial={false}
                          animate={{ height: active ? 'auto' : 0, opacity: active ? 1 : 0 }}
                          transition={{ duration: 0.35, ease: EASE }}
                        >
                          <span className="block pt-1">{s.desc}</span>
                        </motion.span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>

            <div className="mt-8">
              <Magnetic strength={0.25}>
                <button
                  onClick={run}
                  className="group flex cursor-pointer items-center gap-3 rounded-full bg-accent py-3 pl-3 pr-6 text-sm font-medium text-on-accent transition-shadow hover:shadow-[0_0_40px_var(--glow)]"
                >
                  <span className="grid size-8 place-items-center rounded-full bg-on-accent text-accent">
                    {ran && !running ? <RotateCcw className="size-3.5" /> : <Play className="size-3.5 translate-x-px" />}
                  </span>
                  {running ? 'Processing…' : ran ? 'Run it again' : 'Run a document'}
                </button>
              </Magnetic>
            </div>
          </div>

          <Reveal className="relative">
            <div ref={sectionRef} className="relative overflow-hidden rounded-[28px] border border-line bg-elev/40">
              <div className="flex items-center justify-between border-b border-line px-5 py-3 font-mono text-[11px] text-muted">
                <span className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${running ? 'bg-accent' : 'bg-line-strong'}`} />
                  {running ? `stage ${stage + 1}/6 · ${STEPS[stage].title.toLowerCase()}` : 'idle · agents chatting'}
                </span>
                <span className="hidden sm:inline">multi-agent · dkg-grounded</span>
              </div>
              <AgentScene stage={stage} hint={inView} />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
