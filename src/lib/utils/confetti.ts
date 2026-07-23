/**
 * Confetti Utility
 *
 * Fires a lightweight CSS-based confetti burst for task completion celebrations.
 * Uses DOM manipulation to create and animate particles, then cleans up.
 */

export interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  origin?: { x?: number; y?: number };
}

const CONFETTI_COLORS = [
  '#F59E0B', // amber
  '#6C63FF', // purple
  '#22D3EE', // cyan
  '#EC4899', // pink
  '#10B981', // green
  '#F97316', // orange
];

/**
 * Fires a confetti animation from the center of the viewport.
 */
export function fireConfetti(options: ConfettiOptions = {}): void {
  const { particleCount = 30, spread = 60, origin = { x: 0.5, y: 0.5 } } = options;

  if (typeof document === 'undefined') return;

  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 99999;
    overflow: hidden;
  `;
  document.body.appendChild(container);

  const originX = (origin.x ?? 0.5) * window.innerWidth;
  const originY = (origin.y ?? 0.5) * window.innerHeight;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    const size = Math.random() * 6 + 4;
    const angle = ((Math.random() - 0.5) * spread * Math.PI) / 180;
    const velocity = Math.random() * 400 + 200;
    const rotation = Math.random() * 360;

    particle.style.cssText = `
      position: absolute;
      left: ${originX}px;
      top: ${originY}px;
      width: ${size}px;
      height: ${size * 0.6}px;
      background: ${color};
      border-radius: 2px;
      transform: rotate(${rotation}deg);
      opacity: 1;
    `;

    container.appendChild(particle);

    const dx = Math.sin(angle) * velocity;
    const dy = -Math.abs(Math.cos(angle) * velocity);

    particle.animate(
      [
        { transform: `translate(0, 0) rotate(${rotation}deg)`, opacity: 1 },
        {
          transform: `translate(${dx}px, ${dy + 600}px) rotate(${rotation + 720}deg)`,
          opacity: 0,
        },
      ],
      {
        duration: 1200 + Math.random() * 600,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fill: 'forwards',
      },
    );
  }

  // Clean up after animation
  setTimeout(() => {
    container.remove();
  }, 2500);
}
