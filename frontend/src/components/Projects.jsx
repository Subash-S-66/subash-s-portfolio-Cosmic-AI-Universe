import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects, downloadApkFiles } from '../data/projects'

gsap.registerPlugin(ScrollTrigger)

/* ═══════════════════════════════════════════════════════════════
 *  PROJECTS — Holographic Memory Archive
 *  3D-tilt holo cards, scan line effects, circuit canvas,
 *  GSAP scroll entrance, tech orbs, glitch text.
 * ═══════════════════════════════════════════════════════════════ */

/* ───── Glitch text hook ───── */
function useGlitchText(text, active) {
  const [display, setDisplay] = useState(text)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*<>[]~_'

  useEffect(() => {
    if (!active) { setDisplay(text); return }
    let frame = 0
    const interval = setInterval(() => {
      setDisplay(text.split('').map((ch, i) =>
        ch === ' ' ? ' ' : (i < frame ? ch : chars[Math.floor(Math.random() * chars.length)])
      ).join(''))
      frame++
      if (frame > text.length) { clearInterval(interval); setDisplay(text) }
    }, 30)
    return () => clearInterval(interval)
  }, [text, active])

  return display
}

/* ───── Circuit Canvas Background ───── */
function CircuitCanvas({ color = '#8b5cf6', containerRef }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef?.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    let raf

    const resize = () => {
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width * (window.devicePixelRatio > 1 ? 2 : 1)
      canvas.height = rect.height * (window.devicePixelRatio > 1 ? 2 : 1)
    }
    resize()

    const lines = Array.from({ length: 12 }, () => ({
      x1: Math.random() * canvas.width,
      y1: Math.random() * canvas.height,
      len: 20 + Math.random() * 60,
      dir: Math.random() > 0.5 ? 'h' : 'v',
      speed: 0.1 + Math.random() * 0.3,
      offset: Math.random() * Math.PI * 2,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const t = performance.now() * 0.001

      lines.forEach(ln => {
        const alpha = (Math.sin(t * ln.speed + ln.offset) * 0.5 + 0.5) * 0.08
        ctx.strokeStyle = color.replace(')', `, ${alpha})`).replace('rgb', 'rgba')
        ctx.lineWidth = 0.5
        ctx.beginPath()
        if (ln.dir === 'h') {
          ctx.moveTo(ln.x1, ln.y1)
          ctx.lineTo(ln.x1 + ln.len, ln.y1)
        } else {
          ctx.moveTo(ln.x1, ln.y1)
          ctx.lineTo(ln.x1, ln.y1 + ln.len)
        }
        ctx.stroke()

        // Junction dot
        ctx.fillStyle = color.replace(')', `, ${alpha * 2})`).replace('rgb', 'rgba')
        ctx.beginPath()
        ctx.arc(ln.x1, ln.y1, 1.5, 0, Math.PI * 2)
        ctx.fill()
      })

      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => cancelAnimationFrame(raf)
  }, [color, containerRef])

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-60" />
  )
}

