/**
 * Celebratory Wedding Fireworks System
 * Creates a vibrant, romantic pyrotechnic spectacle across the screen
 * with multi-wave bursts, heart-shaped explosions, golden sparkles, and crackling trails.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  size: number;
  color: string;
  sparkle: boolean;
  history: { x: number; y: number }[];
}

interface Rocket {
  x: number;
  y: number;
  targetY: number;
  vx: number;
  vy: number;
  color: string;
  type: 'chrysanthemum' | 'heart' | 'ring' | 'glitter' | 'willow';
  exploded: boolean;
  trail: { x: number; y: number }[];
}

const WEDDING_COLORS = [
  '#FFD700', // Gold
  '#FFB703', // Warm Amber Gold
  '#FFF275', // Light Champagne
  '#E63946', // Imperial Red
  '#FF2E63', // Festive Rose Red
  '#FF758F', // Romantic Pink
  '#FF5964', // Coral Red
  '#FF9E00', // Deep Gold
  '#9D4EDD', // Royal Purple
  '#C77DFF', // Lavender Spark
  '#2EC4B6', // Emerald Glow
  '#FFFFFF', // Diamond White
];

export function triggerFireworks(durationMs: number = 4500) {
  if (typeof window === 'undefined') return;

  // Check if an existing canvas is still active, if so, we can reuse it
  let canvas = document.getElementById('wedding-fireworks-canvas') as HTMLCanvasElement | null;
  const isNew = !canvas;

  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'wedding-fireworks-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '999999';
    document.body.appendChild(canvas);
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Set resolution
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = (canvas.width = window.innerWidth * dpr);
  let height = (canvas.height = window.innerHeight * dpr);

  const handleResize = () => {
    if (!canvas) return;
    width = canvas.width = window.innerWidth * dpr;
    height = canvas.height = window.innerHeight * dpr;
  };
  window.addEventListener('resize', handleResize);

  const rockets: Rocket[] = [];
  const particles: Particle[] = [];

  const createRocket = (
    startX: number,
    targetY: number,
    color: string,
    type: 'chrysanthemum' | 'heart' | 'ring' | 'glitter' | 'willow' = 'chrysanthemum'
  ) => {
    const startY = height;
    const distanceY = startY - targetY;
    // Calculate vy to reach targetY with deceleration
    const vy = -Math.sqrt(2 * 0.12 * distanceY);
    const vx = (Math.random() - 0.5) * 2 * dpr;

    rockets.push({
      x: startX,
      y: startY,
      targetY,
      vx,
      vy,
      color,
      type,
      exploded: false,
      trail: [],
    });
  };

  const explode = (rocket: Rocket) => {
    const count = rocket.type === 'heart' ? 90 : rocket.type === 'willow' ? 120 : 80;
    const baseColor = rocket.color;

    if (rocket.type === 'heart') {
      // Parametric heart: x = 16 sin^3(t), y = -(13 cos(t) - 5 cos(2t) - 2 cos(3t) - cos(4t))
      for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 2;
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        const speed = (0.22 + Math.random() * 0.08) * dpr;
        const color = Math.random() > 0.4 ? baseColor : '#FFD700';

        particles.push({
          x: rocket.x,
          y: rocket.y,
          vx: hx * speed + (Math.random() - 0.5) * 0.4,
          vy: hy * speed + (Math.random() - 0.5) * 0.4,
          alpha: 1,
          decay: 0.012 + Math.random() * 0.008,
          size: (2.5 + Math.random() * 2) * dpr,
          color,
          sparkle: true,
          history: [],
        });
      }
    } else {
      // Spherical / chrysanthemum / willow explosion
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        let speed = (Math.random() * 6 + 1.5) * dpr;
        if (rocket.type === 'willow') {
          speed = (Math.random() * 4.5 + 1) * dpr;
        }

        const color =
          Math.random() > 0.3
            ? baseColor
            : WEDDING_COLORS[Math.floor(Math.random() * WEDDING_COLORS.length)];

        particles.push({
          x: rocket.x,
          y: rocket.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          decay:
            rocket.type === 'willow'
              ? 0.008 + Math.random() * 0.006 // Long lingering willow trails
              : 0.015 + Math.random() * 0.012,
          size: (rocket.type === 'glitter' ? 3.5 : 2.2 + Math.random() * 2) * dpr,
          color,
          sparkle: Math.random() > 0.4,
          history: [],
        });
      }
    }

    // Add extra golden shimmer core to every burst
    const sparklesCount = 25;
    for (let i = 0; i < sparklesCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 3 + 0.5) * dpr;
      particles.push({
        x: rocket.x,
        y: rocket.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        decay: 0.02 + Math.random() * 0.015,
        size: (1.8 + Math.random() * 1.5) * dpr,
        color: '#FFF275',
        sparkle: true,
        history: [],
      });
    }
  };

  // Launch orchestrated sequence of festive wedding fireworks
  const scheduleLaunch = (
    delayMs: number,
    xPercent: number,
    yPercent: number,
    color: string,
    type: 'chrysanthemum' | 'heart' | 'ring' | 'glitter' | 'willow'
  ) => {
    setTimeout(() => {
      createRocket(width * xPercent, height * yPercent, color, type);
    }, delayMs);
  };

  // Wave 1: Immediate celebratory dual opening (Left & Right)
  scheduleLaunch(50, 0.3, 0.28, '#E63946', 'chrysanthemum');
  scheduleLaunch(150, 0.7, 0.26, '#FFD700', 'glitter');

  // Wave 2: Centerpiece Romantic Heart Firework
  scheduleLaunch(600, 0.5, 0.22, '#FF1E56', 'heart');

  // Wave 3: Colorful celebratory blooms
  scheduleLaunch(1050, 0.22, 0.32, '#FFB703', 'willow');
  scheduleLaunch(1200, 0.78, 0.30, '#9D4EDD', 'chrysanthemum');

  // Wave 4: Golden shower & Double Heart finale
  scheduleLaunch(1700, 0.4, 0.25, '#FFD700', 'willow');
  scheduleLaunch(1850, 0.6, 0.27, '#FF2E63', 'heart');

  // Wave 5: High altitude diamond sparklers
  scheduleLaunch(2300, 0.32, 0.20, '#FFF275', 'glitter');
  scheduleLaunch(2450, 0.68, 0.22, '#2EC4B6', 'chrysanthemum');
  scheduleLaunch(2700, 0.5, 0.18, '#FFD700', 'willow');

  let animFrameId: number;
  const startTime = Date.now();

  const render = () => {
    // Clear with transparent fade for subtle light trails
    ctx.clearRect(0, 0, width, height);

    // 1. Update & Render Rockets
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      r.x += r.vx;
      r.y += r.vy;
      r.vy += 0.12 * dpr; // Gravity on ascent

      // Save trail
      r.trail.push({ x: r.x, y: r.y });
      if (r.trail.length > 7) r.trail.shift();

      // Draw rocket trail
      ctx.beginPath();
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 2.5 * dpr;
      ctx.shadowColor = r.color;
      ctx.shadowBlur = 8 * dpr;
      for (let t = 0; t < r.trail.length; t++) {
        const pt = r.trail[t];
        if (t === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw head
      ctx.beginPath();
      ctx.fillStyle = '#FFFFFF';
      ctx.arc(r.x, r.y, 2 * dpr, 0, Math.PI * 2);
      ctx.fill();

      // Check detonation when reaching peak velocity or height
      if (r.vy >= -0.5 || r.y <= r.targetY) {
        explode(r);
        rockets.splice(i, 1);
      }
    }

    // 2. Update & Render Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.history.push({ x: p.x, y: p.y });
      if (p.history.length > 4) p.history.shift();

      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.965; // Air friction
      p.vy *= 0.965;
      p.vy += 0.055 * dpr; // Gravity
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      const currentAlpha = p.sparkle && Math.random() > 0.5 ? p.alpha * 0.4 : p.alpha;
      ctx.globalAlpha = Math.max(0, currentAlpha);

      // Particle Trail
      if (p.history.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = p.color;
        ctx.lineWidth = (p.size * 0.6);
        ctx.moveTo(p.history[0].x, p.history[0].y);
        for (let h = 1; h < p.history.length; h++) {
          ctx.lineTo(p.history[h].x, p.history[h].y);
        }
        ctx.stroke();
      }

      // Particle Head
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6 * dpr;
      ctx.fill();
      ctx.restore();
    }

    // Check if still active
    const elapsed = Date.now() - startTime;
    if (elapsed < durationMs || rockets.length > 0 || particles.length > 0) {
      animFrameId = requestAnimationFrame(render);
    } else {
      // Clean up canvas
      window.removeEventListener('resize', handleResize);
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
  };

  animFrameId = requestAnimationFrame(render);

  return () => {
    cancelAnimationFrame(animFrameId);
    window.removeEventListener('resize', handleResize);
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  };
}
