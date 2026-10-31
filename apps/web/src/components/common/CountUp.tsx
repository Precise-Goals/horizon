import React, { useEffect, useRef, useState } from 'react';

export interface CountUpProps {
  end: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const CountUp: React.FC<CountUpProps> = ({
  end,
  duration = 1400,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const [value, setValue] = useState(0);
  const elementRef = useRef<HTMLSpanElement | null>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setValue(end);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let startTime: number | null = null;

          const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease out quart
            const easeOut = 1 - Math.pow(1 - progress, 4);
            const current = easeOut * end;
            setValue(current);

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setValue(end);
            }
          };

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  const formatted = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString();

  return (
    <span ref={elementRef} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

export default CountUp;

