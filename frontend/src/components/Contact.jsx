import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { contactInfo, socialLinks } from '../data/personal'
import { API_ENDPOINTS } from '../config/api'
const portfolioThemes = [
  { label: 'Cosmic Universe Theme', url: 'http://subash-dev-portfolio.zeabur.app/' },
  { label: 'Neural Network Theme', url: 'http://subash-s-portfolio.zeabur.app/' },
  { label: 'Game Theme', url: 'http://subash--portfolio.zeabur.app/' },
  { label: 'Regular Theme', url: 'https://subash-portfolio.zeabur.app/' },
]

/* ═══════════════════════════════════════════════════════════════
 *  CONTACT — AI Communication Portal
 *  Futuristic form inputs with glow focus, pulse wave on submit,
 *  energy particles, signal transmission, status indicators.
 * ═══════════════════════════════════════════════════════════════ */

/* ───── Energy Burst on Submit ───── */
function EnergyBurst({ active }) {
  if (!active) return null
  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * 360
        const rad = (angle * Math.PI) / 180
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(rad) * 300,
              y: Math.sin(rad) * 300,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: i % 2 === 0 ? '#8b5cf6' : '#3b82f6',
              boxShadow: `0 0 12px ${i % 2 === 0 ? '#8b5cf6' : '#3b82f6'}`,
            }}
          />
        )
      })}
      <motion.div
        initial={{ scale: 0, opacity: 0.6 }}
        animate={{ scale: 4, opacity: 0 }}
        transition={{ duration: 1 }}
        className="absolute w-20 h-20 rounded-full border-2 border-cosmic-violet/50"
      />
    </div>
  )
}

