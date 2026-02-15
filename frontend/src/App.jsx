import React, { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

/* ─── Eager imports ─── */
import Loader from './components/Loader'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import CustomCursor from './components/CustomCursor'
import GrainOverlay from './components/GrainOverlay'
import NeuralPathways from './components/NeuralPathways'
import SceneIndicator from './components/SceneIndicator'

/* ─── Lazy imports ─── */
const About = lazy(() => import('./components/About'))
const Projects = lazy(() => import('./components/Projects'))
const Skills = lazy(() => import('./components/Skills'))
const Contact = lazy(() => import('./components/Contact'))
const Footer = lazy(() => import('./components/Footer'))

/* ═══════════════════════════════════════════════════════════════
 *  APP — Cosmic AI Universe Orchestrator
 *  Lenis smooth scroll, GSAP ScrollTrigger dimension transitions,
 *  cosmic background system, section reveals.
 * ═══════════════════════════════════════════════════════════════ */

/* ───── Cosmic Background ───── */
function CosmicBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* Deep space base */}
      <div className="absolute inset-0 bg-void" />

      {/* Subtle gradient overlays */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-1/2"
          style={{ background: 'radial-gradient(ellipse 80% 50% at 20% 0%, rgba(139,92,246,0.08) 0%, transparent 70%)' }}
        />
        <div className="absolute bottom-0 right-0 w-full h-1/2"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 80% 100%, rgba(59,130,246,0.06) 0%, transparent 70%)' }}
        />
        {/* Center ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full"
          style={{ background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(6,182,212,0.03) 0%, transparent 70%)' }}
        />
      </div>

      {/* Floating cosmic dust */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cosmic-violet/[0.02] rounded-full blur-[150px] animate-cosmic-breathe" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cosmic-blue/[0.02] rounded-full blur-[120px] animate-cosmic-breathe" style={{ animationDelay: '-4s' }} />
      <div className="absolute top-2/3 left-1/3 w-64 h-64 bg-cosmic-cyan/[0.015] rounded-full blur-[100px] animate-cosmic-breathe" style={{ animationDelay: '-8s' }} />

      {/* Subtle scan line */}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)', backgroundSize: '100% 4px' }}
      />
    </div>
  )
}

/* ───── Section Divider ───── */
function DimensionDivider() {
  return (
    <div className="relative h-32 flex items-center justify-center overflow-hidden">
      {/* Main line */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
        className="w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-cosmic-violet/15 to-transparent"
      />
      {/* Center pulse node */}
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
        className="absolute w-2 h-2 rounded-full bg-cosmic-violet/20 shadow-[0_0_12px_rgba(139,92,246,0.3)]"
      />
      {/* Expanding ring */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: [0, 2.5], opacity: [0.4, 0] }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 1.5 }}
        className="absolute w-4 h-4 rounded-full border border-cosmic-violet/20"
      />
      {/* Side dots */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 0.3, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8 }}
        className="absolute left-1/2 ml-16 w-1 h-1 rounded-full bg-cosmic-blue/30"
      />
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 0.3, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8 }}
        className="absolute left-1/2 -ml-16 w-1 h-1 rounded-full bg-cosmic-blue/30"
      />
    </div>
  )
}

/* ───── Lazy Loading Fallback ───── */
function SectionFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-5 h-5 border border-cosmic-violet/30 border-t-cosmic-violet rounded-full"
        />
        <span className="text-xs font-mono text-white/20 tracking-widest">LOADING</span>
      </div>
    </div>
  )
}

/* ═══════════ MAIN APP ═══════════ */
const App = () => {
  const [loading, setLoading] = useState(true)
  const mainRef = useRef(null)
  const lenisRef = useRef(null)

  /* ── Loading → Reveal ── */
  const handleLoadComplete = () => {
    setLoading(false)
  }

  /* ── Lenis Smooth Scroll ── */
  useEffect(() => {
    if (loading) return

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 1.5,
    })
    lenisRef.current = lenis
    window.__lenis = lenis

    // Sync GSAP ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      window.__lenis = null
      gsap.ticker.remove(lenis.raf)
      ScrollTrigger.getAll().forEach(st => st.kill())
    }
  }, [loading])

  /* ── Scroll-based section reveals ── */
  useEffect(() => {
    if (loading || !mainRef.current) return

    const sections = mainRef.current.querySelectorAll('section[id]')
    sections.forEach((section) => {
      gsap.fromTo(section,
        { y: 30 },
        {
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            end: 'top 20%',
            scrub: 0.5,
          },
        }
      )
    })

    return () => ScrollTrigger.getAll().forEach(st => st.kill())
  }, [loading])

  return (
    <>
      {/* Custom cursor */}
      <CustomCursor />

      {/* Loading Screen */}
      <AnimatePresence mode="wait">
        {loading && <Loader onComplete={handleLoadComplete} />}
      </AnimatePresence>

      {/* Main Content */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          {/* Fixed backgrounds */}
          <CosmicBackground />
          <NeuralPathways />
          <GrainOverlay />

          {/* Navbar */}
          <Navbar />

          {/* Scene Indicator */}
          <SceneIndicator />

          {/* Main scrollable content */}
          <main ref={mainRef} className="relative z-10">
            <Hero />

            <DimensionDivider />

            <Suspense fallback={<SectionFallback />}>
              <About />
            </Suspense>

            <DimensionDivider />

            <Suspense fallback={<SectionFallback />}>
              <Projects />
            </Suspense>

            <DimensionDivider />

            <Suspense fallback={<SectionFallback />}>
              <Skills />
            </Suspense>

            <DimensionDivider />

            <Suspense fallback={<SectionFallback />}>
              <Contact />
            </Suspense>

            <Suspense fallback={<SectionFallback />}>
              <Footer />
            </Suspense>
          </main>
        </motion.div>
      )}
    </>
  )
}

export default App
