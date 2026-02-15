import React, { useRef, useEffect, useMemo, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { skillGroups, highlights } from '../data/skills'

gsap.registerPlugin(ScrollTrigger)

/* ═══════════════════════════════════════════════════════════════
 *  SKILLS — Neural Graph
 *  Animated skill bars with energy pulse, orbiting nodes,
 *  category cards, cosmic constellation, highlights.
 * ═══════════════════════════════════════════════════════════════ */

/* ───── Orbiting Skill Nodes  ───── */
function OrbitingNodes({ color, count = 3, radius = 20 }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const duration = 6 + i * 2
        const delay = i * -2
        const size = 3 + i
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: color,
              boxShadow: `0 0 ${size * 3}px ${color}80`,
              top: '50%',
              left: '50%',
            }}
            animate={{
              x: [radius, 0, -radius, 0, radius],
              y: [0, -radius * 0.7, 0, radius * 0.7, 0],
              opacity: [0.3, 0.8, 0.3, 0.8, 0.3],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )
      })}
    </div>
  )
}

/* ───── Energy Connection Lines ───── */
function EnergyLines() {
  return (
    <div className="absolute inset-0 pointer-events-none hidden md:block">
      {/* Vertical connection */}
      <motion.div
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, delay: 0.8 }}
        className="absolute left-1/2 top-0 bottom-0 w-px origin-top"
        style={{ background: 'linear-gradient(180deg, transparent, rgba(139,92,246,0.1) 30%, rgba(59,130,246,0.1) 70%, transparent)' }}
      />
      {/* Horizontal connection */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, delay: 1.0 }}
        className="absolute top-1/2 left-0 right-0 h-px origin-left"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.08) 30%, rgba(168,85,247,0.08) 70%, transparent)' }}
      />
      {/* Center pulse node */}
      <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-cosmic-violet/30"
        style={{ boxShadow: '0 0 20px rgba(139,92,246,0.3)' }}
      />
    </div>
  )
}

