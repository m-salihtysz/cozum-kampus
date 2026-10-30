// Decorative hills, lake and pines for the Gündem hero (soft sage tones, no text, hidden from assistive tech).
export function HeroLandscape() {
  const pine = (x: number, h: number, o = 1) => (
    <g key={x} transform={`translate(${x} ${250 - h})`} opacity={o} fill="#6f9479">
      <polygon points={`0,0 ${h * 0.22},${h * 0.42} ${-h * 0.22},${h * 0.42}`} />
      <polygon points={`0,${h * 0.22} ${h * 0.28},${h * 0.7} ${-h * 0.28},${h * 0.7}`} />
      <polygon points={`0,${h * 0.45} ${h * 0.34},${h} ${-h * 0.34},${h}`} />
    </g>
  );
  return (
    <svg aria-hidden viewBox="0 0 1200 260" preserveAspectRatio="xMaxYMax slice" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3f6ec" />
          <stop offset="1" stopColor="#e2ebd9" />
        </linearGradient>
        <linearGradient id="lake" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#cfe0d2" stopOpacity="0" />
          <stop offset="0.5" stopColor="#c3d8c8" stopOpacity="0.95" />
          <stop offset="1" stopColor="#b3ccba" stopOpacity="1" />
        </linearGradient>
      </defs>
      <rect width="1200" height="260" fill="url(#sky)" />
      <polygon points="520,170 700,60 790,120 880,40 1030,150 1200,90 1200,260 520,260" fill="#d5e2cd" opacity="0.8" />
      <polygon points="600,190 760,100 860,160 980,80 1200,190 1200,260 600,260" fill="#c3d6bc" opacity="0.9" />
      <rect x="0" y="196" width="1200" height="64" fill="url(#lake)" />
      <path d="M0 222 C 240 200, 520 238, 800 210 S 1120 214, 1200 200 L1200 260 L0 260 Z" fill="#a9c5b0" opacity="0.45" />
      {pine(1010, 110, 0.9)}
      {pine(1060, 150)}
      {pine(1115, 120, 0.95)}
      {pine(1165, 165)}
      <ellipse cx="860" cy="230" rx="120" ry="10" fill="#ffffff" opacity="0.35" />
    </svg>
  );
}
