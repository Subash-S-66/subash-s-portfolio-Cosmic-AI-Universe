import React, { useRef, useEffect, useState, useMemo } from 'react'
import { motion, useInView } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { personalInfo, stats } from '../data/personal'
import { techOrbit } from '../data/skills'

gsap.registerPlugin(ScrollTrigger)

/* ═══════════════════════════════════════════════════════════════
 *  ABOUT — AI Self-Awareness Module
 *  Neural node network, floating skill nodes, animated stat
 *  counters, cosmic bio reveal, tech orbit ring.
 * ═══════════════════════════════════════════════════════════════ */

/* ───── Neural Network Canvas ───── */
function NeuralCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    let nodes = []
    const nodeCount = 40

    const resize = () => {
      canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1)
      canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1)
    }
    resize()
    window.addEventListener('resize', resize)

    // Init nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: 1.5 + Math.random() * 2,
        pulse: Math.random() * Math.PI * 2,
      })
    }

    const colors = ['139,92,246', '59,130,246', '6,182,212']

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const t = performance.now() * 0.001

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.12
            const ci = colors[i % colors.length]
            ctx.strokeStyle = `rgba(${ci}, ${alpha})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      // Draw & update nodes
      nodes.forEach((n, i) => {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1

        const pulse = Math.sin(t * 1.5 + n.pulse) * 0.5 + 0.5
        const ci = colors[i % colors.length]
        const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 3)
        glow.addColorStop(0, `rgba(${ci}, ${0.4 * pulse})`)
        glow.addColorStop(1, `rgba(${ci}, 0)`)
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r * 3, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = `rgba(${ci}, ${0.5 + pulse * 0.3})`
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fill()
      })

      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
    />
  )
}

/* ───── Stat Counter ───── */
function StatCounter({ stat, index }) {
  const ref = useRef(null)
  const numRef = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const isNumeric = !isNaN(parseFloat(stat.value))

  useEffect(() => {
    if (!inView || !numRef.current) return
    if (!isNumeric) {
      numRef.current.innerText = stat.value
      return
    }
    const target = parseFloat(stat.value)
    gsap.fromTo(
      numRef.current,
      { innerText: 0 },
      {
        innerText: target,
        duration: 2,
        delay: index * 0.15,
        ease: 'power2.out',
        snap: { innerText: stat.value.includes('.') ? 0.1 : 1 },
        onUpdate: function () {
          if (numRef.current) {
            const val = parseFloat(numRef.current.innerText)
            numRef.current.innerText = stat.value.includes('.')
              ? val.toFixed(1)
              : Math.floor(val)
          }
        },
      }
    )
  }, [inView, stat.value, index, isNumeric])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="glass-panel p-5 rounded-xl text-center group hover:border-cosmic-violet/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(139,92,246,0.1)] relative overflow-hidden"
    >
      {/* Shimmer on hover */}
      <div className="absolute inset-0 holo-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="relative z-10">
        <div className="flex items-baseline justify-center gap-1 mb-1">
          <span ref={numRef} className="text-3xl font-bold text-gradient-cosmic">
            {isNumeric ? '0' : stat.value}
          </span>
          <span className="text-sm text-cosmic-blue font-medium">{stat.suffix}</span>
        </div>
        <span className="text-xs text-white/60 uppercase tracking-widest font-mono">
          {stat.label}
        </span>
      </div>
    </motion.div>
  )
}

/* ───── Floating Tech Badge ───── */
function TechBadge({ tech, index, total }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: -10 }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.8 + index * 0.04, type: 'spring', stiffness: 180, damping: 12 }}
      whileHover={{
        scale: 1.15,
        y: -5,
        boxShadow: '0 0 20px rgba(139,92,246,0.2), 0 0 40px rgba(139,92,246,0.05)',
      }}
      className="px-3 py-1.5 rounded-full text-xs font-mono tracking-wider border border-white/8 bg-white/[0.03] text-white/65 hover:text-cosmic-violet hover:border-cosmic-violet/30 transition-colors duration-300 cursor-default"
    >
      {tech}
    </motion.div>
  )
}

/* ═══════════ MAIN ABOUT COMPONENT ═══════════ */
const About = () => {
  const sectionRef = useRef(null)

  useEffect(() => {
    if (!sectionRef.current) return
    const elements = sectionRef.current.querySelectorAll('.gsap-reveal')
    elements.forEach((el, i) => {
      gsap.fromTo(el,
        { opacity: 0, y: 40, filter: 'blur(8px)' },
        {
          opacity: 1, y: 0, filter: 'blur(0px)',
          duration: 0.8,
          delay: i * 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      )
    })

    return () => ScrollTrigger.getAll().forEach(st => st.kill())
  }, [])

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative py-32 overflow-hidden"
    >
      {/* Neural background */}
      <NeuralCanvas />

      {/* Background glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cosmic-violet/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-cosmic-blue/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Morphing background shape */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cosmic-violet/[0.03] morph-shape blur-[80px] pointer-events-none" />

      {/* Floating geometric decorators */}
      <motion.div
        animate={{ y: [-10, 10, -10], rotate: [0, 180, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-20 right-[15%] w-8 h-8 border border-cosmic-violet/10 rounded pointer-events-none hidden lg:block"
      />
      <motion.div
        animate={{ y: [10, -15, 10], rotate: [360, 180, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-32 left-[10%] w-6 h-6 border border-cosmic-blue/10 rounded-full pointer-events-none hidden lg:block"
      />
      <motion.div
        animate={{ y: [-5, 15, -5], x: [-5, 5, -5] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 left-[5%] w-3 h-3 bg-cosmic-cyan/10 rounded-full pointer-events-none hidden lg:block"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cosmic-violet/10 border border-cosmic-violet/20 mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cosmic-violet animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-cosmic-violet/80 uppercase">
              Self-Awareness Module
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-gradient-cosmic mb-4"
          >
            About Me
          </motion.h2>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="w-24 h-px bg-gradient-to-r from-transparent via-cosmic-violet to-transparent mx-auto"
          />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat, i) => (
            <StatCounter key={stat.label} stat={stat} index={i} />
          ))}
        </div>

        {/* Bio */}
        <div className="max-w-3xl mx-auto mb-16">
          {personalInfo.bio.map((paragraph, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.7 }}
              className="text-white/70 text-base md:text-lg leading-relaxed mb-6 last:mb-0"
            >
              {paragraph}
            </motion.p>
          ))}
        </div>

        {/* Tech Orbit */}
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs text-white/50 font-mono tracking-[0.2em] uppercase mb-4"
          >
            Technology Stack
          </motion.p>
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
            {techOrbit.map((tech, i) => (
              <TechBadge key={tech} tech={tech} index={i} total={techOrbit.length} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
