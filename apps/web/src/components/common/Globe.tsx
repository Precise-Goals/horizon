import React, { useEffect, useRef } from 'react';

export interface GlobeProps {
  size?: number | string;
  crop?: 'bottom-rise' | 'side-peek' | 'corner' | 'full-small';
  rotationSpeed?: number;
  className?: string;
  interactive?: boolean;
}

export const Globe: React.FC<GlobeProps> = ({
  size = '100%',
  crop = 'bottom-rise',
  rotationSpeed = 0.007,
  className = '',
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isHoveredRef = useRef<boolean>(false);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Offscreen equirectangular landmask
    const MAP_W = 1440;
    const MAP_H = 720;
    const mapCanvas = document.createElement('canvas');
    mapCanvas.width = MAP_W;
    mapCanvas.height = MAP_H;
    const mapCtx = mapCanvas.getContext('2d');
    if (!mapCtx) return;

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

    // Japan
    drawPoly([[140, 45.5], [145.5, 45.5], [146, 43.5], [143, 41.8], [140, 42.2]]);
    drawPoly([
      [141.5, 41.5], [142, 39.5], [141, 37], [140.5, 36], [139.7, 35.5], [137, 34.8],
      [135.5, 34.5], [132.5, 34.2], [131, 34], [131, 34.8], [133, 35.5], [136, 36.5],
      [138.5, 37.5], [140, 39], [140.8, 41],
    ]);
    drawPoly([[132.5, 34], [134.5, 34.2], [134.5, 33.3], [133, 33]]);
    drawPoly([[129.5, 33.5], [132, 33.8], [131.5, 31.2], [130, 31.2]]);

    // Korea
    drawPoly([[124.5, 40], [128, 41.5], [130, 42], [130, 38.5], [129.5, 35.5], [127.5, 34.5], [126, 34.5], [125.5, 37], [124.5, 38.5]]);

    // East Asia & Siberia
    drawPoly([
      [100, 75], [130, 73], [170, 68], [178, 64], [168, 60], [160, 52],
      [142, 50], [135, 48], [131, 43], [128, 42], [124, 40], [121, 39],
      [118, 38], [120, 35], [122, 32], [121, 30], [120, 27], [117, 24],
      [114, 22], [108, 21], [105, 19], [98, 15], [88, 22], [75, 28],
      [68, 35], [60, 42], [50, 50], [45, 60], [60, 68], [80, 74],
    ]);

    // SE Asia & India & Australia
    drawPoly([[102, 20], [108, 16], [109, 11], [105, 9], [101, 7], [99, 13]]);
    drawPoly([[70, 24], [78, 30], [88, 26], [82, 15], [78, 8], [73, 16]]);
    drawPoly([[115, -18], [130, -12], [142, -10], [150, -20], [152, -28], [148, -35], [138, -36], [128, -32], [115, -28]]);

    // Europe & Americas
    drawPoly([[-10, 36], [-5, 43], [5, 43], [12, 45], [18, 40], [28, 41], [35, 46], [45, 50], [50, 60], [35, 68], [25, 71], [15, 68], [5, 62], [2, 52], [-4, 48]]);
    drawPoly([[-168, 65], [-160, 71], [-130, 70], [-90, 75], [-60, 60], [-55, 50], [-65, 44], [-75, 35], [-80, 25], [-90, 28], [-98, 22], [-105, 20], [-110, 28], [-115, 30], [-122, 37], [-125, 48], [-135, 56], [-150, 60], [-165, 60]]);
    drawPoly([[-78, 10], [-60, 10], [-50, 0], [-35, -5], [-40, -22], [-55, -40], [-65, -55], [-72, -50], [-75, -20], [-80, -2]]);

    const mapData = mapCtx.getImageData(0, 0, MAP_W, MAP_H).data;

    function isLand(lonDeg: number, latDeg: number): boolean {
      let l = lonDeg % 360;
      if (l > 180) l -= 360;
      if (l < -180) l += 360;
      const x = Math.floor(((l + 180) / 360) * MAP_W);
      const y = Math.floor(((90 - latDeg) / 180) * MAP_H);
      if (x < 0 || x >= MAP_W || y < 0 || y >= MAP_H) return false;
      return mapData[(y * MAP_W + x) * 4] > 60;
    }

    // 2. Fibonacci Sphere Point Cloud (Golden Angle)
    interface SpherePoint {
      x: number;
      y: number;
      z: number;
      jitterX: number;
      jitterY: number;
    }

    const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
    const TOTAL_POINTS = 38000;
    const landPoints: SpherePoint[] = [];

    function pseudoHash(val: number): number {
      const s = Math.sin(val * 12.9898 + 78.233) * 43758.5453;
      return s - Math.floor(s);
    }

    for (let i = 0; i < TOTAL_POINTS; i++) {
      const y = 1 - (2 * i) / (TOTAL_POINTS - 1);
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = GOLDEN_ANGLE * i;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      const latDeg = (Math.asin(Math.max(-1, Math.min(1, y))) * 180) / Math.PI;
      const lonDeg = (Math.atan2(x, z) * 180) / Math.PI;

      if (isLand(lonDeg, latDeg)) {
        const jMag = 0.3 + pseudoHash(i * 5 + 1) * 0.3; // 0.3 to 0.6 px organic jitter
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

    let width = 0;
    let height = 0;

    function resize() {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement?.clientWidth || 800;
      height = canvas.parentElement?.clientHeight || 600;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    let time = 0;
    const PITCH = 0.38;
    const cosPitch = Math.cos(PITCH);
    const sinPitch = Math.sin(PITCH);
    let animationFrameId: number;

    function render() {
      if (!isHoveredRef.current && !prefersReducedMotion) {
        time += rotationSpeed;
      }

      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      let globeCenterX = width * 0.5 + mouseRef.current.x * 24;
      let globeCenterY = height * 0.5 + mouseRef.current.y * 16;
      let radius = Math.min(width, height) * 0.45;

      if (crop === 'bottom-rise') {
        const apexY = 16;
        radius = Math.max(width * 0.72, height * 1.35);
        globeCenterX = width * 0.5 + mouseRef.current.x * 20;
        globeCenterY = apexY + radius;
      } else if (crop === 'side-peek') {
        globeCenterX = width * 0.85 + mouseRef.current.x * 15;
        globeCenterY = height * 0.5 + mouseRef.current.y * 15;
        radius = Math.min(width, height) * 0.65;
      } else if (crop === 'corner') {
        globeCenterX = width * 0.95 + mouseRef.current.x * 10;
        globeCenterY = height * 0.1 + mouseRef.current.y * 10;
        radius = Math.min(width, height) * 0.55;
      } else if (crop === 'full-small') {
        globeCenterX = width * 0.5;
        globeCenterY = height * 0.5;
        radius = Math.min(width, height) * 0.42;
      }

      const rotY = 2.45 + time * 0.08;
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      const numPoints = landPoints.length;
      for (let p = 0; p < numPoints; p++) {
        const pt = landPoints[p];

        const rx1 = pt.x * cosY + pt.z * sinY;
        const rz1 = -pt.x * sinY + pt.z * cosY;
        const ry1 = pt.y;

        const rx2 = rx1;
        const ry2 = ry1 * cosPitch - rz1 * sinPitch;
        const rz2 = ry1 * sinPitch + rz1 * cosPitch;

        if (rz2 <= 0.01) continue;

        const screenX = globeCenterX + rx2 * radius + pt.jitterX;
        const screenY = globeCenterY - ry2 * radius + pt.jitterY;

        if (screenX < -10 || screenX > width + 10 || screenY < -10 || screenY > height + 10) {
          continue;
        }

        const focusFactor = Math.max(0, Math.min(1, rz2));
        const dotRadius = 0.8 + Math.pow(focusFactor, 1.4) * 1.85;
        const opacity = 0.16 + Math.pow(focusFactor, 1.2) * 0.78;

        ctx.fillStyle = `rgba(10, 10, 10, ${opacity.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(screenX, screenY, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [crop, rotationSpeed]);

  const handleMouseEnter = () => {
    if (interactive) isHoveredRef.current = true;
  };

  const handleMouseLeave = () => {
    if (interactive) isHoveredRef.current = false;
    mouseRef.current.targetX = 0;
    mouseRef.current.targetY = 0;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mouseRef.current.targetX = x;
    mouseRef.current.targetY = y;
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{ width: size, height: size }}
      className={`relative overflow-hidden select-none ${className}`}
      aria-label="Horizon Dotted Halftone Globe"
    >
      <canvas ref={canvasRef} className="block w-full h-full pointer-events-none" />
      
      {/* Edge gradient mask */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            crop === 'bottom-rise'
              ? 'radial-gradient(ellipse 90% 70% at 50% 100%, transparent 60%, #FAFAF9 95%)'
              : crop === 'side-peek'
              ? 'radial-gradient(circle at 85% 50%, transparent 60%, #FAFAF9 95%)'
              : 'radial-gradient(circle at 50% 50%, transparent 65%, #FAFAF9 95%)',
        }}
      />
    </div>
  );
};

export default Globe;
