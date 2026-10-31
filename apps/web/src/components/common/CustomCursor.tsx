import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [follower, setFollower] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on pointer fine devices (no touchscreens)
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let animFrame: number;

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      setPosition({ x: targetX, y: targetY });
      if (!isVisible) setIsVisible(true);

      // Check if target is an interactive element
      const target = e.target as HTMLElement;
      const interactive = target?.closest('button, a, input, textarea, [role="button"], .cursor-pointer');
      setIsHovered(!!interactive);
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    const loop = () => {
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;
      setFollower({ x: currentX, y: currentY });
      animFrame = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    animFrame = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animFrame);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden" aria-hidden="true">
      {/* Precision Center Dot */}
      <div
        className="fixed -top-1 -left-1 w-2 h-2 rounded-full bg-[#22D3EE] transition-transform duration-75"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${isHovered ? 1.5 : 1})`,
        }}
      />
      {/* Smooth Trailing Reticle Ring */}
      <div
        className="fixed -top-4 -left-4 w-8 h-8 rounded-full border border-[#6366F1]/50 transition-all duration-150 ease-out"
        style={{
          transform: `translate3d(${follower.x}px, ${follower.y}px, 0) scale(${isHovered ? 1.8 : 1})`,
          backgroundColor: isHovered ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
          borderColor: isHovered ? '#22D3EE' : 'rgba(99, 102, 241, 0.4)',
        }}
      />
    </div>
  );
};

export default CustomCursor;

