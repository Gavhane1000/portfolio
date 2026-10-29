import { useEffect, useRef } from 'react'

const LABELS = [
  'LLM Agents', 'RAG', 'Knowledge Graph', 'FastAPI', 'React', 'Kubernetes', 'OCR',
  'Python', 'Function Calling', 'Microservices', 'Vue.js', 'Spring Boot', 'Docker', 'Prompting',
]

type Node = { x: number; y: number; z: number; label?: string; sx: number; sy: number; ss: number; depth: number }
type Pulse = { a: number; b: number; t: number; speed: number }

/**
 * A slowly rotating 3D knowledge graph on canvas. Labelled skill nodes, nearest-neighbour edges,
 * and lime "agent messages" travelling along edges. The cursor tilts the graph and lights up nodes.
 */
export function KnowledgeGraph({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0, h = 0, dpr = 1, cx = 0, cy = 0, R = 0
    let nodes: Node[] = []
    let edges: [number, number][] = []
    let neighbours: number[][] = []
    const pulses: Pulse[] = []
    let rotY = 0.6, rotX = -0.25
    let targetTiltX = -0.25, extraSpin = 0
    const mouse = { x: -9999, y: -9999, inside: false }
    let hovered = -1
    let raf = 0
    let visible = true
    let nodeRGB = '198 255 61', fgRGB = '237 239 234', glowRGB = '198 255 61'

    const readColors = () => {
      const cs = getComputedStyle(canvas)
      nodeRGB = cs.getPropertyValue('--graph-node').trim() || nodeRGB
      fgRGB = cs.getPropertyValue('--graph-fg').trim() || fgRGB
      glowRGB = cs.getPropertyValue('--graph-glow').trim() || glowRGB
    }

    const build = () => {
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const desktop = w >= 1024
      cx = desktop ? w * 0.7 : w * 0.5
      cy = desktop ? h * 0.5 : h * 0.42
      R = desktop ? Math.min(w * 0.27, h * 0.4) : Math.min(w * 0.46, h * 0.3)

      const count = desktop ? 96 : 60
      pulses.length = 0 // in-flight pulses reference the old node indices
      const golden = Math.PI * (3 - Math.sqrt(5))
      nodes = Array.from({ length: count }, (_, i) => {
        const y = 1 - (i / (count - 1)) * 2
        const r = Math.sqrt(1 - y * y)
        const th = golden * i
        const jitter = 0.86 + ((i * 7919) % 100) / 700
        return { x: Math.cos(th) * r * jitter, y: y * jitter, z: Math.sin(th) * r * jitter, sx: 0, sy: 0, ss: 0, depth: 0 }
      })
      // Spread labels evenly around the sphere.
      const step = Math.floor(count / LABELS.length)
      LABELS.forEach((l, i) => (nodes[(i * step + 3) % count].label = desktop || i < 9 ? l : undefined))

      const seen = new Set<string>()
      edges = []
      neighbours = nodes.map(() => [])
      nodes.forEach((n, i) => {
        const near = nodes
          .map((m, j) => ({ j, d: (m.x - n.x) ** 2 + (m.y - n.y) ** 2 + (m.z - n.z) ** 2 }))
          .filter((o) => o.j !== i)
          .sort((a, b) => a.d - b.d)
          .slice(0, 3)
        for (const { j } of near) {
          const key = i < j ? `${i}-${j}` : `${j}-${i}`
          if (seen.has(key)) continue
          seen.add(key)
          edges.push([i, j])
          neighbours[i].push(j)
          neighbours[j].push(i)
        }
      })
    }

    const project = () => {
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY)
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX)
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        const x1 = n.x * cosY - n.z * sinY
        const z1 = n.x * sinY + n.z * cosY
        const y1 = n.y * cosX - z1 * sinX
        const z2 = n.y * sinX + z1 * cosX
        const persp = 2.6 / (2.6 + z2)
        n.sx = cx + x1 * R * persp
        n.sy = cy + y1 * R * persp
        n.ss = persp
        n.depth = (1 - z2) / 2 // 0 back … 1 front
      }
    }

    const spawnPulse = () => {
      if (!edges.length) return
      const [a, b] = edges[(Math.random() * edges.length) | 0]
      pulses.push(Math.random() > 0.5 ? { a, b, t: 0, speed: 0.008 + Math.random() * 0.012 } : { a: b, b: a, t: 0, speed: 0.008 + Math.random() * 0.012 })
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      project()

      // hover detection: nearest node to cursor
      hovered = -1
      if (mouse.inside) {
        let best = 34 * 34
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i]
          if (n.depth < 0.35) continue
          const d = (n.sx - mouse.x) ** 2 + (n.sy - mouse.y) ** 2
          if (d < best) {
            best = d
            hovered = i
          }
        }
      }
      const lit = hovered >= 0 ? new Set([hovered, ...neighbours[hovered]]) : null

      // edges
      ctx.lineWidth = 1
      for (let k = 0; k < edges.length; k++) {
        const [i, j] = edges[k]
        const a = nodes[i], b = nodes[j]
        const d = (a.depth + b.depth) / 2
        const on = lit && lit.has(i) && lit.has(j)
        ctx.strokeStyle = on ? `rgb(${nodeRGB} / 0.85)` : `rgb(${fgRGB} / ${0.03 + d * 0.13})`
        ctx.beginPath()
        ctx.moveTo(a.sx, a.sy)
        ctx.lineTo(b.sx, b.sy)
        ctx.stroke()
      }

      // pulses
      for (let k = pulses.length - 1; k >= 0; k--) {
        const p = pulses[k]
        p.t += p.speed
        if (p.t >= 1) {
          // hop onward to a neighbour sometimes, like a message routed through agents
          const next = neighbours[p.b]
          if (Math.random() < 0.55 && next.length) {
            const nb = next[(Math.random() * next.length) | 0]
            pulses[k] = { a: p.b, b: nb, t: 0, speed: p.speed }
          } else pulses.splice(k, 1)
          continue
        }
        const a = nodes[p.a], b = nodes[p.b]
        const x = a.sx + (b.sx - a.sx) * p.t
        const y = a.sy + (b.sy - a.sy) * p.t
        const d = a.depth + (b.depth - a.depth) * p.t
        const g = ctx.createRadialGradient(x, y, 0, x, y, 12)
        g.addColorStop(0, `rgb(${glowRGB} / ${0.45 + d * 0.55})`)
        g.addColorStop(1, `rgb(${glowRGB} / 0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, 12, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = `rgb(${nodeRGB} / ${0.4 + d * 0.6})`
        ctx.beginPath()
        ctx.arc(x, y, 1.6, 0, Math.PI * 2)
        ctx.fill()
      }

      // nodes (back to front so labels sit on top)
      const order = nodes.map((_, i) => i).sort((a, b) => nodes[a].depth - nodes[b].depth)
      ctx.font = '500 11px "Geist Mono", ui-monospace, monospace'
      ctx.textBaseline = 'middle'
      for (const i of order) {
        const n = nodes[i]
        const isLit = lit?.has(i)
        const r = (n.label ? 3.2 : 1.6) * n.ss * (i === hovered ? 1.8 : 1)
        if (n.label) {
          ctx.fillStyle = `rgb(${glowRGB} / ${0.3 * n.depth})`
          ctx.beginPath()
          ctx.arc(n.sx, n.sy, r * 3.2, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.fillStyle = n.label || isLit ? `rgb(${nodeRGB} / ${0.25 + n.depth * 0.75})` : `rgb(${fgRGB} / ${0.12 + n.depth * 0.5})`
        ctx.beginPath()
        ctx.arc(n.sx, n.sy, r, 0, Math.PI * 2)
        ctx.fill()
        if (n.label && n.depth > 0.42) {
          const alpha = Math.min(1, (n.depth - 0.42) * 2.2) * (isLit ? 1 : 0.75)
          ctx.fillStyle = isLit ? `rgb(${nodeRGB} / ${alpha})` : `rgb(${fgRGB} / ${alpha})`
          ctx.fillText(n.label, n.sx + r + 8, n.sy)
        }
      }
    }

    let last = 0
    let pulseClock = 0
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      if (!visible) return
      const dt = Math.min(48, t - (last || t))
      last = t
      const mx = mouse.inside ? (mouse.x - cx) / w : 0
      extraSpin += (mx * 0.004 - extraSpin) * 0.05
      rotY += 0.0016 * (dt / 16) + extraSpin
      rotX += (targetTiltX - rotX) * 0.04
      pulseClock += dt
      if (pulseClock > 260 && pulses.length < 14) {
        pulseClock = 0
        spawnPulse()
      }
      draw()
    }

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
      mouse.inside = mouse.y >= 0 && mouse.y <= rect.height
      targetTiltX = -0.25 + ((mouse.y - cy) / h) * 0.5
    }
    const onLeave = () => {
      mouse.inside = false
      targetTiltX = -0.25
    }

    readColors()
    build()
    if (reduced) {
      draw()
    } else {
      for (let i = 0; i < 6; i++) spawnPulse()
      raf = requestAnimationFrame(loop)
    }

    const ro = new ResizeObserver(() => {
      build()
      if (reduced) draw()
    })
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(canvas)
    const mo = new MutationObserver(() => {
      readColors()
      if (reduced) draw()
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    document.fonts?.ready.then(() => reduced && draw())

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      mo.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className={`block h-full w-full ${className}`} aria-hidden />
}
