'use client'

import { Suspense, Component, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import dynamic from 'next/dynamic'

const ClockOrb = dynamic(() => import('./ClockOrb'), { ssr: false })
const ParticleField = dynamic(() => import('./ParticleField'), { ssr: false })

// Error boundary to catch Three.js / WebGL crashes without
// taking down the entire React application.
class WebGLErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: Error) {
    console.warn('WebGL/Three.js error caught by boundary:', error.message)
  }
  render() {
    if (this.state.hasError) return null // silently hide the 3D scene
    return this.props.children
  }
}

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
      <WebGLErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 7], fov: 45 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          dpr={[1, 1.5]}
          style={{ background: 'transparent' }}
          onCreated={({ gl }) => {
            // Prevent crash on WebGL context loss
            const canvas = gl.domElement
            canvas.addEventListener('webglcontextlost', (e) => {
              e.preventDefault()
              console.warn('WebGL context lost — pausing 3D scene')
              gl.setAnimationLoop(null)
            })
          }}
        >
          <SceneContent />
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  )
}
