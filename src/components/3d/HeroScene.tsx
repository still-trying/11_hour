'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import dynamic from 'next/dynamic'

const ClockOrb = dynamic(() => import('./ClockOrb'), { ssr: false })
const ParticleField = dynamic(() => import('./ParticleField'), { ssr: false })

function SceneContent() {
  return (
    <Suspense fallback={null}>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#6C63FF" />
      <pointLight position={[-5, -3, 2]} intensity={0.4} color="#06B6D4" />
      <ClockOrb />
      <ParticleField />
    </Suspense>
  )
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <SceneContent />
      </Canvas>
    </div>
  )
}
