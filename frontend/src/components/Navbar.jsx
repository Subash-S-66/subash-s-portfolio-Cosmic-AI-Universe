import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { personalInfo, navItems } from '../data/personal'

/* ═══════════════════════════════════════════════════════════════
 *  NAVBAR — Cosmic Navigation
 *  Scroll-aware, text scramble hover, holographic progress bar,
 *  section detection, mobile drawer, Lenis integration.
 * ═══════════════════════════════════════════════════════════════ */

function useTextScramble() {
  const [text, setText] = useState('')
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!<>{}[]~'

  const scramble = useCallback((target) => {
    let frame = 0
    const length = target.length
    const interval = setInterval(() => {
      const out = target.split('').map((ch, i) =>
        i < frame ? ch : chars[Math.floor(Math.random() * chars.length)]
      ).join('')
      setText(out)
      frame++
      if (frame > length) clearInterval(interval)
    }, 25)
    return () => clearInterval(interval)
  }, [])

  return { text, scramble, setText }
}

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const navRef = useRef(null)

  /* ── Scroll handling ── */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)

      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(totalHeight > 0 ? window.scrollY / totalHeight : 0)

      // Detect active section
      const sections = navItems.map(item => item.href.replace('#', ''))
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i])
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 150) {
            setActiveSection(sections[i])
            break
          }
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── Navigation click ── */
  const handleNavClick = useCallback((e, href) => {
    e.preventDefault()
    setMobileOpen(false)
    const id = href.replace('#', '')
    const el = document.getElementById(id)
    if (el) {
      const lenis = window.__lenis
      if (lenis) {
        lenis.scrollTo(el, { offset: -80, duration: 1.4 })
      } else {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [])

  return (
    <>
      <motion.nav
        ref={navRef}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-void/60 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, '#home')}
            className="text-lg font-bold tracking-wide text-white/90 hover:text-cosmic-violet transition-colors group"
          >
            <span className="text-gradient-cosmic">{personalInfo.name?.split(' ')[0] || 'Portfolio'}</span>
            <span className="text-white/60 font-light ml-1">.</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const section = item.href.replace('#', '')
              const isActive = activeSection === section
              return (
                <NavLink
                  key={item.label}
                  item={item}
                  isActive={isActive}
                  onClick={handleNavClick}
                />
              )
            })}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 relative z-50"
            aria-label="Toggle menu"
          >
            <motion.span
              animate={mobileOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
              className="w-5 h-px bg-white/70 block origin-center"
            />
            <motion.span
              animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
              className="w-5 h-px bg-white/70 block"
            />
            <motion.span
              animate={mobileOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
              className="w-5 h-px bg-white/70 block origin-center"
            />
          </button>
        </div>

        {/* Scroll Progress */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-transparent">
          <motion.div
            className="h-full bg-gradient-to-r from-cosmic-violet via-cosmic-blue to-cosmic-violet"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div
              className="absolute inset-0 bg-void/90 backdrop-blur-2xl"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 w-72 h-full bg-void-deep/95 border-l border-white/5 flex flex-col items-start justify-center px-8 gap-6"
            >
              {navItems.map((item, i) => {
                const section = item.href.replace('#', '')
                const isActive = activeSection === section
                return (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    className={`text-2xl font-light tracking-wider transition-colors ${
                      isActive ? 'text-cosmic-violet' : 'text-white/70 hover:text-white/90'
                    }`}
                  >
                    {item.label}
                  </motion.a>
                )
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ───── Nav Link with hover scramble ───── */
function NavLink({ item, isActive, onClick }) {
  const { text, scramble, setText } = useTextScramble()
  const [hovering, setHovering] = useState(false)

  return (
    <a
      href={item.href}
      onClick={(e) => onClick(e, item.href)}
      onMouseEnter={() => { setHovering(true); scramble(item.label) }}
      onMouseLeave={() => { setHovering(false); setText('') }}
      className={`relative px-3 py-2 text-xs tracking-[0.15em] uppercase font-medium transition-colors ${
        isActive
          ? 'text-cosmic-violet'
          : 'text-white/65 hover:text-white/90'
      }`}
    >
      {hovering ? text : item.label}
      {isActive && (
        <motion.div
          layoutId="navActiveIndicator"
          className="absolute bottom-0 left-3 right-3 h-px bg-cosmic-violet"
          transition={{ type: 'spring', duration: 0.5 }}
        />
      )}
    </a>
  )
}

export default Navbar
