import { useEffect, useRef, useState } from 'react'
import { skills } from '../data/profile'
import { createOrbit, fitCanvas, project, readGraphColors, type Projected, type Vec3 } from '../lib/orbit'

type Word = { text: string; group: string; ai: boolean; p: Vec3; pr: Projected }

const SHORT: Record<string, string> = {
  'Domain Knowledge Graphs': 'Knowledge Graphs',
  'Document Intelligence': 'Doc AI',
  'Prompt Engineering': 'Prompting',
  'Source Validation': 'Validation',
}

/** Draggable 3D sphere of skills. AI skills glow in the accent colour. */
export function SkillGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hover, setHover] = useState<{ text: string; group: string } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const all = Object.entries(skills).flatMap(([group, list]) => list.map((text) => ({ text: SHORT[text] ?? text, group })))
    // Interleave groups so neighbours on the sphere differ.
    all.sort((a, b) => ((a.text.length * 7) % 11) - ((b.text.length * 7) % 11))
    const golden = Math.PI * (3 - Math.sqrt(5))
    const words: Word[] = all.map((s, i) => {
      const y = 1 - (i / (all.length - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      return {
        ...s,
        ai: s.group === 'AI / GenAI',
        p: { x: Math.cos(golden * i) * r, y, z: Math.sin(golden * i) * r },
        pr: { sx: 0, sy: 0, scale: 1, depth: 0 },
      }
    })
    const orbit = createOrbit(canvas, { rotX: -0.2, rotY: 0, autoSpin: 0.0022, minX: -1.2, maxX: 1.2 })
    let { w, h } = fitCanvas(canvas, ctx)
    let colors = readGraphColors(canvas)
    const mouse = { x: -1, y: -1, in: false }
    let hovered: Word | null = null
    let raf = 0
    let visible = false
    let last = 0

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      if (!visible) return
      const dt = Math.min(48, t - (last || t))
      last = t
      orbit.step(dt)
      ctx.clearRect(0, 0, w, h)
      const R = Math.min(w, h) * 0.33
      for (const wd of words) project(wd.p, orbit.rotX, orbit.rotY, w / 2, h / 2, R, wd.pr, 3.4)

      // faint wireframe so it reads as a sphere
      ctx.strokeStyle = `rgb(${colors.fg} / 0.07)`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(w / 2, h / 2, R * 1.08, 0, Math.PI * 2)
      ctx.stroke()

      let next: Word | null = null
      let bestD = 22
      for (const wd of words) {
        const d = Math.hypot(wd.pr.sx - mouse.x, wd.pr.sy - mouse.y)
        if (mouse.in && !orbit.dragging && wd.pr.depth > 0.45 && d < bestD + wd.text.length * 2.5) {
          bestD = d
          next = wd
        }
      }
      if (next !== hovered) {
        hovered = next
        setHover(next ? { text: next.text, group: next.group } : null)
      }

      const order = [...words].sort((a, b) => a.pr.depth - b.pr.depth)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (const wd of order) {
        const { sx, sy, depth, scale } = wd.pr
        const isHover = wd === hovered
        const sameGroup = hovered && hovered.group === wd.group
        const size = (10 + depth * 6) * scale * (isHover ? 1.2 : 1)
        ctx.font = `${wd.ai || isHover ? 600 : 500} ${size.toFixed(1)}px "Geist", ui-sans-serif, sans-serif`
        const a = 0.12 + depth * 0.88
        ctx.fillStyle =
          isHover || sameGroup ? `rgb(${colors.accent} / ${Math.max(a, 0.6)})` : wd.ai ? `rgb(${colors.accent} / ${a * 0.95})` : `rgb(${colors.fg} / ${a * (hovered ? 0.5 : 0.85)})`
        ctx.fillText(wd.text, sx, sy)
      }
    }

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
      mouse.in = true
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
    <div className="relative aspect-square w-full">
      <div className="pointer-events-none absolute inset-[18%] rounded-full bg-[radial-gradient(circle,var(--glow),transparent_70%)] blur-2xl" />
      <canvas ref={canvasRef} className="relative block h-full w-full" role="img" aria-label="Interactive 3D globe of skills" />
      <div className="pointer-events-none absolute inset-x-0 bottom-2 text-center font-mono text-[11px] text-muted">
        {hover ? (
          <>
            <span className="text-accent-ink">{hover.group}</span> · {hover.text}
          </>
        ) : (
          'drag to spin'
        )}
      </div>
    </div>
  )
}
