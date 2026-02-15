import React, { useRef, useEffect } from 'react'

/* ═══════════════════════════════════════════════════════════════
 *  NEURAL PATHWAYS — Cosmic Neural Overlay
 *  Fixed canvas overlay drawing floating neural pathway lines
 *  that pulse and connect across the viewport.
 * ═══════════════════════════════════════════════════════════════ */

const NeuralPathways = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    // Neural paths
    const pathCount = 6
    const paths = Array.from({ length: pathCount }, () => ({
      points: Array.from({ length: 5 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
      })),
      color: [
        'rgba(139,92,246,',
        'rgba(59,130,246,',
        'rgba(6,182,212,',
        'rgba(168,85,247,',
        'rgba(96,165,250,',
        'rgba(139,92,246,',
      ][Math.floor(Math.random() * 6)],
      width: 0.3 + Math.random() * 0.4,
      pulseOffset: Math.random() * Math.PI * 2,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      const t = performance.now() * 0.001

      paths.forEach(path => {
        const alpha = (Math.sin(t * 0.5 + path.pulseOffset) * 0.5 + 0.5) * 0.06

        // Update points
        path.points.forEach(p => {
          p.x += p.vx
          p.y += p.vy
          if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1
          if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1
        })

        // Draw curve
        ctx.strokeStyle = `${path.color}${alpha})`
        ctx.lineWidth = path.width
        ctx.beginPath()
        ctx.moveTo(path.points[0].x, path.points[0].y)
        for (let i = 1; i < path.points.length - 1; i++) {
          const xc = (path.points[i].x + path.points[i + 1].x) / 2
          const yc = (path.points[i].y + path.points[i + 1].y) / 2
          ctx.quadraticCurveTo(path.points[i].x, path.points[i].y, xc, yc)
        }
        ctx.stroke()

        // Draw nodes
        path.points.forEach((p, i) => {
          const nodeAlpha = alpha * 3
          ctx.fillStyle = `${path.color}${nodeAlpha})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2)
          ctx.fill()
        })
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
      className="fixed inset-0 w-full h-full pointer-events-none z-[1]"
      style={{ opacity: 0.5 }}
    />
  )
}

export default NeuralPathways
