export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true" fill="none">
      <defs>
        <linearGradient id="brand-gradient" x1="16" y1="16" x2="106" y2="110" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF8E3C" />
          <stop offset="1" stopColor="#FF6A00" />
        </linearGradient>
        <filter id="brand-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#brand-glow)">
        <rect x="14" y="56" width="24" height="38" rx="12" fill="url(#brand-gradient)" />
        <rect x="44" y="40" width="24" height="54" rx="12" fill="url(#brand-gradient)" />
        <rect x="74" y="24" width="24" height="70" rx="12" fill="url(#brand-gradient)" />
        <rect x="74" y="70" width="34" height="24" rx="12" fill="url(#brand-gradient)" />
      </g>
    </svg>
  );
}
