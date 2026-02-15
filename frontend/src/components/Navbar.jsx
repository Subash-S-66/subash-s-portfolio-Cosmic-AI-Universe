import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { personalInfo, navItems } from '../data/personal'

const portfolioThemes = [
  { label: 'Neural Network Theme', url: 'http://subash-dev-portfolio.zeabur.app/' },
  { label: 'Cosmic Universe Theme', url: 'http://subash-s-portfolio.zeabur.app/' },
  { label: 'Game Theme', url: 'http://subash--portfolio.zeabur.app/' },
]
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
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false)
  const [mobileThemeOpen, setMobileThemeOpen] = useState(false)
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
    setMobileThemeOpen(false)
    setThemeDropdownOpen(false)
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
            <span className="text-gradient-cosmic">{personalInfo.name?.split(' ').slice(0, 2).join(' ') || 'Subash S'}</span>
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
            <a
              href={personalInfo.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg border border-cosmic-blue/20 bg-cosmic-blue/[0.05] text-sm tracking-wide text-white/70 hover:text-white hover:border-cosmic-blue/40 hover:bg-cosmic-blue/[0.12] transition-all duration-300 whitespace-nowrap"
            >
              Resume
            </a>
            <div className="mx-2 h-4 w-px bg-white/15" />
            <div
              className="relative"
              onMouseEnter={() => setThemeDropdownOpen(true)}
              onMouseLeave={() => setThemeDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setThemeDropdownOpen(prev => !prev)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cosmic-violet/20 bg-cosmic-violet/[0.05] text-sm tracking-wide text-white/70 hover:text-white hover:border-cosmic-violet/40 hover:bg-cosmic-violet/[0.12] transition-all duration-300"
                aria-haspopup="true"
                aria-expanded={themeDropdownOpen}
              >
                Portfolios
                <motion.span
                  animate={{ rotate: themeDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="inline-flex"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </motion.span>
              </button>
              <AnimatePresence>
                {themeDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="absolute top-full right-0 mt-2 w-56 rounded-xl border border-white/10 bg-void-deep/95 backdrop-blur-xl shadow-[0_12px_30px_rgba(0,0,0,0.35)] p-2 z-50"
                  >
                    {portfolioThemes.map((theme, i) => (
                      <motion.a
                        key={theme.label}
                        href={theme.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setThemeDropdownOpen(false)}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="block px-3 py-2 rounded-lg text-xs tracking-wide text-white/75 hover:text-white hover:bg-cosmic-violet/[0.12] transition-all duration-200"
                      >
                        {theme.label}
                      </motion.a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => {
              const nextOpen = !mobileOpen
              setMobileOpen(nextOpen)
              if (!nextOpen) setMobileThemeOpen(false)
            }}
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
              onClick={() => {
                setMobileOpen(false)
                setMobileThemeOpen(false)
              }}
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

              <motion.a
                href={personalInfo.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setMobileOpen(false)
                  setMobileThemeOpen(false)
                }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                className="inline-flex px-3 py-2 rounded-lg border border-cosmic-blue/20 bg-cosmic-blue/[0.06] text-sm text-white/75 hover:text-white hover:border-cosmic-blue/40 hover:bg-cosmic-blue/[0.12] transition-all"
              >
                Resume
              </motion.a>

              <div className="mt-4 pt-4 border-t border-white/10 w-full">
                <button
                  type="button"
                  onClick={() => setMobileThemeOpen(prev => !prev)}
                  className="w-full inline-flex items-center justify-between px-3 py-2 rounded-lg border border-cosmic-violet/20 bg-cosmic-violet/[0.06] text-sm text-white/75 hover:text-white hover:border-cosmic-violet/40 hover:bg-cosmic-violet/[0.12] transition-all"
                  aria-expanded={mobileThemeOpen}
                >
                  Themes
                  <motion.span
                    animate={{ rotate: mobileThemeOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="inline-flex"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </motion.span>
                </button>
                <AnimatePresence>
                  {mobileThemeOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden mt-3"
                    >
                      <div className="space-y-2">
                        {portfolioThemes.map((theme, i) => (
                          <motion.a
                            key={theme.label}
                            href={theme.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              setMobileOpen(false)
                              setMobileThemeOpen(false)
                            }}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="block px-3 py-2 rounded-lg border border-white/10 text-sm text-white/70 hover:text-white hover:bg-cosmic-violet/[0.12] hover:border-cosmic-violet/30 transition-all"
                          >
                            {theme.label}
                          </motion.a>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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

