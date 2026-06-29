'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const BRAND = '#6C63FF'
const ACCENT = '#06B6D4'
const COUNT = 120
const ORBIT = 3.2

function ClockHands() {
  const hRef = useRef<THREE.Group>(null)
  const mRef = useRef<THREE.Group>(null)
  const sRef = useRef<THREE.Group>(null)

  useFrame(() => {
    const now = new Date()
    const h = now.getHours() % 12
    const m = now.getMinutes()
    const s = now.getSeconds()
    const ms = now.getMilliseconds()
    if (hRef.current) hRef.current.rotation.z = (h / 12) * Math.PI * 2 + (m / 60) * (Math.PI * 2) / 12
    if (mRef.current) mRef.current.rotation.z = (m / 60) * Math.PI * 2 + (s / 60) * (Math.PI * 2) / 60
    if (sRef.current) sRef.current.rotation.z = ((s + ms / 1000) / 60) * Math.PI * 2
  })

  return (
    <group>
      <group ref={hRef}><mesh position={[0, 0.9, 0]}><boxGeometry args={[0.12, 1.8, 0.12]} /><meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={0.3} /></mesh></group>
      <group ref={mRef}><mesh position={[0, 1.2, 0]}><boxGeometry args={[0.08, 2.4, 0.08]} /><meshStandardMaterial color={BRAND} emissive={BRAND} emissiveIntensity={0.4} /></mesh></group>
      <group ref={sRef}><mesh position={[0, 1.5, 0]}><boxGeometry args={[0.03, 3.0, 0.03]} /><meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={0.6} /></mesh></group>
      <mesh><sphereGeometry args={[0.15, 16, 16]} /><meshStandardMaterial color={BRAND} emissive={BRAND} emissiveIntensity={0.5} /></mesh>
    </group>
  )
}

function Particles() {
  const ref = useRef<THREE.Points>(null)
  const [positions, speeds, phases] = useMemo(() => {
    const p = new Float32Array(COUNT * 3)
    const sd = new Float32Array(COUNT)
    const ps = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      const t = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = ORBIT + (Math.random() - 0.5) * 1.2
      p[i*3] = r * Math.sin(phi) * Math.cos(t)
      p[i*3+1] = r * Math.cos(phi) * (0.3 + Math.random() * 0.4)
      p[i*3+2] = r * Math.sin(phi) * Math.sin(t)
      sd[i] = 0.2 + Math.random() * 0.4
      ps[i] = Math.random() * Math.PI * 2
    }
    return [p, sd, ps]
  }, [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const a = ref.current.geometry.attributes.position.array as Float32Array
    const t = clock.getElapsedTime()
    for (let i = 0; i < COUNT; i++) {
      const theta = t * speeds[i] + phases[i]
      const phi = Math.acos(2 * Math.sin(t * 0.1 + i) - 1)
      const r = ORBIT + Math.sin(t * 0.3 + i) * 0.3
      a[i*3] = r * Math.sin(phi) * Math.cos(theta)
      a[i*3+1] = r * Math.cos(phi) * 0.5
      a[i*3+2] = r * Math.sin(phi) * Math.sin(theta)
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute args={[positions, 3]} attach="attributes-position" />
      </bufferGeometry>
      <pointsMaterial size={0.06} color={ACCENT} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  )
}

function GlowRing() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.1
      ref.current.rotation.z += 0.003
    }
  })
  return (
    <mesh ref={ref} rotation={[Math.PI / 3, 0, 0]}>
      <torusGeometry args={[2.2, 0.02, 16, 64]} />
      <meshStandardMaterial color={BRAND} emissive={BRAND} emissiveIntensity={0.6} transparent opacity={0.5} />
    </mesh>
  )
}

function InnerCore() {
  const cRef = useRef<THREE.Mesh>(null)
  const wRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (cRef.current) { cRef.current.rotation.x = t * 0.1; cRef.current.rotation.y = t * 0.15 }
    if (wRef.current) {
      wRef.current.rotation.x = -t * 0.08; wRef.current.rotation.y = -t * 0.12
      wRef.current.scale.setScalar(1 + Math.sin(t * 0.5) * 0.03)
    }
  })
  return (
    <group>
      <mesh ref={cRef}><icosahedronGeometry args={[1.4, 1]} /><meshStandardMaterial color={BRAND} emissive={BRAND} emissiveIntensity={0.15} transparent opacity={0.3} /></mesh>
      <mesh ref={wRef}><icosahedronGeometry args={[1.6, 1]} /><meshStandardMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.3} wireframe transparent opacity={0.25} /></mesh>
    </group>
  )
}

export default function ClockOrb() {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.2
  })
  return (
    <group ref={ref}>
      <InnerCore />
      <GlowRing />
      <ClockHands />
      <Particles />
    </group>
  )
}