/* ───── Floating Signal Particles ───── */
function SignalParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -40, 0],
            x: [0, (i % 2 ? 10 : -10), 0],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: 4 + i,
            delay: i * 0.7,
            repeat: Infinity,
          }}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${10 + i * 11}%`,
            bottom: `${20 + (i * 7) % 50}%`,
            backgroundColor: ['#8b5cf6', '#3b82f6', '#06b6d4', '#a855f7'][i % 4],
            boxShadow: `0 0 8px ${['#8b5cf6', '#3b82f6', '#06b6d4', '#a855f7'][i % 4]}60`,
          }}
        />
      ))}
    </div>
  )
}

/* ───── Cosmic Input Field ───── */
function CosmicInput({ label, name, type = 'text', value, onChange, error, required }) {
  const [focused, setFocused] = useState(false)
  const isTextarea = type === 'textarea'
  const Tag = isTextarea ? 'textarea' : 'input'

  return (
    <motion.div
      className="relative group"
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <label className="block text-xs font-mono tracking-[0.15em] uppercase text-white/50 mb-2">
        {label}
        {required && <span className="text-cosmic-violet ml-1">*</span>}
      </label>
      <div className="relative">
        <Tag
          name={name}
          type={isTextarea ? undefined : type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={isTextarea ? 5 : undefined}
          className={`w-full bg-white/[0.02] border rounded-xl px-4 py-3 text-sm text-white/80 placeholder-white/15 outline-none transition-all duration-500 resize-none ${
            error
              ? 'border-red-500/40'
              : focused
              ? 'border-cosmic-violet/40 shadow-[0_0_25px_rgba(139,92,246,0.15)]'
              : 'border-white/[0.06] hover:border-white/[0.12]'
          }`}
        />
        {/* Focus glow line */}
        <motion.div
          animate={{ scaleX: focused ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-cosmic-violet to-transparent origin-center"
        />
        {/* Corner glow accents on focus */}
        <motion.div
          animate={{ opacity: focused ? 0.5 : 0 }}
          className="absolute -top-px -left-px w-4 h-4 border-t border-l border-cosmic-violet/40 rounded-tl-xl pointer-events-none"
        />
        <motion.div
          animate={{ opacity: focused ? 0.5 : 0 }}
          className="absolute -bottom-px -right-px w-4 h-4 border-b border-r border-cosmic-violet/40 rounded-br-xl pointer-events-none"
        />
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-red-400/70 text-xs mt-1 font-mono"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ───── Contact Info Item ───── */
function ContactItem({ item, index }) {
  const iconMap = {
    Phone: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    ),
    Email: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
    ),
    Location: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
    ),
  }

  return (
    <motion.a
      href={item.href}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3 + index * 0.1 }}
      whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.02)' }}
      className="flex items-center gap-4 group p-3 rounded-xl transition-all duration-300 relative overflow-hidden"
    >
      {/* Hover shimmer */}
      <motion.div
        initial={{ x: '-100%' }}
        whileHover={{ x: '200%' }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent pointer-events-none"
      />
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="w-10 h-10 rounded-xl bg-cosmic-violet/10 border border-cosmic-violet/15 flex items-center justify-center text-cosmic-violet/60 group-hover:text-cosmic-violet group-hover:border-cosmic-violet/30 transition-all duration-300"
        style={{ boxShadow: 'none' }}
        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(139,92,246,0.2)'}
        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
      >
        {iconMap[item.label] || <span className="text-xs">{item.label[0]}</span>}
      </motion.div>
      <div>
        <span className="text-[10px] font-mono text-white/45 uppercase tracking-widest block">
          {item.label}
        </span>
        <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">
          {item.value}
        </span>
      </div>
    </motion.a>
  )
}

/* ═══════════ MAIN CONTACT COMPONENT ═══════════ */
const Contact = () => {
  const formRef = useRef(null)
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle, sending, success, error
  const [statusMessage, setStatusMessage] = useState('')
  const [showBurst, setShowBurst] = useState(false)

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }, [])

  const validate = useCallback(() => {
    const errs = {}
    if (!formData.name.trim()) errs.name = 'Name is required'
    if (!formData.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Invalid email format'
    if (!formData.message.trim()) errs.message = 'Message is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }, [formData])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!validate()) return

    setStatus('sending')
    setShowBurst(true)
    setTimeout(() => setShowBurst(false), 1500)
    try {
      const res = await fetch(API_ENDPOINTS.CONTACT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setStatusMessage(data.message || 'Message transmitted successfully.')
        setFormData({ name: '', email: '', subject: '', message: '' })
        setTimeout(() => setStatus('idle'), 5000)
      } else {
        setStatus('error')
        setStatusMessage(data.message || 'Transmission failed. Try again.')
        setTimeout(() => setStatus('idle'), 4000)
      }
    } catch {
      setStatus('error')
      setStatusMessage('Connection error. Check your network.')
      setTimeout(() => setStatus('idle'), 4000)
    }
  }, [formData, validate])

  return (
    <section id="contact" className="relative py-32 overflow-hidden">
      {/* Energy Burst effect */}
      <EnergyBurst active={showBurst} />

      {/* Signal Particles */}
      <SignalParticles />

      {/* Background */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cosmic-violet/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-cosmic-blue/3 rounded-full blur-[120px] pointer-events-none" />

      {/* Rotating ring decoration */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        className="absolute top-20 left-10 w-32 h-32 border border-cosmic-blue/[0.04] rounded-full pointer-events-none hidden lg:block"
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cosmic-blue/10 border border-cosmic-blue/20 mb-6"
          >
            <motion.span
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-cosmic-blue"
            />
            <span className="text-xs font-mono tracking-widest text-cosmic-blue/80 uppercase">
              Communication Portal
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-gradient-cosmic mb-4"
          >
            Get In Touch
          </motion.h2>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="w-24 h-px bg-gradient-to-r from-transparent via-cosmic-blue to-transparent mx-auto"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-2">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-white/60 text-sm leading-relaxed mb-6"
            >
              Ready to collaborate or have a question? Send a message through the portal
              and I'll respond as quickly as possible.
            </motion.p>

            {contactInfo.map((item, i) => (
              <ContactItem key={item.label} item={item} index={i} />
            ))}

            {/* Social Links */}
            <div className="pt-6">
              <p className="text-[10px] font-mono text-white/45 uppercase tracking-widest mb-4">
                Connect
              </p>
              <div className="space-y-2 mb-6">
                {socialLinks.map((link, i) => {
                  const getIcon = (label) => {
                    const lower = label.toLowerCase()
                    if (lower === 'github') return (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                    )
                    if (lower === 'linkedin') return (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                    )
                    if (lower === 'instagram') return (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
                    )
                    return <span>→</span>
                  }
                  return (
                    <motion.a
                      key={link.label}
                      href={link.url || link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.06 }}
                      whileHover={{
                        x: 5,
                        color: '#8b5cf6',
                        paddingLeft: '8px'
                      }}
                      className="flex items-center gap-2 text-sm text-white/55 hover:text-cosmic-violet transition-all duration-300 w-fit"
                    >
                      {getIcon(link.label)} {link.label}
                    </motion.a>
                  )
                })}
              </div>
            </div>

            {/* Portfolio Theme Switcher */}
            <div className="pt-2">
              <p className="text-[10px] font-mono text-white/45 uppercase tracking-widest mb-4">
                Portfolio Themes
              </p>
              <div className="flex flex-col gap-3">
                {portfolioThemes.map((theme, i) => (
                  <motion.a
                    key={theme.label}
                    href={theme.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.65 + i * 0.07 }}
                    whileHover={{ x: 5 }}
                    className="w-fit px-4 py-2 rounded-lg border border-cosmic-violet/20 bg-cosmic-violet/[0.05] text-sm text-white/75 hover:text-white hover:border-cosmic-violet/40 hover:bg-cosmic-violet/[0.09] transition-all duration-300"
                  >
                    {theme.label}
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <CosmicInput
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  required
                />
                <CosmicInput
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                />
              </div>
              <CosmicInput
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
              />
              <CosmicInput
                label="Message"
                name="message"
                type="textarea"
                value={formData.message}
                onChange={handleChange}
                error={errors.message}
                required
              />

              {/* Submit Button */}
              <div className="pt-2">
                <motion.button
                  type="submit"
                  disabled={status === 'sending'}
                  whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(139,92,246,0.25), 0 0 80px rgba(139,92,246,0.1)' }}
                  whileTap={{ scale: 0.97 }}
                  className="relative w-full sm:w-auto px-8 py-3 rounded-xl overflow-hidden border border-cosmic-violet/30 bg-cosmic-violet/10 text-white text-sm font-medium tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:border-cosmic-violet/50 group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {status === 'sending' ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white/20 border-t-cosmic-violet rounded-full"
                        />
                        Transmitting...
                      </>
                    ) : (
                      <>
                        <motion.svg
                          animate={{ x: [0, 3, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        >
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </motion.svg>
                        Send Message
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cosmic-violet/10 to-cosmic-blue/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {/* Animated border glow */}
                  <motion.div
                    animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.1), transparent)', backgroundSize: '200% 100%' }}
                  />
                </motion.button>
              </div>

              {/* Status Message */}
              <AnimatePresence>
                {(status === 'success' || status === 'error') && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${
                      status === 'success'
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400/80'
                        : 'bg-red-500/10 border border-red-500/20 text-red-400/80'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      status === 'success' ? 'bg-emerald-500' : 'bg-red-500'
                    }`} />
                    {statusMessage}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Contact


