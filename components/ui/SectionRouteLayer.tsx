type SectionRouteLayerProps = {
  variant?: "light" | "dark";
  pattern?: "alpha" | "beta" | "gamma";
};

const patternRoutes = {
  alpha: [
    "M-60 520 C 180 460, 340 540, 560 500 S 920 360, 1220 420 1460 600, 1540 540",
    "M140 140 C 300 180, 420 300, 640 280 S 980 150, 1200 230 1460 320, 1540 280",
    "M40 700 C 260 620, 420 700, 660 660 S 1120 520, 1400 620 1540 700, 1600 660",
  ],
  beta: [
    "M-100 240 C 120 160, 360 260, 620 220 S 1020 60, 1320 170 1540 220, 1600 180",
    "M20 520 C 260 430, 460 560, 760 500 S 1100 330, 1360 420 1560 500, 1640 460",
    "M220 760 C 420 670, 700 760, 980 700 S 1320 560, 1540 640 1640 720, 1700 690",
  ],
  gamma: [
    "M-80 420 C 180 350, 400 430, 660 390 S 1020 260, 1280 330 1540 480, 1620 430",
    "M80 110 C 260 180, 460 240, 720 220 S 1120 100, 1360 170 1520 260, 1600 220",
    "M100 730 C 340 650, 520 760, 820 720 S 1180 570, 1460 660 1600 760, 1660 720",
  ],
} as const;

function MiniCar({
  routeId,
  duration,
  color,
  wheel,
  glow,
  delay,
}: {
  routeId: string;
  duration: string;
  color: string;
  wheel: string;
  glow: string;
  delay: string;
}) {
  return (
    <g opacity="0.9">
      <circle r="9" fill={glow} filter="url(#section-route-glow)">
        <animateMotion dur={duration} begin={delay} repeatCount="indefinite" rotate="auto">
          <mpath href={`#${routeId}`} />
        </animateMotion>
      </circle>
      <g>
        <rect x="-6.5" y="-2.8" width="13" height="5.6" rx="2.8" fill={color} />
        <circle cx="-3.8" cy="3.6" r="1.4" fill={wheel} />
        <circle cx="3.8" cy="3.6" r="1.4" fill={wheel} />
        <animateMotion dur={duration} begin={delay} repeatCount="indefinite" rotate="auto">
          <mpath href={`#${routeId}`} />
        </animateMotion>
      </g>
    </g>
  );
}

export function SectionRouteLayer({
  variant = "light",
  pattern = "alpha",
}: SectionRouteLayerProps) {
  const routes = patternRoutes[pattern];
  const isDark = variant === "dark";
  const stroke = isDark ? "rgba(255,255,255,0.14)" : "rgba(15,23,42,0.12)";
  const accent = isDark ? "rgba(255,84,84,0.22)" : "rgba(196,0,0,0.12)";
  const dot = isDark ? "rgba(255,255,255,0.55)" : "rgba(15,23,42,0.38)";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className={`absolute inset-0 ${
          isDark
            ? "bg-[radial-gradient(circle_at_top_left,rgba(255,82,82,0.14),transparent_26%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.06),transparent_24%)]"
            : "bg-[radial-gradient(circle_at_top_left,rgba(255,82,82,0.08),transparent_24%),radial-gradient(circle_at_80%_20%,rgba(15,23,42,0.05),transparent_22%)]"
        }`}
      />
      <svg
        className={`absolute inset-0 h-full w-full ${isDark ? "opacity-90" : "opacity-100"}`}
        viewBox="0 0 1440 760"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="section-route-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {routes.map((route, index) => (
          <path
            key={`${pattern}-${index}`}
            id={`${pattern}-${variant}-${index}`}
            d={route}
            fill="none"
            stroke={index === 1 ? accent : stroke}
            strokeWidth={index === 1 ? "1.8" : "1.4"}
            strokeLinecap="round"
            strokeDasharray={index === 1 ? "10 18" : "12 20"}
          />
        ))}

        <path
          d={routes[1]}
          fill="none"
          stroke={accent}
          strokeWidth="20"
          strokeLinecap="round"
          filter="url(#section-route-glow)"
        />

        <g className="hidden md:block">
          <MiniCar
            routeId={`${pattern}-${variant}-0`}
            duration="28s"
            delay="0s"
            color={isDark ? "rgba(255,255,255,0.88)" : "rgba(15,23,42,0.62)"}
            wheel={isDark ? "rgba(15,23,42,0.95)" : "rgba(15,23,42,0.92)"}
            glow={isDark ? "rgba(255,92,92,0.22)" : "rgba(255,92,92,0.16)"}
          />
          <MiniCar
            routeId={`${pattern}-${variant}-2`}
            duration="32s"
            delay="-9s"
            color={isDark ? "rgba(255,255,255,0.8)" : "rgba(15,23,42,0.52)"}
            wheel={isDark ? "rgba(15,23,42,0.95)" : "rgba(15,23,42,0.86)"}
            glow={isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.08)"}
          />
          <circle r="2.6" fill={dot}>
            <animateMotion dur="22s" repeatCount="indefinite" rotate="auto">
              <mpath href={`#${pattern}-${variant}-1`} />
            </animateMotion>
          </circle>
        </g>
      </svg>
    </div>
  );
}
