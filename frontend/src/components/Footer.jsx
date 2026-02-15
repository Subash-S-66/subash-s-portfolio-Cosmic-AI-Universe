import React from 'react'
import { motion } from 'framer-motion'
import { personalInfo, socialLinks, navItems } from '../data/personal'

/* ═══════════════════════════════════════════════════════════════
 *  FOOTER — Cosmic Footer
 *  Minimal, elegant footer with cosmic glow accents,
 *  navigation links, social links, and gradient border.
 * ═══════════════════════════════════════════════════════════════ */

const Footer = () => {
  const year = new Date().getFullYear()

  const handleNavClick = (e, href) => {
    e.preventDefault()
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
  }

  return (
    <footer className="relative overflow-hidden">
      {/* Top border */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-cosmic-violet/20 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xl font-bold text-gradient-cosmic mb-3"
            >
              {personalInfo.name}
            </motion.h3>
            <p className="text-sm text-white/55 leading-relaxed max-w-xs">
              {personalInfo.tagline}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-[10px] font-mono text-white/45 uppercase tracking-[0.2em] mb-4">
              Navigation
            </p>
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="text-sm text-white/55 hover:text-cosmic-violet transition-colors duration-300 w-fit"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <p className="text-[10px] font-mono text-white/45 uppercase tracking-[0.2em] mb-4">
              Connect
            </p>
            <div className="flex flex-col gap-3">
              {socialLinks.map((link) => {
                const getIcon = (label) => {
                  const lower = label.toLowerCase()
                  if (lower === 'github') return (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                  )
                  if (lower === 'linkedin') return (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                  )
                  if (lower === 'instagram') return (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
                  )
                  return null
                }
                return (
                  <a
                    key={link.label}
                    href={link.url || link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/55 hover:text-cosmic-violet transition-colors duration-300 w-fit flex items-center gap-2"
                  >
                    {getIcon(link.label)} {link.label}
                  </a>
                )
              })}
              <div className="w-px h-4 bg-white/10 my-1"></div>
              <a href="tel:+919345081127" className="text-sm text-white/55 hover:text-cosmic-blue transition-colors duration-300 w-fit flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                +91-9345081127
              </a>
              <a href="mailto:subash.93450@gmail.com" className="text-sm text-white/55 hover:text-cosmic-cyan transition-colors duration-300 w-fit flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                subash.93450@gmail.com
              </a>
              <p className="text-sm text-white/55 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                Chennai, India
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/[0.04] mb-8" />

        {/* Bottom """  */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40 font-mono tracking-wider">
            &copy; {year} {personalInfo.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 animate-pulse" />
            <span className="text-[10px] font-mono text-white/40 tracking-widest uppercase">
              System Online
            </span>
          </div>
        </div>
      </div>

      {/* Large background text */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[12vw] font-bold text-white/[0.01] pointer-events-none select-none whitespace-nowrap leading-none pb-8">
        {personalInfo.name}
      </div>
    </footer>
  )
}

export default Footer
