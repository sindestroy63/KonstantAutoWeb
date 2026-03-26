"use client";

import { useState } from "react";

const routes = [
  {
    id: "route-a",
    d: "M-60 540 C 180 470, 320 410, 520 430 S 860 560, 1120 520 1480 360, 1510 360",
    stroke: "rgba(255,255,255,0.16)",
    duration: "22s",
  },
  {
    id: "route-b",
    d: "M-40 650 C 180 620, 280 560, 480 560 S 780 690, 1020 650 1320 500, 1510 540",
    stroke: "rgba(255,92,92,0.34)",
    duration: "18s",
  },
  {
    id: "route-c",
    d: "M120 120 C 280 150, 420 240, 560 250 S 860 140, 1040 180 1300 320, 1500 260",
    stroke: "rgba(255,255,255,0.1)",
    duration: "24s",
  },
];

export function HeroRouteBackground() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 18;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 12;
        setOffset({ x, y });
      }}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      aria-hidden
    >
      <div
        className="absolute inset-0 transition-transform duration-500 ease-out"
        style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
      >
        <div className="absolute left-[-8%] top-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,84,84,0.16),transparent_68%)] blur-3xl" />
        <div className="absolute right-[-4%] top-4 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.08),transparent_72%)] blur-3xl" />
        <svg className="absolute inset-0 h-full w-full opacity-80" viewBox="0 0 1440 820" preserveAspectRatio="none">
          <defs>
            <filter id="hero-glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {routes.map((route) => (
            <path
              key={route.id}
              id={route.id}
              d={route.d}
              fill="none"
              stroke={route.stroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="8 12"
            />
          ))}

          <path
            d="M-20 600 C 220 540, 360 470, 560 500 S 940 650, 1240 560 1450 460, 1500 440"
            fill="none"
            stroke="rgba(255,92,92,0.18)"
            strokeWidth="22"
            strokeLinecap="round"
            filter="url(#hero-glow)"
          />

          <g className="hidden sm:block">
            <circle r="4" fill="#ff6363" filter="url(#hero-glow)">
              <animateMotion dur="18s" repeatCount="indefinite" rotate="auto">
                <mpath href="#route-b" />
              </animateMotion>
            </circle>
            <circle r="3.2" fill="#ffffff" opacity="0.9" filter="url(#hero-glow)">
              <animateMotion dur="22s" repeatCount="indefinite" rotate="auto">
                <mpath href="#route-a" />
              </animateMotion>
            </circle>
            <g filter="url(#hero-glow)">
              <rect x="-7" y="-3" width="14" height="6" rx="3" fill="rgba(255,255,255,0.9)" />
              <circle cx="-4" cy="4" r="1.7" fill="#0f172a" />
              <circle cx="4" cy="4" r="1.7" fill="#0f172a" />
              <animateMotion dur="24s" repeatCount="indefinite" rotate="auto">
                <mpath href="#route-c" />
              </animateMotion>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
