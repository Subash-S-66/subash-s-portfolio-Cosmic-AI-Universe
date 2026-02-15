import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { personalInfo } from '../data/personal'

/* ═══════════════════════════════════════════════════════════════
 *  AI BOOT-UP SEQUENCE LOADER
 *  Neural particles form from darkness, energy connects,
 *  central AI core forms — then transitions into the mind.
 * ═══════════════════════════════════════════════════════════════ */

function NeuralBootCanvas({ progress }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf, dead = false

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio
      canvas.height = window.innerHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    // Particles that form the neural network
    const particles = Array.from({ length: 120 }, (_, i) => {
      const angle = Math.random() * Math.PI * 2
      const dist = 80 + Math.random() * 400
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      return {
        startX: cx + Math.cos(angle) * dist,
        startY: cy + Math.sin(angle) * dist,
        targetX: cx + (Math.random() - 0.5) * 600,
        targetY: cy + (Math.random() - 0.5) * 400,
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        size: 1 + Math.random() * 2,
        color: ['#8b5cf6', '#3b82f6', '#06b6d4', '#a855f7', '#60a5fa'][Math.floor(Math.random() * 5)],
        alpha: 0,
        speed: 0.3 + Math.random() * 0.7,
        pulse: Math.random() * Math.PI * 2,
        delay: Math.random() * 0.5,
      }
    })

    // Core ring particles
    const coreParticles = Array.from({ length: 40 }, (_, i) => {
      const angle = (i / 40) * Math.PI * 2
      const r = 60 + Math.random() * 20
      return {
        angle,
        radius: r,
        size: 1 + Math.random() * 1.5,
        speed: 0.2 + Math.random() * 0.3,
        pulse: Math.random() * Math.PI * 2,
      }
    })

    const draw = () => {
      if (dead) return
      const w = window.innerWidth
      const h = window.innerHeight
      const cx = w / 2
      const cy = h / 2
      const p = progress / 100

      ctx.clearRect(0, 0, w, h)

      // Background void with subtle nebula
      ctx.fillStyle = '#060b18'
      ctx.fillRect(0, 0, w, h)

      // Nebula glow (appears with progress)
      if (p > 0.1) {
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 300 * p)
        gradient.addColorStop(0, `rgba(139, 92, 246, ${0.08 * p})`)
        gradient.addColorStop(0.5, `rgba(59, 130, 246, ${0.04 * p})`)
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, w, h)
      }

      // Draw particles converging
      const time = Date.now() * 0.001
      particles.forEach((pt) => {
        const effectiveP = Math.max(0, Math.min(1, (p - pt.delay) / (1 - pt.delay)))
        pt.x = pt.startX + (pt.targetX - pt.startX) * effectiveP
        pt.y = pt.startY + (pt.targetY - pt.startY) * effectiveP
        pt.alpha = Math.min(1, effectiveP * 2)
        pt.pulse += 0.03

        const pulseScale = 1 + Math.sin(pt.pulse) * 0.3
        const alpha = pt.alpha * (0.3 + Math.sin(pt.pulse) * 0.2)

        // Particle glow
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, pt.size * pulseScale * 3, 0, Math.PI * 2)
        ctx.fillStyle = pt.color.replace(')', `, ${alpha * 0.2})`)
          .replace('rgb', 'rgba')
          .replace('#', '')
        const c = hexToRgb(pt.color)
        ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha * 0.15})`
        ctx.fill()

        // Particle core
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, pt.size * pulseScale, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`
        ctx.fill()

        // Neural connections
        if (effectiveP > 0.3) {
          particles.forEach((pt2) => {
            const dx = pt.x - pt2.x
            const dy = pt.y - pt2.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 120 && dist > 5) {
              const lineAlpha = (1 - dist / 120) * effectiveP * 0.15
              ctx.beginPath()
              ctx.moveTo(pt.x, pt.y)
              ctx.lineTo(pt2.x, pt2.y)
              ctx.strokeStyle = `rgba(139, 92, 246, ${lineAlpha})`
              ctx.lineWidth = 0.5
              ctx.stroke()
            }
          })
        }
      })

      // Central AI core ring (appears after 40%)
      if (p > 0.4) {
        const coreAlpha = Math.min(1, (p - 0.4) * 3)

        // Outer ring
        ctx.beginPath()
        ctx.arc(cx, cy, 80 * coreAlpha, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(139, 92, 246, ${coreAlpha * 0.3})`
        ctx.lineWidth = 1
        ctx.stroke()

        // Inner ring
        ctx.beginPath()
        ctx.arc(cx, cy, 50 * coreAlpha, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(59, 130, 246, ${coreAlpha * 0.25})`
        ctx.lineWidth = 0.5
        ctx.stroke()

        // Core glow
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60 * coreAlpha)
        coreGrad.addColorStop(0, `rgba(139, 92, 246, ${coreAlpha * 0.2})`)
        coreGrad.addColorStop(0.5, `rgba(59, 130, 246, ${coreAlpha * 0.08})`)
        coreGrad.addColorStop(1, 'transparent')
        ctx.fillStyle = coreGrad
        ctx.fillRect(cx - 100, cy - 100, 200, 200)

        // Orbiting core particles
        coreParticles.forEach((cp) => {
          cp.angle += cp.speed * 0.02
          cp.pulse += 0.04
          const px = cx + Math.cos(cp.angle) * cp.radius * coreAlpha
          const py = cy + Math.sin(cp.angle) * cp.radius * coreAlpha
          const cpAlpha = coreAlpha * (0.4 + Math.sin(cp.pulse) * 0.3)

          ctx.beginPath()
          ctx.arc(px, py, cp.size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(139, 92, 246, ${cpAlpha})`
          ctx.fill()
        })
      }

      // Energy pulse waves (after 70%)
      if (p > 0.7) {
        const waveAlpha = (p - 0.7) * 2
        for (let i = 0; i < 3; i++) {
          const waveR = (30 + ((time * 30 + i * 50) % 200)) * waveAlpha
          ctx.beginPath()
          ctx.arc(cx, cy, waveR, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(139, 92, 246, ${Math.max(0, 0.15 - waveR * 0.001)})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }

      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      dead = true
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [progress])

  return <canvas ref={canvasRef} className="absolute inset-0" style={{ width: '100%', height: '100%' }} />
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 139, g: 92, b: 246 }
}

/* ───── Matrix Rain Background ───── */
function MatrixRain({ active }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!active || !containerRef.current) return
    const container = containerRef.current
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01'
    const columns = Math.floor(window.innerWidth / 20)
    const elements = []

    for (let i = 0; i < columns; i++) {
      const el = document.createElement('div')
      el.style.cssText = `
        position: absolute; left: ${i * 20 + Math.random() * 10}px; top: -20px;
        font-family: 'JetBrains Mono', monospace; font-size: 12px;
        color: rgba(139,92,246,0.15); writing-mode: vertical-lr;
        animation: matrix-fall ${3 + Math.random() * 5}s linear ${Math.random() * 4}s infinite;
        user-select: none; pointer-events: none;
      `
      // Generate random character string
      let text = ''
      const length = 5 + Math.floor(Math.random() * 15)
      for (let j = 0; j < length; j++) {
        text += chars[Math.floor(Math.random() * chars.length)]
      }
      el.textContent = text
      container.appendChild(el)
      elements.push(el)
    }

    return () => {
      elements.forEach(el => el.remove())
    }
  }, [active])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  )
}

const Loader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState('boot') // boot, forming, awakening, ready
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    let frame = 0
    const totalFrames = 180 // ~3 seconds at 60fps
    let currentPhase = 'boot'
    let rafId

    const tick = () => {
      frame++
      const rawProgress = (frame / totalFrames) * 100

      // Non-linear progress for dramatic effect
      let displayProgress
      if (rawProgress < 30) {
        displayProgress = rawProgress * 0.8 // slow start
      } else if (rawProgress < 70) {
        displayProgress = 24 + (rawProgress - 30) * 1.2 // accelerate
      } else {
        displayProgress = 72 + (rawProgress - 70) * 0.95 // ease to end
      }

      displayProgress = Math.min(100, displayProgress)
      setProgress(displayProgress)

      // Phase changes
      if (displayProgress > 20 && currentPhase === 'boot') { currentPhase = 'forming'; setPhase('forming') }
      if (displayProgress > 60 && currentPhase === 'forming') { currentPhase = 'awakening'; setPhase('awakening') }
      if (displayProgress >= 98 && currentPhase === 'awakening') { currentPhase = 'ready'; setPhase('ready') }

      if (frame < totalFrames) {
        rafId = requestAnimationFrame(tick)
      } else {
        setProgress(100)
        setTimeout(() => onCompleteRef.current(), 600)
      }
    }

    const timer = setTimeout(() => { rafId = requestAnimationFrame(tick) }, 300)
    return () => { clearTimeout(timer); cancelAnimationFrame(rafId) }
  }, []) // runs once only

  const phaseLabels = {
    boot: 'INITIALIZING NEURAL CORE',
    forming: 'FORMING CONSCIOUSNESS',
    awakening: 'AI SYSTEMS AWAKENING',
    ready: 'ENTERING UNIVERSE',
  }

  return (
    <motion.div
      className="loader-container"
      exit={{ opacity: 0, scale: 1.15, filter: 'blur(30px) brightness(2)' }}
      transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Neural boot canvas */}
      <NeuralBootCanvas progress={progress} />

      {/* Matrix rain */}
      <MatrixRain active={progress > 5} />

      {/* Scan lines */}
      <div className="loader-scanlines" />

      {/* Glitching horizontal data streams */}
      {progress > 20 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[20, 35, 55, 75, 88].map((top, i) => (
            <div
              key={i}
              className="data-stream-bar"
              style={{
                top: `${top}%`,
                width: `${30 + Math.random() * 40}%`,
                left: `${Math.random() * 30}%`,
                animationDelay: `${i * 0.6}s`,
                animationDuration: `${2 + i * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Energy bars */}
      <div className="loader-bars">
        {[15, 30, 50, 70, 85].map((top, i) => (
          <motion.div
            key={i}
            className="loader-bar"
            style={{ top: `${top}%` }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: progress > i * 15 ? 1 : 0, opacity: progress > i * 15 ? 0.4 : 0 }}
            transition={{ duration: 1.5, delay: i * 0.2 }}
          />
        ))}
      </div>

      {/* Progress counter */}
      <div className="loader-counter">
        <motion.span className="loader-counter-number">
          {String(Math.round(progress)).padStart(3, '0')}
        </motion.span>
        <span className="loader-counter-percent">%</span>
      </div>

      {/* Center content */}
      <div className="loader-center">
        {/* AI Core icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: progress > 30 ? 1 : 0, opacity: progress > 30 ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="mb-6 flex justify-center"
        >
          <div className="w-16 h-16 rounded-full border border-[#8b5cf6]/30 flex items-center justify-center animate-ai-core-pulse">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8b5cf6]/40 to-[#3b82f6]/30 animate-cosmic-breathe" />
          </div>
        </motion.div>

        {/* Name */}
        <motion.h1
          className="loader-name"
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={{
            opacity: progress > 10 ? 1 : 0,
            y: progress > 10 ? 0 : 30,
            filter: progress > 10 ? 'blur(0px)' : 'blur(10px)',
          }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {personalInfo.name.split(' ').map((word, i) => (
            <span key={i} className={i > 0 ? 'loader-name-accent' : ''}>
              {i > 0 ? ' ' : ''}{word}
            </span>
          ))}
        </motion.h1>

        {/* Phase label */}
        <motion.p
          className="loader-tagline"
          initial={{ opacity: 0 }}
          animate={{ opacity: progress > 15 ? 1 : 0 }}
          transition={{ duration: 0.8 }}
        >
          {phaseLabels[phase]}
        </motion.p>

        {/* System status readout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: progress > 40 ? 0.6 : 0 }}
          className="mt-6 flex items-center justify-center gap-4 text-[10px] font-mono uppercase tracking-[0.2em]"
        >
          <span className="text-[#8b5cf6]/50">Neural: Active</span>
          <span className="text-[#3b82f6]/40">Core: Online</span>
          <span className="text-[#06b6d4]/40">Depth: ∞</span>
        </motion.div>
      </div>

      {/* Progress bar at bottom */}
      <div className="loader-progress-track">
        <div className="loader-progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </motion.div>
  )
}

export default Loader
