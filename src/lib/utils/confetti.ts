export function fireConfetti(options?: {
  particleCount?: number
  spread?: number
  colors?: string[]
}) {
  const {
    particleCount = 40,
    spread = 60,
    colors = ['#6C63FF', '#22D3EE', '#10B981', '#F59E0B', '#EF4444', '#EC4899'],
  } = options || {}

  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999'
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')!
  const particles: {
    x: number; y: number; vx: number; vy: number
    size: number; color: string; rotation: number
    rotationSpeed: number; opacity: number
  }[] = []

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI / 180) * (Math.random() * spread - spread / 2)
    const velocity = 3 + Math.random() * 6
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: Math.cos(angle) * velocity * (0.5 + Math.random()),
      vy: Math.sin(angle) * velocity * (0.5 + Math.random()) - 4,
      size: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
    })
  }

  let frame = 0
  const maxFrames = 90

  function animate() {
    frame++
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const p of particles) {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.15
      p.rotation += p.rotationSpeed
      p.opacity = Math.max(0, 1 - frame / maxFrames)

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate((p.rotation * Math.PI) / 180)
      ctx.globalAlpha = p.opacity
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
      ctx.restore()
    }

    if (frame < maxFrames) {
      requestAnimationFrame(animate)
    } else {
      canvas.remove()
    }
  }

  animate()
}
