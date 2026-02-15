import React, { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Stars } from '@react-three/drei'
import * as THREE from 'three'

/* ═══════════════════════════════════════════════════════════════
 *  COSMIC AI CORE — Three.js Scene (Enhanced)
 *  Central glowing AI orb, aurora ribbons, DNA helix, 
 *  nebula particles, neural connections, orbital rings,
 *  energy streams, wormhole vortex, starfield depth layers.
 * ═══════════════════════════════════════════════════════════════ */

const mousePos = new THREE.Vector2(0, 0)
if (typeof window !== 'undefined') {
  window.addEventListener('mousemove', (e) => {
    mousePos.x = (e.clientX / window.innerWidth) * 2 - 1
    mousePos.y = -(e.clientY / window.innerHeight) * 2 + 1
  })
}

/* ───── AI Core Orb (Enhanced with pulsating rings + energy shell) ───── */
function AICoreOrb() {
  const meshRef = useRef()
  const glowRef = useRef()
  const ringRef = useRef()
  const ring2Ref = useRef()
  const ring3Ref = useRef()
  const shellRef = useRef()

  const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;
      uniform float uTime;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        vUv = uv;
        float displacement = sin(position.x * 5.0 + uTime * 1.2) * 
                             cos(position.y * 5.0 + uTime * 0.8) * 
                             sin(position.z * 5.0 + uTime * 0.6) * 0.12;
        displacement += sin(position.x * 10.0 - uTime * 2.0) * 0.03;
        vec3 newPos = position + normal * displacement;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uMouse;
      void main() {
        float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.5);
        float pulse = sin(uTime * 1.5) * 0.15 + 0.85;
        float wave = sin(vPosition.y * 8.0 + uTime * 3.0) * 0.1 + 0.9;
        vec3 blue = vec3(0.231, 0.510, 0.965);
        vec3 violet = vec3(0.545, 0.361, 0.965);
        vec3 cyan = vec3(0.024, 0.714, 0.831);
        float mixer = sin(uTime * 0.5) * 0.5 + 0.5;
        vec3 core = mix(mix(violet, blue, fresnel), cyan, mixer * fresnel) * pulse * wave;
        float alpha = fresnel * 0.75 + 0.2;
        gl_FragColor = vec4(core, alpha);
      }
    `,
    transparent: true,
    side: THREE.FrontSide,
    depthWrite: false,
  }), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    shaderMaterial.uniforms.uTime.value = t
    shaderMaterial.uniforms.uMouse.value.set(mousePos.x, mousePos.y)

    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.15 + mousePos.x * 0.3
      meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.1 + mousePos.y * 0.2
    }
    if (glowRef.current) {
      const scale = 1 + Math.sin(t * 1.5) * 0.1 + Math.sin(t * 3) * 0.03
      glowRef.current.scale.setScalar(scale)
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.4
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.4) * 0.15
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.3
      ring2Ref.current.rotation.x = Math.PI / 3 + Math.cos(t * 0.3) * 0.1
      ring2Ref.current.rotation.y = t * 0.2
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = t * 0.2
      ring3Ref.current.rotation.x = Math.PI / 4 + Math.sin(t * 0.5) * 0.2
      ring3Ref.current.rotation.y = -t * 0.15
    }
    if (shellRef.current) {
      shellRef.current.rotation.y = -t * 0.1
      shellRef.current.rotation.x = Math.sin(t * 0.15) * 0.2
    }
  })

  return (
    <group>
      {/* Core sphere */}
      <mesh ref={meshRef} material={shaderMaterial}>
        <icosahedronGeometry args={[1.5, 8]} />
      </mesh>

      {/* External glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>

      {/* Energy shell wireframe */}
      <mesh ref={shellRef}>
        <icosahedronGeometry args={[2.6, 1]} />
        <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.06} />
      </mesh>

      {/* Orbital ring 1 */}
      <mesh ref={ringRef}>
        <torusGeometry args={[2.2, 0.025, 8, 64]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.35} />
      </mesh>

      {/* Orbital ring 2 */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[2.8, 0.015, 8, 64]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.2} />
      </mesh>

      {/* Orbital ring 3 */}
      <mesh ref={ring3Ref} rotation={[Math.PI / 5, -Math.PI / 4, Math.PI / 6]}>
        <torusGeometry args={[3.2, 0.01, 8, 64]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.12} />
      </mesh>
    </group>
  )
}

/* ───── Aurora Ribbons ───── */
function AuroraRibbons() {
  const ribbons = useRef([])
  const count = 3

  const meshes = useMemo(() => Array.from({ length: count }, (_, i) => {
    const points = []
    for (let j = 0; j <= 80; j++) {
      const t = j / 80
      points.push(new THREE.Vector3(
        (t - 0.5) * 40,
        Math.sin(t * Math.PI * 3 + i * 1.5) * 3 + (i - 1) * 5,
        -10 - i * 4
      ))
    }
    const curve = new THREE.CatmullRomCurve3(points)
    const geo = new THREE.TubeGeometry(curve, 80, 0.3 + i * 0.1, 4, false)
    return {
      geo,
      color: ['#3b82f6', '#8b5cf6', '#06b6d4'][i],
      opacity: [0.04, 0.03, 0.025][i],
    }
  }), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    ribbons.current.forEach((ref, i) => {
      if (!ref) return
      ref.rotation.z = Math.sin(t * 0.15 + i) * 0.1
      ref.position.y = Math.sin(t * 0.2 + i * 2) * 1.5
      ref.position.x = Math.sin(t * 0.1 + i * 3) * 2
    })
  })

  return (
    <group>
      {meshes.map((m, i) => (
        <mesh key={i} ref={el => ribbons.current[i] = el} geometry={m.geo}>
          <meshBasicMaterial color={m.color} transparent opacity={m.opacity} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  )
}

/* ───── DNA Double Helix ───── */
function DNAHelix() {
  const groupRef = useRef()
  const helixData = useMemo(() => {
    const strand1 = [], strand2 = [], rungs = []
    for (let i = 0; i <= 60; i++) {
      const t = i / 60
      const angle = t * Math.PI * 6
      const y = (t - 0.5) * 20
      const r = 1.2
      strand1.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r))
      strand2.push(new THREE.Vector3(Math.cos(angle + Math.PI) * r, y, Math.sin(angle + Math.PI) * r))
      if (i % 4 === 0) rungs.push({ a: strand1[strand1.length - 1].clone(), b: strand2[strand2.length - 1].clone() })
    }
    const curve1 = new THREE.CatmullRomCurve3(strand1)
    const curve2 = new THREE.CatmullRomCurve3(strand2)
    return {
      geo1: new THREE.TubeGeometry(curve1, 60, 0.03, 4, false),
      geo2: new THREE.TubeGeometry(curve2, 60, 0.03, 4, false),
      rungs,
    }
  }, [])

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.2
    }
  })

  return (
    <group ref={groupRef} position={[12, 0, -5]}>
      <mesh geometry={helixData.geo1}>
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.15} />
      </mesh>
      <mesh geometry={helixData.geo2}>
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.15} />
      </mesh>
      {helixData.rungs.map((rung, i) => {
        const geo = new THREE.BufferGeometry().setFromPoints([rung.a, rung.b])
        return (
          <line key={i} geometry={geo}>
            <lineBasicMaterial color="#06b6d4" transparent opacity={0.08} />
          </line>
        )
      })}
    </group>
  )
}

/* ───── Wormhole Vortex ───── */
function WormholeVortex() {
  const ringsRef = useRef([])
  const ringCount = 12

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    ringsRef.current.forEach((ref, i) => {
      if (!ref) return
      const depth = ((t * 0.5 + i * 0.8) % 10)
      ref.position.z = -depth * 3 - 10
      ref.rotation.z = t * 0.3 + i * 0.5
      const scale = 0.3 + depth * 0.3
      ref.scale.setScalar(scale)
      ref.material.opacity = Math.max(0, 0.12 - depth * 0.012)
    })
  })

  return (
    <group position={[0, 0, -15]}>
      {Array.from({ length: ringCount }).map((_, i) => (
        <mesh key={i} ref={el => ringsRef.current[i] = el}>
          <torusGeometry args={[2, 0.015, 8, 32]} />
          <meshBasicMaterial
            color={i % 3 === 0 ? '#8b5cf6' : i % 3 === 1 ? '#3b82f6' : '#06b6d4'}
            transparent
            opacity={0.1}
          />
        </mesh>
      ))}
    </group>
  )
}

/* ───── Neural Particle Field (Enhanced with more particles + color variation) ───── */
function NeuralParticles({ count = 1200 }) {
  const mesh = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const data = useMemo(() => {
    const positions = []
    const colors = []
    const palette = [
      new THREE.Color('#3b82f6'),
      new THREE.Color('#8b5cf6'),
      new THREE.Color('#06b6d4'),
      new THREE.Color('#a855f7'),
      new THREE.Color('#60a5fa'),
      new THREE.Color('#ec4899'),
    ]

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 4 + Math.random() * 35
      positions.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        baseR: r,
        theta, phi,
        wobbleSpeed: 0.2 + Math.random() * 0.8,
        wobbleAmp: 0.15 + Math.random() * 0.4,
        orbitSpeed: (0.01 + Math.random() * 0.03) * (Math.random() > 0.5 ? 1 : -1),
        scale: 0.02 + Math.random() * 0.06,
        breatheOffset: Math.random() * Math.PI * 2,
        flashPhase: Math.random() * Math.PI * 2,
      })
      colors.push(palette[Math.floor(Math.random() * palette.length)])
    }
    return { positions, colors }
  }, [count])

  useFrame(({ clock }) => {
    if (!mesh.current) return
    const t = clock.getElapsedTime()

    for (let i = 0; i < count; i++) {
      const p = data.positions[i]
      const wobble = Math.sin(t * p.wobbleSpeed + p.breatheOffset) * p.wobbleAmp
      const orbit = p.orbitSpeed * t

      dummy.position.set(
        p.x + Math.sin(orbit + p.theta) * wobble + mousePos.x * (p.baseR * 0.025),
        p.y + Math.cos(t * 0.3 + p.breatheOffset) * 0.2 + mousePos.y * (p.baseR * 0.025),
        p.z + Math.sin(orbit) * wobble
      )

      // Random flash effect
      const flash = Math.sin(t * 4 + p.flashPhase) > 0.97 ? 2.5 : 1
      const breathe = 1 + Math.sin(t * 0.8 + p.breatheOffset) * 0.3
      dummy.scale.setScalar(p.scale * breathe * flash)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true
  })

  const colorArray = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = data.colors[i].r
      arr[i * 3 + 1] = data.colors[i].g
      arr[i * 3 + 2] = data.colors[i].b
    }
    return arr
  }, [count, data.colors])

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[1, 4, 4]}>
        <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
      </sphereGeometry>
      <meshBasicMaterial vertexColors transparent opacity={0.6} toneMapped={false} />
    </instancedMesh>
  )
}

/* ───── Energy Streams (Enhanced — more spiral density) ───── */
function EnergyStreams() {
  const groupRef = useRef()

  const streams = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const points = []
    const startAngle = (i / 6) * Math.PI * 2
    for (let j = 0; j < 60; j++) {
      const t = j / 60
      const angle = startAngle + t * Math.PI * 4
      const r = 2 + t * 14
      points.push(new THREE.Vector3(
        Math.cos(angle) * r,
        Math.sin(t * Math.PI * 4) * 2.5 + Math.cos(angle * 2) * 0.5,
        Math.sin(angle) * r
      ))
    }
    const curve = new THREE.CatmullRomCurve3(points)
    return {
      geo: new THREE.TubeGeometry(curve, 60, 0.018 + (i % 3) * 0.005, 3, false),
      color: ['#3b82f6', '#8b5cf6', '#06b6d4', '#a855f7', '#60a5fa', '#ec4899'][i],
    }
  }), [])

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      {streams.map((s, i) => (
        <mesh key={i} geometry={s.geo}>
          <meshBasicMaterial color={s.color} transparent opacity={0.08} />
        </mesh>
      ))}
    </group>
  )
}

/* ───── Constellation Network ───── */
function ConstellationWeb() {
  const groupRef = useRef()
  const points = useMemo(() => Array.from({ length: 25 }, () => ({
    pos: new THREE.Vector3(
      (Math.random() - 0.5) * 28,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20
    ),
  })), [])

  const lines = useMemo(() => {
    const geos = []
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        if (points[i].pos.distanceTo(points[j].pos) < 8) {
          geos.push(new THREE.BufferGeometry().setFromPoints([points[i].pos, points[j].pos]))
        }
      }
    }
    return geos
  }, [points])

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.04) * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {points.map((p, i) => (
        <mesh key={i} position={p.pos}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.4} />
        </mesh>
      ))}
      {lines.map((geo, i) => (
        <line key={i} geometry={geo}>
          <lineBasicMaterial color="#3b82f6" transparent opacity={0.06} />
        </line>
      ))}
    </group>
  )
}

/* ───── Orbital Rings with particles ───── */
function CosmicRings() {
  const refs = useRef([])
  const configs = useMemo(() => [
    { radius: 8, count: 24, tiltX: 0.3, tiltZ: 0.1, color: '#3b82f6', speed: 0.3 },
    { radius: 11, count: 20, tiltX: -0.5, tiltZ: 0.3, color: '#8b5cf6', speed: -0.22 },
    { radius: 14, count: 16, tiltX: 0.2, tiltZ: -0.4, color: '#06b6d4', speed: 0.15 },
    { radius: 17, count: 10, tiltX: -0.3, tiltZ: 0.5, color: '#a855f7', speed: -0.1 },
    { radius: 20, count: 8, tiltX: 0.4, tiltZ: -0.2, color: '#ec4899', speed: 0.07 },
  ], [])

  useFrame(({ clock }) => {
    refs.current.forEach((ref, i) => {
      if (!ref) return
      ref.rotation.y = clock.getElapsedTime() * configs[i].speed
    })
  })

  return (
    <>
      {configs.map((cfg, ri) => (
        <group key={ri} ref={el => refs.current[ri] = el} rotation={[cfg.tiltX, 0, cfg.tiltZ]}>
          {Array.from({ length: cfg.count }).map((_, i) => {
            const angle = (i / cfg.count) * Math.PI * 2
            return (
              <mesh key={i} position={[Math.cos(angle) * cfg.radius, 0, Math.sin(angle) * cfg.radius]}>
                <sphereGeometry args={[0.04, 4, 4]} />
                <meshBasicMaterial color={cfg.color} transparent opacity={0.45} />
              </mesh>
            )
          })}
        </group>
      ))}
    </>
  )
}

/* ───── Floating Wireframes ───── */
function CosmicShapes() {
  const shapes = useMemo(() => [
    { geo: 'icosahedron', pos: [7, 3, -5], scale: 0.5, color: '#3b82f6' },
    { geo: 'octahedron', pos: [-6, -4, -3], scale: 0.7, color: '#8b5cf6' },
    { geo: 'dodecahedron', pos: [5, -5, -7], scale: 0.45, color: '#06b6d4' },
    { geo: 'tetrahedron', pos: [-8, 5, -5], scale: 0.6, color: '#a855f7' },
    { geo: 'torus', pos: [10, -2, -6], scale: 0.4, color: '#60a5fa' },
    { geo: 'icosahedron', pos: [-10, -1, -8], scale: 0.4, color: '#8b5cf6' },
    { geo: 'octahedron', pos: [3, 7, -10], scale: 0.35, color: '#ec4899' },
    { geo: 'dodecahedron', pos: [-4, -7, -6], scale: 0.3, color: '#06b6d4' },
  ], [])

  return (
    <>
      {shapes.map((s, i) => (
        <Float key={i} speed={0.5 + i * 0.1} rotationIntensity={0.5} floatIntensity={0.7}>
          <mesh position={s.pos} scale={s.scale}>
            {s.geo === 'icosahedron' && <icosahedronGeometry args={[1, 0]} />}
            {s.geo === 'octahedron' && <octahedronGeometry args={[1, 0]} />}
            {s.geo === 'dodecahedron' && <dodecahedronGeometry args={[1, 0]} />}
            {s.geo === 'tetrahedron' && <tetrahedronGeometry args={[1, 0]} />}
            {s.geo === 'torus' && <torusGeometry args={[1, 0.3, 8, 16]} />}
            <meshBasicMaterial color={s.color} wireframe transparent opacity={0.1} />
          </mesh>
        </Float>
      ))}
    </>
  )
}

/* ───── Shooting Stars (Enhanced with more density + vertical) ───── */
function ShootingStars({ count = 8 }) {
  const refs = useRef([])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    refs.current.forEach((ref, i) => {
      if (!ref) return
      const speed = 0.3 + i * 0.06
      const cycle = ((t * speed + i * 2.7) % 10) / 10
      const isVertical = i > 5
      if (isVertical) {
        ref.position.x = -8 + i * 5 + Math.sin(i) * 4
        ref.position.y = 12 - cycle * 24
        ref.position.z = -5 + i * 1.5
        ref.scale.set(0.02, 0.5 + cycle * 3, 0.02)
      } else {
        ref.position.x = -20 + i * 5 + cycle * 40
        ref.position.y = 8 - cycle * 16 + Math.sin(i) * 3
        ref.position.z = -8 + i * 2
        ref.scale.set(0.5 + cycle * 3, 0.02, 0.02)
      }
      ref.material.opacity = cycle < 0.05 || cycle > 0.95 ? 0 : 0.6
    })
  })

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} ref={el => refs.current[i] = el}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial
            color={['#3b82f6', '#ffffff', '#8b5cf6', '#06b6d4', '#a855f7', '#ec4899', '#60a5fa', '#ffffff'][i % 8]}
            transparent opacity={0.5}
          />
        </mesh>
      ))}
    </>
  )
}

/* ───── Energy Pulse Rings (New — radiate from center) ───── */
function EnergyPulseRings() {
  const refs = useRef([])
  const count = 5

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    refs.current.forEach((ref, i) => {
      if (!ref) return
      const phase = ((t * 0.4 + i * 1.2) % 6) / 6
      const scale = 0.5 + phase * 8
      ref.scale.setScalar(scale)
      ref.material.opacity = Math.max(0, 0.15 * (1 - phase))
    })
  })

  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} ref={el => refs.current[i] = el} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1, 0.008, 4, 64]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? '#8b5cf6' : '#3b82f6'}
            transparent opacity={0.15}
          />
        </mesh>
      ))}
    </group>
  )
}

/* ═══════════ MAIN SCENE ═══════════ */
function Scene() {
  const { camera } = useThree()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    camera.position.x += (mousePos.x * 1.5 - camera.position.x) * 0.018
    camera.position.y += (mousePos.y * 1.0 - camera.position.y) * 0.018
    // Subtle camera breathing
    camera.position.z = 12 + Math.sin(t * 0.2) * 0.3
    camera.lookAt(0, 0, 0)
  })

  return (
    <>
      <color attach="background" args={['#0a0f1f']} />
      <fog attach="fog" args={['#0a0f1f', 15, 55]} />

      <Stars radius={60} depth={80} count={2000} factor={3} saturation={0.3} fade speed={0.5} />

      <AICoreOrb />
      <NeuralParticles count={1200} />
      <EnergyStreams />
      <ConstellationWeb />
      <CosmicRings />
      <CosmicShapes />
      <ShootingStars count={8} />
      <AuroraRibbons />
      <DNAHelix />
      <WormholeVortex />
      <EnergyPulseRings />
    </>
  )
}

const HeroScene = () => {
  const [visible, setVisible] = useState(true)
  const containerRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        frameloop={visible ? 'always' : 'never'}
      >
        <Scene />
      </Canvas>
    </div>
  )
}

export default HeroScene
