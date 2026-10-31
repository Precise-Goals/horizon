import React, { useEffect, useRef } from 'react';

export interface DotMatrixGlobeProps {
  className?: string;
  theme?: 'light' | 'dark';
  scrollProgress?: number;
  rotationSpeed?: number;
}

export const DotMatrixGlobe: React.FC<DotMatrixGlobeProps> = ({
  className = '',
  theme = 'light',
  scrollProgress = 0,
  rotationSpeed = 0.045,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollRef = useRef<number>(scrollProgress);
  scrollRef.current = scrollProgress;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ─────────────────────────────────────────────────────────────
    // 1. High-Resolution Equirectangular Landmask (Oceans empty)
    // ─────────────────────────────────────────────────────────────
    const MAP_W = 1440;
    const MAP_H = 720;
    const mapCanvas = document.createElement('canvas');
    mapCanvas.width = MAP_W;
    mapCanvas.height = MAP_H;
    const mapCtx = mapCanvas.getContext('2d');
    if (!mapCtx) return;

    // Ocean is black (0) = transparent / no points
    mapCtx.fillStyle = '#000000';
    mapCtx.fillRect(0, 0, MAP_W, MAP_H);

    function toMap(lonDeg: number, latDeg: number): [number, number] {
      const x = ((lonDeg + 180) / 360) * MAP_W;
      const y = ((90 - latDeg) / 180) * MAP_H;
      return [x, y];
    }

    function drawPoly(coords: [number, number][]) {
      if (!mapCtx) return;
      mapCtx.fillStyle = '#ffffff';
      mapCtx.beginPath();
      for (let i = 0; i < coords.length; i++) {
        const [mx, my] = toMap(coords[i][0], coords[i][1]);
        if (i === 0) mapCtx.moveTo(mx, my);
        else mapCtx.lineTo(mx, my);
      }
      mapCtx.closePath();
      mapCtx.fill();
    }

    // Japan - Hokkaido
    drawPoly([[140, 45.5], [145.5, 45.5], [146, 43.5], [143, 41.8], [140, 42.2]]);

    // Japan - Honshu Main Island
    drawPoly([
      [141.5, 41.5], [142, 39.5], [141, 37], [140.5, 36], [139.7, 35.5], [137, 34.8],
      [135.5, 34.5], [132.5, 34.2], [131, 34], [131, 34.8], [133, 35.5], [136, 36.5],
      [138.5, 37.5], [140, 39], [140.8, 41],
    ]);

    // Japan - Shikoku & Kyushu
    drawPoly([[132.5, 34], [134.5, 34.2], [134.5, 33.3], [133, 33]]);
    drawPoly([[129.5, 33.5], [132, 33.8], [131.5, 31.2], [130, 31.2]]);

    // Korean Peninsula
    drawPoly([
      [124.5, 40], [128, 41.5], [130, 42], [130, 38.5], [129.5, 35.5],
      [127.5, 34.5], [126, 34.5], [125.5, 37], [124.5, 38.5],
    ]);

    // East Asia, China, Siberia, Mongolia
    drawPoly([
      [100, 75], [130, 73], [170, 68], [178, 64], [168, 60], [160, 52],
      [142, 50], [135, 48], [131, 43], [128, 42], [124, 40], [121, 39],
      [118, 38], [120, 35], [122, 32], [121, 30], [120, 27], [117, 24],
      [114, 22], [108, 21], [105, 19], [98, 15], [88, 22], [75, 28],
      [68, 35], [60, 42], [50, 50], [45, 60], [60, 68], [80, 74],
    ]);

    // Taiwan & Philippines
    drawPoly([[120, 25.5], [122, 25], [121.5, 22], [120, 22.5]]);
    drawPoly([[120, 18.5], [122, 18], [121.5, 14], [120.5, 14]]);
    drawPoly([[124, 14], [126, 12], [125, 9], [123, 10]]);

    // Kamchatka & Kuril Arc
    drawPoly([[156, 51], [159, 53], [163, 58], [163, 61], [159, 58], [156, 54]]);

    // Southeast Asia (Indochina, Malaysia, Indonesia)
    drawPoly([[102, 20], [108, 16], [109, 11], [105, 9], [101, 7], [99, 13]]);
    drawPoly([[95, 5], [105, -5], [115, -8], [125, -8], [115, 2], [100, 3]]);

    // South Asia & India
    drawPoly([[70, 24], [78, 30], [88, 26], [82, 15], [78, 8], [73, 16]]);

    // Middle East & Arabia
    drawPoly([[35, 30], [45, 35], [55, 28], [60, 22], [50, 14], [42, 15], [38, 26]]);

    // Europe & Scandinavia & Mediterranean
    drawPoly([
      [-10, 36], [-5, 43], [5, 43], [12, 45], [18, 40], [28, 41],
      [35, 46], [45, 50], [50, 60], [35, 68], [25, 71], [15, 68],
      [5, 62], [2, 52], [-4, 48],
    ]);
    // British Isles
    drawPoly([[-5, 50], [1, 52], [0, 58], [-4, 58], [-5, 55]]);
    drawPoly([[-10, 51], [-6, 51], [-6, 55], [-10, 54]]);

    // Africa & Madagascar
    drawPoly([
      [-15, 15], [-5, 35], [12, 37], [25, 32], [35, 28], [50, 12],
      [42, -5], [35, -25], [20, -34], [15, -30], [12, -15], [8, 5],
      [-5, 5], [-12, 8],
    ]);
    drawPoly([[44, -12], [50, -15], [47, -25], [44, -22]]);

    // North America (Alaska, Canada, USA, Mexico)
    drawPoly([
      [-168, 65], [-160, 71], [-130, 70], [-90, 75], [-60, 60], [-55, 50],
      [-65, 44], [-75, 35], [-80, 25], [-90, 28], [-98, 22], [-105, 20],
      [-110, 28], [-115, 30], [-122, 37], [-125, 48], [-135, 56], [-150, 60],
      [-165, 60],
    ]);

    // South America
    drawPoly([
      [-78, 10], [-60, 10], [-50, 0], [-35, -5], [-40, -22], [-55, -40],
      [-65, -55], [-72, -50], [-75, -20], [-80, -2],
    ]);

    // Australia & New Zealand
    drawPoly([
      [115, -18], [130, -12], [142, -10], [150, -20], [152, -28], [148, -35],
      [138, -36], [128, -32], [115, -28],
    ]);
    drawPoly([[168, -42], [174, -36], [178, -38], [172, -44]]);

    const mapData = mapCtx.getImageData(0, 0, MAP_W, MAP_H).data;

    function isLand(lonDeg: number, latDeg: number): boolean {
      let l = lonDeg % 360;
      if (l > 180) l -= 360;
      if (l < -180) l += 360;
      const x = Math.floor(((l + 180) / 360) * MAP_W);
      const y = Math.floor(((90 - latDeg) / 180) * MAP_H);
      if (x < 0 || x >= MAP_W || y < 0 || y >= MAP_H) return false;
      const idx = (y * MAP_W + x) * 4;
      return mapData[idx] > 60;
    }

    // ─────────────────────────────────────────────────────────────
    // 2. Fibonacci-Sphere Point Distribution (Golden Angle)
    // ─────────────────────────────────────────────────────────────
    interface SpherePoint {
      x: number;
      y: number;
      z: number;
      jitterX: number;
      jitterY: number;
    }

    // Golden angle in radians
    const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
    const TOTAL_POINTS = 46000;
    const landPoints: SpherePoint[] = [];

    // Simple deterministic pseudo-random hash for 0.3 to 0.6 px jitter
    function pseudoHash(val: number): number {
      const s = Math.sin(val * 12.9898 + 78.233) * 43758.5453;
      return s - Math.floor(s);
    }

    for (let i = 0; i < TOTAL_POINTS; i++) {
      // y goes from 1 down to -1
      const y = 1 - (2 * i) / (TOTAL_POINTS - 1);
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = GOLDEN_ANGLE * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      // Latitude and Longitude for landmask sampling
      const latDeg = (Math.asin(Math.max(-1, Math.min(1, y))) * 180) / Math.PI;
      const lonDeg = (Math.atan2(x, z) * 180) / Math.PI;

      if (isLand(lonDeg, latDeg)) {
        // 0.3 to 0.6 px fixed organic jitter per point
        const jMag = 0.3 + pseudoHash(i * 5 + 1) * 0.3; // 0.3 to 0.6
        const jAngle = pseudoHash(i * 5 + 2) * Math.PI * 2;
        landPoints.push({
          x,
          y,
          z,
          jitterX: Math.cos(jAngle) * jMag,
          jitterY: Math.sin(jAngle) * jMag,
        });
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 3. Render Loop with Scroll Parallax & Mouse Interactivity
    // ─────────────────────────────────────────────────────────────
    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const resize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || 600;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let mouseX = 0;
    let targetMouseX = 0;
    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let windowScrollY = window.scrollY;
    const handleScroll = () => {
      windowScrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    let startTime = performance.now();
    const PITCH = 0.38; // camera pitch looking slightly downward
    const cosPitch = Math.cos(PITCH);
    const sinPitch = Math.sin(PITCH);

    const render = () => {
      const now = performance.now();
      const elapsed = (now - startTime) * 0.001;

      // Mouse smoothing
      mouseX += (targetMouseX - mouseX) * 0.05;

      // Scroll progress tracking: if hero is roughly 800px tall
      const computedScroll = Math.max(0, Math.min(1, (scrollRef.current || (windowScrollY / 700))));

      // Scroll-linked transformations:
      // 1. Globe scales from 1 to 1.15 as user scrolls hero
      // 2. Slowly rotates toward next region (additional scroll angle)
      // 3. Fades out smoothly as hero leaves (opacity from 1 to 0)
      const scale = 1 + computedScroll * 0.15;
      const scrollRotation = computedScroll * 0.85;
      const heroFade = Math.max(0, 1 - computedScroll * 1.25);

      ctx.clearRect(0, 0, width, height);

      if (heroFade <= 0.01) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.globalAlpha = heroFade;

      // Geometry & Placement: Apex rises near top of container
      const globeCenterX = width * 0.5 + mouseX * 22;
      const apexY = 16;
      const baseRadius = Math.max(width * 0.72, height * 1.35);
      const radius = baseRadius * scale;
      const globeCenterY = apexY + radius;

      // Earth planetary spin around polar Y axis
      // Initial offset 2.45 rad centers Pacific Rim / Japan
      const timeRotation = prefersReducedMotion ? 0 : elapsed * rotationSpeed;
      const rotY = 2.45 + timeRotation + scrollRotation;
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      // Render points: pure black dots on off-white, no lines, no glow
      const numPoints = landPoints.length;
      for (let p = 0; p < numPoints; p++) {
        const pt = landPoints[p];

        // 1. Rotate around Earth polar axis (Y axis)
        const rx1 = pt.x * cosY + pt.z * sinY;
        const rz1 = -pt.x * sinY + pt.z * cosY;
        const ry1 = pt.y;

        // 2. Camera pitch tilt around X axis
        const rx2 = rx1;
        const ry2 = ry1 * cosPitch - rz1 * sinPitch;
        const rz2 = ry1 * sinPitch + rz1 * cosPitch;

        // Discard points facing away from camera (back hemisphere)
        if (rz2 <= 0.01) continue;

        // Screen projection
        const screenX = globeCenterX + rx2 * radius + pt.jitterX;
        const screenY = globeCenterY - ry2 * radius + pt.jitterY;

        // Cull if outside canvas boundaries
        if (screenX < -10 || screenX > width + 10 || screenY < -10 || screenY > height + 10) {
          continue;
        }

        // Distance from focus center:
        // Focus center is front-and-center of visible dome (rz2 close to 1).
        // Scaling: dot size and opacity scaled by distance from center:
        // large and dark at center, small and faint at edges.
        const focusFactor = Math.max(0, Math.min(1, rz2));
        const dotRadius = 0.8 + Math.pow(focusFactor, 1.4) * 1.85; // 0.8px to 2.65px
        const opacity = 0.16 + Math.pow(focusFactor, 1.2) * 0.78; // 0.16 to 0.94

        ctx.fillStyle = theme === 'light'
          ? `rgba(10, 10, 10, ${opacity.toFixed(3)})`
          : `rgba(45, 212, 191, ${opacity.toFixed(3)})`;

        ctx.beginPath();
        ctx.arc(screenX, screenY, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Restore alpha
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [theme, rotationSpeed]);

  return (
    <canvas
      ref={canvasRef}
      className={`block w-full h-full pointer-events-none select-none ${className}`}
      aria-label="3D Fibonacci-Sphere Halftone Earth Globe"
    />
  );
};

export default DotMatrixGlobe;
