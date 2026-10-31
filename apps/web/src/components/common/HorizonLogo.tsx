import React from 'react';

export interface HorizonLogoProps {
  size?: number | string;
  className?: string;
}

export const HorizonLogo: React.FC<HorizonLogoProps> = ({
  size = 32,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Horizon Logo"
    >
      {/* Back planetary orbit ring (loops behind the bars) */}
      <g transform="rotate(-21 60 52)">
        <path
          d="M 14,52 A 46,13.5 0 0,1 106,52"
          stroke="#0A0A0A"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="0.8 3"
          opacity="0.8"
        />
        <path
          d="M 16,51 A 44,12.5 0 0,1 104,51"
          stroke="#0A0A0A"
          strokeWidth="1.1"
          strokeDasharray="0.5 4"
          opacity="0.45"
        />
      </g>

      {/* Left slanted pill bar: tilted 30 deg clockwise, shifted upward-left */}
      <rect
        x="36"
        y="20"
        width="16"
        height="52"
        rx="8"
        fill="#0A0A0A"
        transform="rotate(30 44 46)"
      />

      {/* Center core dot */}
      <circle cx="60" cy="52" r="7.5" fill="#0A0A0A" />

      {/* Right slanted pill bar: tilted 30 deg clockwise, shifted downward-right */}
      <rect
        x="68"
        y="32"
        width="16"
        height="52"
        rx="8"
        fill="#0A0A0A"
        transform="rotate(30 76 58)"
      />

      {/* Cutout mask behind front ring so it cleanly cuts across the left bar */}
      <g transform="rotate(-21 60 52)">
        <path
          d="M 106,52 A 46,13.5 0 0,1 14,52"
          stroke="#FAFAF9"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Front main orbital stipple band */}
        <path
          d="M 106,52 A 46,13.5 0 0,1 14,52"
          stroke="#0A0A0A"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray="1.2 3"
        />
        <path
          d="M 104,53 A 44,12.8 0 0,1 16,53"
          stroke="#0A0A0A"
          strokeWidth="1.3"
          strokeDasharray="0.6 3.6"
          opacity="0.75"
        />
        <path
          d="M 102,54 A 42,12 0 0,1 18,54"
          stroke="#0A0A0A"
          strokeWidth="0.9"
          strokeDasharray="0.4 4.2"
          opacity="0.4"
        />
      </g>
    </svg>
  );
};

export default HorizonLogo;