/* ───── Skill Bar ───── */
function SkillBar({ skill, index, groupIndex }) {
  const barRef = useRef(null)
  const fillRef = useRef(null)
  const sparkRef = useRef(null)
  const inView = useInView(barRef, { once: true, margin: '-30px' })

  useEffect(() => {
    if (!inView || !fillRef.current) return
    const delay = groupIndex * 0.2 + index * 0.1
    gsap.fromTo(fillRef.current,
      { width: '0%' },
      {
        width: `${skill.level}%`,
        duration: 1.2,
        delay,
        ease: 'power3.out',
      }
    )
    // Spark travels along the bar
    if (sparkRef.current) {
      gsap.fromTo(sparkRef.current,
        { left: '0%', opacity: 0 },
        { left: `${skill.level}%`, opacity: 1, duration: 1.2, delay, ease: 'power3.out',
          onComplete: () => gsap.to(sparkRef.current, { opacity: 0, duration: 0.3 })
        }
      )
    }
  }, [inView, skill.level, index, groupIndex])

  const color = ['#8b5cf6', '#3b82f6', '#06b6d4', '#a855f7'][groupIndex % 4]

  return (
    <div ref={barRef} className="group">
      <div className="flex items-center justify-between mb-2">
        <motion.span
          className="text-sm text-white/70 group-hover:text-white/90 transition-colors"
          whileHover={{ x: 3 }}
        >
          {skill.name}
        </motion.span>
        <motion.span
          className="text-xs font-mono text-white/50 group-hover:text-white/65 transition-colors"
          whileHover={{ scale: 1.1 }}
        >
          {skill.level}%
        </motion.span>
      </div>
      <div className="relative h-1.5 rounded-full bg-white/[0.04] overflow-hidden group-hover:h-2 transition-all duration-300">
        <div
          ref={fillRef}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}40, ${color}80, ${color})`,
            width: '0%',
            boxShadow: `0 0 12px ${color}40, inset 0 0 6px ${color}30`,
          }}
        />
        {/* Travelling spark */}
        <div
          ref={sparkRef}
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full opacity-0"
          style={{
            background: `radial-gradient(circle, ${color}, transparent)`,
            marginLeft: '-8px',
          }}
        />
        {/* Pulse dot at the end */}
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
          style={{
            backgroundColor: color,
            left: `${skill.level}%`,
            marginLeft: '-5px',
            boxShadow: `0 0 8px ${color}80, 0 0 16px ${color}40`,
            display: inView ? 'block' : 'none',
          }}
        />
      </div>
    </div>
  )
}

/* ───── Skill Group Card ───── */
function SkillGroup({ group, index }) {
  const color = ['#8b5cf6', '#3b82f6', '#06b6d4', '#a855f7'][index % 4]
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 10 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12, duration: 0.7 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="glass-panel rounded-2xl p-6 hover:border-white/10 transition-all duration-500 group relative overflow-hidden"
      style={{
        boxShadow: hovered ? `0 0 60px ${color}15, 0 0 20px ${color}08` : undefined,
      }}
    >
      {/* Orbiting nodes */}
      <OrbitingNodes color={color} count={3} radius={30} />

      {/* Corner energy accent */}
      <motion.div
        animate={{ opacity: hovered ? 0.6 : 0 }}
        className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
        style={{ background: `radial-gradient(circle at 100% 0%, ${color}20, transparent 70%)` }}
      />

      {/* Holo shimmer on hover */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0, x: hovered ? '200%' : '-100%' }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(105deg, transparent 40%, ${color}08 50%, transparent 60%)`,
        }}
      />

      {/* Group header */}
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <motion.div
          animate={hovered ? { rotate: 45, scale: 1.1 } : { rotate: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15`, border: `1px solid ${color}25` }}
        >
          <motion.div
            animate={hovered ? { scale: [1, 1.5, 1] } : {}}
            transition={{ duration: 0.6 }}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
          />
        </motion.div>
        <div>
          <h3 className="text-base font-semibold text-white/80">{group.title}</h3>
          <span className="text-[10px] font-mono text-white/45 tracking-widest uppercase">
            {group.items.length} skills
          </span>
        </div>
        {/* Scan line indicator */}
        <motion.div
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
          className="ml-auto w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>

      {/* Skills */}
      <div className="space-y-4 relative z-10">
        {group.items.map((skill, i) => (
          <SkillBar key={skill.name} skill={skill} index={i} groupIndex={index} />
        ))}
      </div>
    </motion.div>
  )
}

/* ═══════════ MAIN SKILLS COMPONENT ═══════════ */
const Skills = () => {
  return (
    <section id="skills" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cosmic-violet/3 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-cosmic-blue/3 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating geometric decorators */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute top-20 right-20 w-40 h-40 border border-cosmic-violet/[0.05] rounded-full pointer-events-none hidden lg:block"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-40 left-10 w-60 h-60 border border-cosmic-blue/[0.04] rounded-full pointer-events-none hidden lg:block"
      />

      {/* Floating dots */}
      {[
        { top: '15%', left: '8%', delay: 0, color: '#8b5cf6' },
        { top: '70%', right: '5%', delay: 1.5, color: '#3b82f6' },
        { top: '40%', left: '3%', delay: 3, color: '#06b6d4' },
        { top: '85%', right: '12%', delay: 4.5, color: '#a855f7' },
      ].map((dot, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -15, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4, delay: dot.delay, repeat: Infinity }}
          className="absolute w-1.5 h-1.5 rounded-full pointer-events-none hidden lg:block"
          style={{ top: dot.top, left: dot.left, right: dot.right, backgroundColor: dot.color, boxShadow: `0 0 10px ${dot.color}60` }}
        />
      ))}

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cosmic-violet/10 border border-cosmic-violet/20 mb-6"
          >
            <motion.span
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-cosmic-violet"
            />
            <span className="text-xs font-mono tracking-widest text-cosmic-violet/80 uppercase">
              Neural Graph
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-gradient-cosmic mb-4"
          >
            Skills & Expertise
          </motion.h2>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="w-24 h-px bg-gradient-to-r from-transparent via-cosmic-violet to-transparent mx-auto"
          />
        </div>

        {/* Skill Groups Grid with Energy Lines */}
        <div className="relative mb-16">
          <EnergyLines />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skillGroups.map((group, i) => (
              <SkillGroup key={group.title} group={group} index={i} />
            ))}
          </div>
        </div>

        {/* Highlights */}
        <div className="max-w-2xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs text-white/50 font-mono tracking-[0.2em] uppercase mb-6 text-center"
          >
            Core Strengths
          </motion.p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {highlights.map((h, i) => (
              <motion.div
                key={h}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.06, type: 'spring', stiffness: 150 }}
                whileHover={{
                  scale: 1.05,
                  y: -2,
                  boxShadow: '0 0 20px rgba(59,130,246,0.15)',
                  borderColor: 'rgba(59,130,246,0.15)',
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.05] bg-white/[0.01] text-white/60 text-xs cursor-default transition-colors"
              >
                <motion.span
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, delay: i * 0.3, repeat: Infinity }}
                  className="w-1 h-1 rounded-full bg-cosmic-blue flex-shrink-0"
                  style={{ boxShadow: '0 0 6px rgba(59,130,246,0.5)' }}
                />
                {h}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Skills
