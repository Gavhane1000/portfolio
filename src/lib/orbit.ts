/**
 * Tiny 3D helpers shared by the canvas scenes: drag-to-rotate with inertia,
 * and perspective projection of points into screen space.
 */

export type Vec3 = { x: number; y: number; z: number }
export type Projected = { sx: number; sy: number; scale: number; depth: number }

export type Orbit = {
  rotX: number
  rotY: number
  dragging: boolean
  /** true once the user has interacted; scenes can drop their "drag me" hint */
  touched: boolean
  step: (dt: number) => void
  dispose: () => void
}

export function createOrbit(
  el: HTMLElement,
  { rotX = -0.3, rotY = 0.5, autoSpin = 0.0012, minX = -1.1, maxX = 0.6 } = {},
): Orbit {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let velX = 0
  let velY = 0
  let lastX = 0
  let lastY = 0
  let pointerId = -1

  const orbit: Orbit = {
    rotX,
    rotY,
    dragging: false,
    touched: false,
    step(dt) {
      const f = dt / 16
      if (!orbit.dragging) {
        orbit.rotY += velY * f
        orbit.rotX += velX * f
        velY *= Math.pow(0.94, f)
        velX *= Math.pow(0.9, f)
        if (!reduced) orbit.rotY += autoSpin * f
        // ease pitch back toward the resting angle
        orbit.rotX += (rotX - orbit.rotX) * 0.01 * f
      }
      orbit.rotX = Math.max(minX, Math.min(maxX, orbit.rotX))
    },
    dispose() {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    },
  }

  const down = (e: PointerEvent) => {
    pointerId = e.pointerId
    orbit.dragging = true
    orbit.touched = true
    lastX = e.clientX
    lastY = e.clientY
    velX = velY = 0
    el.style.cursor = 'grabbing'
  }
  const move = (e: PointerEvent) => {
    if (!orbit.dragging || e.pointerId !== pointerId) return
    const dx = e.clientX - lastX
    const dy = e.clientY - lastY
    lastX = e.clientX
    lastY = e.clientY
    velY = dx * 0.006
    // On touch, vertical drags should keep scrolling the page.
    velX = e.pointerType === 'touch' ? 0 : dy * 0.004
    orbit.rotY += velY
    orbit.rotX += velX
  }
  const up = (e: PointerEvent) => {
    if (e.pointerId !== pointerId) return
    orbit.dragging = false
    el.style.cursor = 'grab'
  }

  el.style.cursor = 'grab'
  el.style.touchAction = 'pan-y'
  el.addEventListener('pointerdown', down)
  window.addEventListener('pointermove', move, { passive: true })
  window.addEventListener('pointerup', up)
  window.addEventListener('pointercancel', up)
  return orbit
}

/** Rotates p by (rotX, rotY) and projects to screen. Writes into `out` to avoid per-frame allocation. */
export function project(p: Vec3, rotX: number, rotY: number, cx: number, cy: number, size: number, out: Projected, camera = 3) {
  const cosY = Math.cos(rotY), sinY = Math.sin(rotY)
  const cosX = Math.cos(rotX), sinX = Math.sin(rotX)
  const x1 = p.x * cosY - p.z * sinY
  const z1 = p.x * sinY + p.z * cosY
  const y1 = p.y * cosX - z1 * sinX
  const z2 = p.y * sinX + z1 * cosX
  const persp = camera / (camera + z2)
  out.sx = cx + x1 * size * persp
  out.sy = cy + y1 * size * persp
  out.scale = persp
  out.depth = Math.max(0, Math.min(1, (1 - z2 / 1.4) / 2))
  return out
}

/** Sets up a HiDPI canvas sized to its CSS box. Returns the CSS size. */
export function fitCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const rect = canvas.getBoundingClientRect()
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return { w: rect.width, h: rect.height }
}

/** Reads canvas colours from the element itself so nested theme bands resolve correctly. */
export function readGraphColors(el: Element = document.documentElement) {
  const cs = getComputedStyle(el)
  return {
    node: cs.getPropertyValue('--graph-node').trim() || '198 255 61',
    glow: cs.getPropertyValue('--graph-glow').trim() || '198 255 61',
    accent: cs.getPropertyValue('--graph-accent').trim() || '198 255 61',
    fg: cs.getPropertyValue('--graph-fg').trim() || '237 239 234',
  }
}
