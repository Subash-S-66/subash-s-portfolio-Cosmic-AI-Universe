import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { navItems } from '../data/personal'

/* ═══════════════════════════════════════════════════════════════
 *  SCENE INDICATOR — Dimension Travel Indicator
 *  Fixed side indicator showing current section/dimension
 *  with cosmic dot + label transitions.
 * ═══════════════════════════════════════════════════════════════ */

const SceneIndicator = () => {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const sections = navItems.map(item => item.href.replace('#', ''))

    const onScroll = () => {
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i])
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= window.innerHeight / 2) {
            setActiveIndex(i)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleClick = (index) => {
    const id = navItems[index].href.replace('#', '')
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
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-3">
      {navItems.map((item, i) => {
        const isActive = i === activeIndex
        return (
          <button
            key={item.label}
            onClick={() => handleClick(i)}
            className="relative group flex items-center gap-3"
            title={item.label}
          >
            {/* Label tooltip */}
            <AnimatePresence>
              {isActive && (
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                  className="absolute right-full mr-3 text-[10px] font-mono tracking-[0.15em] uppercase text-cosmic-violet whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Dot */}
            <div className={`relative transition-all duration-300 ${
              isActive ? 'w-2.5 h-2.5' : 'w-1.5 h-1.5'
            }`}>
              <div className={`w-full h-full rounded-full transition-all duration-300 ${
                isActive
                  ? 'bg-cosmic-violet shadow-[0_0_8px_rgba(139,92,246,0.6)]'
                  : 'bg-white/15 group-hover:bg-white/30'
              }`} />
              {isActive && (
                <motion.div
                  animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-cosmic-violet/30"
                />
              )}
            </div>
          </button>
        )
      })}

      {/* Connecting line */}
      <div className="absolute top-0 bottom-0 right-[3px] w-px bg-white/[0.04] -z-10" />
    </div>
  )
}

export default SceneIndicator
