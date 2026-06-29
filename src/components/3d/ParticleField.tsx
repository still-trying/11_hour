'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COUNT = 300

export default function ParticleField() {
  const ref = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const pos = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5
    }
    return pos
  }, [])

  const velocities = useRef(new Float32Array(COUNT * 3))
  const velocitiesInitialized = useRef(false)
  // Initialize velocities once
  if (!velocitiesInitialized.current) {
    for (let i = 0; i < COUNT * 3; i++) {
      velocities.current[i] = (Math.random() - 0.5) * 0.002
    }
    velocitiesInitialized.current = true
  }

  useFrame(() => {
    if (!ref.current) return
    const pos = ref.current.geometry.attributes.position.array as Float32Array
    const vel = velocities.current
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] += vel[i * 3]
      pos[i * 3 + 1] += vel[i * 3 + 1]
      pos[i * 3 + 2] += vel[i * 3 + 2]
      if (Math.abs(pos[i * 3]) > 10) vel[i * 3] *= -1
      if (Math.abs(pos[i * 3 + 1]) > 10) vel[i * 3 + 1] *= -1
      if (Math.abs(pos[i * 3 + 2]) > 10) vel[i * 3 + 2] *= -1
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute args={[positions, 3]} attach="attributes-position" />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#6C63FF" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  )
}
