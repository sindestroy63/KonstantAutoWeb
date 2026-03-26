const globalRoutes = [
  {
    id: "global-route-a",
    d: "M-120 180 C 180 120, 420 260, 700 220 S 1160 60, 1540 220 1760 340, 1880 300",
    stroke: "rgba(15,23,42,0.11)",
    width: 1.6,
    dash: "12 18",
  },
  {
    id: "global-route-b",
    d: "M-100 520 C 220 420, 420 520, 700 470 S 1160 330, 1480 420 1680 560, 1860 520",
    stroke: "rgba(196,0,0,0.14)",
    width: 1.8,
    dash: "10 20",
  },
  {
    id: "global-route-c",
    d: "M40 860 C 260 760, 460 860, 760 810 S 1200 670, 1520 780 1770 920, 1900 860",
    stroke: "rgba(15,23,42,0.08)",
    width: 1.5,
    dash: "14 22",
  },
  {
    id: "global-route-d",
    d: "M240 1120 C 420 1010, 720 1080, 940 1000 S 1350 820, 1640 940 1880 860, 1960 780",
    stroke: "rgba(196,0,0,0.1)",
    width: 1.4,
    dash: "8 18",
  },
];

function MiniCar({ routeId, duration, delay }: { routeId: string; duration: string; delay: string }) {
  return (
    <g opacity="0.85">
      <g>
        <rect x="-7" y="-3.2" width="14" height="6.4" rx="3.2" fill="rgba(15,23,42,0.66)" />
        <circle cx="-4.2" cy="4" r="1.6" fill="rgba(15,23,42,0.95)" />
        <circle cx="4.2" cy="4" r="1.6" fill="rgba(15,23,42,0.95)" />
        <animateMotion dur={duration} begin={delay} repeatCount="indefinite" rotate="auto">
          <mpath href={`#${routeId}`} />
        </animateMotion>
      </g>
      <circle r="10" fill="rgba(255,88,88,0.18)" filter="url(#global-route-glow)">
        <animateMotion dur={duration} begin={delay} repeatCount="indefinite" rotate="auto">
          <mpath href={`#${routeId}`} />
        </animateMotion>
      </circle>
    </g>
  );
}

export function GlobalRouteBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.8),transparent_38%),radial-gradient(circle_at_20%_20%,rgba(255,86,86,0.08),transparent_18%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.06),transparent_18%)]" />
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.72]"
        viewBox="0 0 1728 1400"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="global-route-glow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="global-route-accent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="50%" stopColor="rgba(255,88,88,0.22)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        {globalRoutes.map((route) => (
          <path
            key={route.id}
            id={route.id}
            d={route.d}
            fill="none"
            stroke={route.stroke}
            strokeWidth={route.width}
            strokeLinecap="round"
            strokeDasharray={route.dash}
          />
        ))}

        <path
          d="M-40 690 C 240 640, 440 700, 760 660 S 1230 520, 1520 610 1800 760, 1920 720"
          fill="none"
          stroke="url(#global-route-accent)"
          strokeWidth="30"
          strokeLinecap="round"
          filter="url(#global-route-glow)"
        />

        <g className="hidden md:block">
          <MiniCar routeId="global-route-a" duration="32s" delay="0s" />
          <MiniCar routeId="global-route-c" duration="36s" delay="-8s" />
          <circle r="3" fill="rgba(255,84,84,0.52)">
            <animateMotion dur="24s" repeatCount="indefinite" rotate="auto">
              <mpath href="#global-route-b" />
            </animateMotion>
          </circle>
          <circle r="2.5" fill="rgba(15,23,42,0.38)">
            <animateMotion dur="29s" begin="-11s" repeatCount="indefinite" rotate="auto">
              <mpath href="#global-route-d" />
            </animateMotion>
          </circle>
        </g>
      </svg>
    </div>
  );
}
