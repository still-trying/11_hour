import confetti from 'canvas-confetti'

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

  confetti({
    particleCount,
    spread,
    colors,
    origin: { x: 0.5, y: 0.5 },
    disableForReducedMotion: true,
  })
}