/* ───── Scan Line Effect ───── */
function ScanLine({ active }) {
  if (!active) return null
  return (
    <motion.div
      initial={{ top: 0 }}
      animate={{ top: '100%' }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cosmic-violet/30 to-transparent pointer-events-none z-20"
    />
  )
}

/* ───── Project Card ───── */
function ProjectCard({ project, index }) {
  const cardRef = useRef(null)
  const [hovered, setHovered] = useState(false)
  const [mouseLocal, setMouseLocal] = useState({ x: 0.5, y: 0.5 })
  const glitchTitle = useGlitchText(project.title, hovered)

  const handleMouseMove = useCallback((e) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    setMouseLocal({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
  }, [])

  const tiltX = (mouseLocal.y - 0.5) * -8
  const tiltY = (mouseLocal.x - 0.5) * 8

  const projectColor = project.color || '#8b5cf6'

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMouseLocal({ x: 0.5, y: 0.5 }) }}
      onMouseMove={handleMouseMove}
      className="group relative"
      style={{
        perspective: '1000px',
      }}
    >
      <motion.div
        animate={{
          rotateX: hovered ? tiltX : 0,
          rotateY: hovered ? tiltY : 0,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm transition-all duration-500 group-hover:border-white/[0.15] group-hover:shadow-[0_0_80px_rgba(139,92,246,0.12),0_0_30px_rgba(59,130,246,0.08)]"
      >
        {/* Holographic shimmer overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.02] to-transparent transition-opacity duration-700 ${hovered ? 'opacity-100' : 'opacity-0'}`} />

        {/* Animated border glow */}
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 rounded-2xl pointer-events-none z-20"
            style={{
              background: `linear-gradient(135deg, ${projectColor}08, transparent 30%, transparent 70%, ${projectColor}05)`,
            }}
          />
        )}

        {/* Circuit background */}
        <CircuitCanvas color={projectColor} containerRef={cardRef} />
        
        {/* Scan line */}
        <ScanLine active={hovered} />

        {/* Cursor spotlight */}
        {hovered && (
          <div
            className="absolute w-48 h-48 rounded-full pointer-events-none z-10 transition-opacity"
            style={{
              background: `radial-gradient(circle, ${projectColor}15, transparent 70%)`,
              left: `${mouseLocal.x * 100}%`,
              top: `${mouseLocal.y * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}

        <div className="relative z-10 p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: projectColor }}
                />
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase"
                  style={{ color: projectColor }}
                >
                  {project.category}
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white/90 tracking-wide transition-all">
                {glitchTitle}
              </h3>
              <p className="text-sm text-white/55 mt-1">{project.subtitle}</p>
            </div>
            <span className="text-xs font-mono text-white/40">
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>

          {/* Date & Role */}
          <div className="flex items-center gap-3 mb-4 text-xs font-mono text-white/50">
            <span>{project.date}</span>
            <span className="w-1 h-1 rounded-full bg-white/15" />
            <span>{project.role}</span>
          </div>

          {/* Description */}
          <p className="text-sm text-white/65 leading-relaxed mb-5">
            {project.description}
          </p>

          {/* Features */}
          <div className="space-y-2 mb-5">
            {project.features.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="flex items-start gap-2 text-xs text-white/60"
              >
                <span className="mt-1 w-1 h-1 rounded-full flex-shrink-0"
                  style={{ backgroundColor: projectColor }}
                />
                {feat}
              </motion.div>
            ))}
          </div>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {project.techStack.map((tech, ti) => (
              <motion.span
                key={tech}
                whileHover={{ scale: 1.1, y: -2 }}
                className="px-2 py-0.5 text-[10px] font-mono rounded-full border border-white/[0.06] bg-white/[0.02] text-white/60 tracking-wider hover:border-white/20 hover:text-white/80 hover:shadow-[0_0_10px_rgba(139,92,246,0.15)] transition-all duration-300"
              >
                {tech}
              </motion.span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {project.liveDemo && (
              <a
                href={project.liveDemo}
                target="_blank"
                rel="noopener noreferrer"
                className="group/btn flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium tracking-wider border transition-all duration-300 hover:shadow-lg"
                style={{
                  borderColor: `${projectColor}30`,
                  color: projectColor,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${projectColor}60`
                  e.currentTarget.style.backgroundColor = `${projectColor}10`
                  e.currentTarget.style.boxShadow = `0 0 25px ${projectColor}20`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${projectColor}30`
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <span>Live Demo</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover/btn:translate-x-0.5 transition-transform">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </a>
            )}

            {project.apkDownloads?.length > 0 && (
              <button
                onClick={() => downloadApkFiles(project.apkDownloads)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium tracking-wider border border-white/10 text-white/60 hover:text-white/80 hover:border-white/20 transition-all duration-300"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                <span>APK</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════ MAIN PROJECTS COMPONENT ═══════════ */
const Projects = () => {
  const sectionRef = useRef(null)

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative py-32 overflow-hidden"
    >
      {/* Background accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent via-cosmic-violet/20 to-transparent" />
      <div className="absolute top-1/3 -right-40 w-80 h-80 bg-cosmic-blue/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 -left-40 w-80 h-80 bg-cosmic-violet/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cosmic-blue/10 border border-cosmic-blue/20 mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cosmic-blue animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-cosmic-blue/80 uppercase">
              Memory Archive
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-gradient-cosmic mb-4"
          >
            Projects
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/55 text-sm max-w-md mx-auto"
          >
            A curated archive of digital creations, each representing a milestone in the journey.
          </motion.p>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="w-24 h-px bg-gradient-to-r from-transparent via-cosmic-blue to-transparent mx-auto mt-6"
          />
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Projects
