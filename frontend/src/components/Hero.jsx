import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { personalInfo, socialLinks } from '../data/personal'
import HeroScene from './HeroScene'

/* ═══════════════════════════════════════════════════════════════
 *  HERO — AI Core Landing
 *  Floating typography, HUD readouts, energy CTA buttons,
 *  role cycling, cosmic parallax, social nodes.
 * ═══════════════════════════════════════════════════════════════ */

/* ───── Text Scramble Hook ───── */
function useTextScramble(text, trigger = true, speed = 30) {
  const [display, setDisplay] = useState('')
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*<>{}[]~'

  useEffect(() => {
    if (!trigger) { setDisplay(''); return }
    let frame = 0
    const length = text.length
    const interval = setInterval(() => {
      const scrambled = text.split('').map((char, i) => {
        if (char === ' ') return ' '
        return i < frame ? char : chars[Math.floor(Math.random() * chars.length)]
      }).join('')
      setDisplay(scrambled)
      frame++
      if (frame > length) clearInterval(interval)
    }, speed)
    return () => clearInterval(interval)
  }, [text, trigger, speed])

  return display
}

/* ───── Typing Effect Hook ───── */
function useTypingEffect(texts, typingSpeed = 80, pauseDuration = 2200) {
  const [displayText, setDisplayText] = useState('')
  const [textIndex, setTextIndex] = useState(0)
  const [phase, setPhase] = useState('typing')

  useEffect(() => {
    const currentText = texts[textIndex]
    let timeout

    if (phase === 'typing') {
      if (displayText.length < currentText.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentText.slice(0, displayText.length + 1))
        }, typingSpeed)
      } else {
        timeout = setTimeout(() => setPhase('pausing'), pauseDuration)
      }
    } else if (phase === 'pausing') {
      timeout = setTimeout(() => setPhase('deleting'), 300)
    } else if (phase === 'deleting') {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1))
        }, typingSpeed / 2)
      } else {
        setTextIndex((textIndex + 1) % texts.length)
        setPhase('typing')
      }
    }

    return () => clearTimeout(timeout)
  }, [displayText, phase, textIndex, texts, typingSpeed, pauseDuration])

  return displayText
}

/* ───── HUD Data Display ───── */
function HUDElement({ label, value, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay + 1.2, duration: 0.6 }}
      className="flex items-center gap-2 text-xs font-mono tracking-wider"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-cosmic-blue animate-pulse" />
      <span className="text-white/55 uppercase">{label}</span>
      <span className="text-cosmic-blue">{value}</span>
    </motion.div>
  )
}

/* ───── Magnetic Button ───── */
function MagneticButton({ children, className = '', href, onClick }) {
  const btnRef = useRef(null)

  const handleMouseMove = useCallback((e) => {
    const btn = btnRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    gsap.to(btn, { x: x * 0.25, y: y * 0.25, duration: 0.3, ease: 'power2.out' })
  }, [])

  const handleMouseLeave = useCallback(() => {
    gsap.to(btnRef.current, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' })
  }, [])

  const Tag = href ? 'a' : 'button'
  const props = href ? { href, target: '_blank', rel: 'noopener noreferrer' } : { onClick }

  return (
    <Tag
      ref={btnRef}
      {...props}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </Tag>
  )
}

/* ───── Social Icon ───── */
function getSocialIcon(label) {
  const lower = label.toLowerCase()
  if (lower === 'github') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
  )
  if (lower === 'linkedin') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
  )
  if (lower === 'instagram') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
  )
  return <span className="text-xs font-mono">{label[0]}</span>
}

/* ───── Floating Holographic Panel ───── */
function HoloPanel({ children, className = '', delay = 0, x = 0, y = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: x * 0.5, y: y * 0.5 }}
      animate={{ opacity: 1, scale: 1, x, y }}
      transition={{ delay: delay + 2.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className={`absolute pointer-events-none ${className}`}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5 + Math.random() * 2, repeat: Infinity, ease: 'easeInOut' }}
        className="px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm"
      >
        <div className="text-[9px] font-mono text-white/45 tracking-widest uppercase">
          {children}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ───── Animated Warp Lines (behind hero content) ───── */
function WarpLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="warp-line"
          style={{
            left: `${5 + i * 6.5}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  )
}

/* ═══════════ MAIN HERO COMPONENT ═══════════ */
const Hero = () => {
  const sectionRef = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const nameText = useTextScramble(personalInfo.name, true, 40)
  const roleText = useTypingEffect(personalInfo.roles || ['Full-Stack Developer'])

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 400)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleMouse = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      })
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* 3D Background */}
      <HeroScene />

      {/* Warp speed lines */}
      <WarpLines />

      {/* Background glow effects — now dual-color */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-10 blur-[120px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
          left: `calc(50% + ${mousePos.x * 30}px)`,
          top: `calc(50% + ${mousePos.y * 30}px)`,
          transform: 'translate(-50%, -50%)',
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-8 blur-[100px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
          left: `calc(40% - ${mousePos.x * 20}px)`,
          top: `calc(60% - ${mousePos.y * 20}px)`,
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Floating Holographic Panels */}
      <HoloPanel delay={0} x={-40} y={-20} className="top-[18%] left-[8%] hidden lg:block">
        Neural Core v4.2 // Active
      </HoloPanel>
      <HoloPanel delay={0.3} x={30} y={10} className="top-[22%] right-[10%] hidden lg:block">
        Quantum State // Coherent
      </HoloPanel>
      <HoloPanel delay={0.6} x={-20} y={15} className="bottom-[25%] left-[12%] hidden lg:block">
        Signal Strength // 98.7%
      </HoloPanel>
      <HoloPanel delay={0.9} x={25} y={-10} className="bottom-[20%] right-[8%] hidden lg:block">
        Dimension // Primary
      </HoloPanel>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* HUD Top */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : -20 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex items-center justify-center gap-6 mb-8"
        >
          <HUDElement label="Status" value="Online" delay={0} />
          <div className="w-px h-4 bg-white/10" />
          <HUDElement label="System" value="Active" delay={0.15} />
          <div className="w-px h-4 bg-white/10" />
          <HUDElement label="Mode" value="Creative" delay={0.3} />
        </motion.div>

        {/* Name */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: loaded ? 1 : 0, scale: loaded ? 1 : 0.8 }}
          transition={{ delay: 0.8, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight mb-4 leading-none text-neon-glow">
            <span className="text-gradient-cosmic cyber-glitch" data-text={nameText}>{nameText}</span>
          </h1>
        </motion.div>

        {/* Divider line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: loaded ? 1 : 0 }}
          transition={{ delay: 1.5, duration: 1, ease: 'easeInOut' }}
          className="w-32 h-px bg-gradient-to-r from-transparent via-cosmic-violet to-transparent mx-auto mb-6"
        />

        {/* Title / Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <p className="text-lg md:text-xl text-white/65 font-light tracking-widest uppercase mb-2">
            {personalInfo.title}
          </p>
        </motion.div>

        {/* Typing role */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="h-8 mb-8"
        >
          <span className="text-cosmic-blue font-mono text-sm md:text-base tracking-wider">
            &lt; {roleText}
            <span className="animate-pulse text-cosmic-violet">|</span> /&gt;
          </span>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="text-base md:text-lg text-white/70 max-w-xl mx-auto mb-10 leading-relaxed"
        >
          {personalInfo.tagline}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="flex items-center justify-center gap-4 flex-wrap mb-12"
        >
          <MagneticButton
            href="#projects"
            className="group relative px-7 py-3 rounded-full overflow-hidden border border-cosmic-violet/30 bg-cosmic-violet/10 text-white text-sm font-medium tracking-wider transition-all hover:border-cosmic-violet/60 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              <span>View Projects</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-cosmic-violet/20 to-cosmic-blue/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </MagneticButton>

          <MagneticButton
            href={personalInfo.resumeUrl}
            className="group relative px-7 py-3 rounded-full overflow-hidden border border-white/10 text-white/70 text-sm font-medium tracking-wider transition-all hover:border-white/30 hover:text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-y-0.5 transition-transform">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              <span>Resume</span>
            </span>
          </MagneticButton>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ delay: 2.2, duration: 0.8 }}
          className="flex items-center justify-center gap-4"
        >
          {socialLinks.map((link, i) => (
            <motion.a
              key={link.label}
              href={link.url || link.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.4 + i * 0.1, duration: 0.5 }}
              className="group relative w-10 h-10 flex items-center justify-center rounded-full border border-white/10 text-white/65 hover:text-cosmic-violet hover:border-cosmic-violet/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.3),0_0_40px_rgba(139,92,246,0.1)]"
              title={link.label}
            >
              {getSocialIcon(link.label)}
            </motion.a>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator — Enhanced with energy pulse */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 0.5 : 0 }}
        transition={{ delay: 3, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] font-mono tracking-[0.3em] text-white/55 uppercase">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative w-5 h-8 rounded-full border border-white/15 flex justify-center pt-1.5"
        >
          <div className="w-1 h-1.5 rounded-full bg-cosmic-violet/60" />
          {/* Ripple rings */}
          <div className="absolute -inset-3 rounded-full border border-cosmic-violet/10 animate-pulse" />
          <div className="absolute -inset-6 rounded-full border border-cosmic-violet/5 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Hero
