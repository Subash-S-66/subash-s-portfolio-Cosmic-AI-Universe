import React, { useState, useEffect, useRef, useCallback } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  CUSTOM CURSOR — Cosmic Energy Orb + Particle Trail
 *  Ring + dot cursor with responsive hover states,
 *  glow on interactive elements, energy particle trail,
 *  magnetic pull effect, ripple on click.
 * ═══════════════════════════════════════════════════════════════ */

const TRAIL_LENGTH = 8
const PARTICLE_POOL_SIZE = 30

const CustomCursor = () => {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const trailCanvasRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [clicking, setClicking] = useState(false)
  const pos = useRef({ x: 0, y: 0 })
  const prevPos = useRef({ x: 0, y: 0 })
  const dotPos = useRef({ x: 0, y: 0 })
  const ringPos = useRef({ x: 0, y: 0 })
  const rafRef = useRef(null)
  const trailPoints = useRef([])
  const particles = useRef([])
  const frameCount = useRef(0)

  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return

    // Setup trail canvas
    const canvas = trailCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const handleMove = (e) => {
      prevPos.current = { ...pos.current }
      pos.current = { x: e.clientX, y: e.clientY }
      if (!visible) setVisible(true)

      // Spawn trail particles based on velocity
      const dx = pos.current.x - prevPos.current.x
      const dy = pos.current.y - prevPos.current.y
      const vel = Math.sqrt(dx * dx + dy * dy)
      if (vel > 3 && particles.current.length < PARTICLE_POOL_SIZE) {
        const count = Math.min(3, Math.floor(vel / 8))
        for (let i = 0; i < count; i++) {
          particles.current.push({
            x: pos.current.x + (Math.random() - 0.5) * 10,
            y: pos.current.y + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 2 - dx * 0.05,
            vy: (Math.random() - 0.5) * 2 - dy * 0.05,
            life: 1,
            decay: 0.02 + Math.random() * 0.03,
            size: 1.5 + Math.random() * 2.5,
            hue: Math.random() > 0.5 ? 250 : 220, // violet or blue
          })
        }
      }
    }

    const handleEnter = () => setVisible(true)
    const handleLeave = () => setVisible(false)
    const handleDown = () => {
      setClicking(true)
      // Burst particles on click
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12
        const speed = 2 + Math.random() * 3
        particles.current.push({
          x: pos.current.x,
          y: pos.current.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.025 + Math.random() * 0.015,
          size: 2 + Math.random() * 3,
          hue: Math.random() > 0.3 ? 250 : 200,
        })
      }
    }
    const handleUp = () => setClicking(false)

    window.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseenter', handleEnter)
    document.addEventListener('mouseleave', handleLeave)
    window.addEventListener('mousedown', handleDown)
    window.addEventListener('mouseup', handleUp)

    const handleOverInteractive = () => setHovering(true)
    const handleOutInteractive = () => setHovering(false)

    const interactiveSelectors = 'a, button, input, textarea, select, [role="button"], [data-cursor-hover]'
    const observer = new MutationObserver(() => {
      document.querySelectorAll(interactiveSelectors).forEach(el => {
        el.removeEventListener('mouseenter', handleOverInteractive)
        el.removeEventListener('mouseleave', handleOutInteractive)
        el.addEventListener('mouseenter', handleOverInteractive)
        el.addEventListener('mouseleave', handleOutInteractive)
      })
    })
    observer.observe(document.body, { childList: true, subtree: true })

    document.querySelectorAll(interactiveSelectors).forEach(el => {
      el.addEventListener('mouseenter', handleOverInteractive)
      el.addEventListener('mouseleave', handleOutInteractive)
    })

    const animate = () => {
      frameCount.current++
      const dotSpeed = 0.35
      const ringSpeed = 0.12

      dotPos.current.x += (pos.current.x - dotPos.current.x) * dotSpeed
      dotPos.current.y += (pos.current.y - dotPos.current.y) * dotSpeed
      ringPos.current.x += (pos.current.x - ringPos.current.x) * ringSpeed
      ringPos.current.y += (pos.current.y - ringPos.current.y) * ringSpeed

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${dotPos.current.x}px, ${dotPos.current.y}px) translate(-50%, -50%)`
      }
      if (ringRef.current) {
        const rot = frameCount.current * 0.5
        ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px) translate(-50%, -50%) rotate(${rot}deg)`
      }

      // Update trail
      trailPoints.current.unshift({ x: dotPos.current.x, y: dotPos.current.y })
      if (trailPoints.current.length > TRAIL_LENGTH) trailPoints.current.pop()

      // Draw trail + particles on canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw energy trail
      if (trailPoints.current.length > 2) {
        ctx.beginPath()
        ctx.moveTo(trailPoints.current[0].x, trailPoints.current[0].y)
        for (let i = 1; i < trailPoints.current.length; i++) {
          const p = trailPoints.current[i]
          const pp = trailPoints.current[i - 1]
          const mx = (pp.x + p.x) / 2
          const my = (pp.y + p.y) / 2
          ctx.quadraticCurveTo(pp.x, pp.y, mx, my)
        }
        const grad = ctx.createLinearGradient(
          trailPoints.current[0].x, trailPoints.current[0].y,
          trailPoints.current[trailPoints.current.length - 1].x,
          trailPoints.current[trailPoints.current.length - 1].y
        )
        grad.addColorStop(0, 'rgba(139,92,246,0.35)')
        grad.addColorStop(0.5, 'rgba(59,130,246,0.2)')
        grad.addColorStop(1, 'rgba(139,92,246,0)')
        ctx.strokeStyle = grad
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.stroke()
      }

      // Update & draw particles
      particles.current = particles.current.filter(p => {
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.96
        p.vy *= 0.96
        p.life -= p.decay
        if (p.life <= 0) return false

        const alpha = p.life * 0.6
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2)
        glow.addColorStop(0, `hsla(${p.hue}, 80%, 70%, ${alpha})`)
        glow.addColorStop(1, `hsla(${p.hue}, 80%, 70%, 0)`)
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = `hsla(${p.hue}, 80%, 80%, ${alpha})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
        ctx.fill()

        return true
      })

      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseenter', handleEnter)
      document.removeEventListener('mouseleave', handleLeave)
      window.removeEventListener('mousedown', handleDown)
      window.removeEventListener('mouseup', handleUp)
      window.removeEventListener('resize', resize)
      observer.disconnect()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [visible])

  if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]" style={{ cursor: 'none' }}>
      {/* Trail Canvas */}
      <canvas
        ref={trailCanvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 99997 }}
      />
      {/* Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 will-change-transform transition-[width,height,opacity] duration-200"
        style={{
          width: clicking ? '4px' : hovering ? '10px' : '6px',
          height: clicking ? '4px' : hovering ? '10px' : '6px',
          borderRadius: '50%',
          backgroundColor: hovering ? '#8b5cf6' : '#ffffff',
          opacity: visible ? (hovering ? 1 : 0.8) : 0,
          boxShadow: hovering
            ? '0 0 20px rgba(139,92,246,0.8), 0 0 40px rgba(139,92,246,0.4), 0 0 60px rgba(59,130,246,0.2)'
            : '0 0 8px rgba(139,92,246,0.4)',
          zIndex: 99999,
        }}
      />
      {/* Ring — now with dashed border for rotation visibility */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 will-change-transform transition-[width,height,border-color,opacity] duration-300"
        style={{
          width: hovering ? '52px' : clicking ? '28px' : '36px',
          height: hovering ? '52px' : clicking ? '28px' : '36px',
          borderRadius: '50%',
          border: `1px ${hovering ? 'solid' : 'dashed'} ${hovering ? 'rgba(139,92,246,0.6)' : 'rgba(255,255,255,0.15)'}`,
          opacity: visible ? (hovering ? 0.9 : 0.4) : 0,
          boxShadow: hovering
            ? '0 0 25px rgba(139,92,246,0.2), inset 0 0 15px rgba(139,92,246,0.1)'
            : 'none',
          zIndex: 99999,
        }}
      />
    </div>
  )
}

export default CustomCursor
