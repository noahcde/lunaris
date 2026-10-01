// Illustration : roue du zodiaque avec ses douze signes et une constellation lumineuse.
const GLYPHS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓']
const STARS = [
  [118, 92],
  [146, 110],
  [170, 98],
  [188, 128],
  [162, 150],
  [132, 142],
]

export default function ZodiacWheel({ className, spinning = false }) {
  const c = 160
  return (
    <svg viewBox="0 0 320 320" className={className} role="img" aria-label="Roue du zodiaque">
      <defs>
        <radialGradient id="zw-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.45" />
          <stop offset="55%" stopColor="#2563eb" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <filter id="zw-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>

      <circle cx={c} cy={c} r="150" fill="url(#zw-core)" />

      <g className={spinning ? 'origin-center animate-[spin_6s_linear_infinite]' : 'origin-center animate-[spin_90s_linear_infinite]'}>
        <circle cx={c} cy={c} r="138" fill="none" stroke="#27272a" />
        <circle cx={c} cy={c} r="108" fill="none" stroke="#27272a" />
        {GLYPHS.map((g, i) => {
          const a = (i * 30 - 90) * (Math.PI / 180)
          const t = ((i * 30 + 15 - 90) * Math.PI) / 180
          return (
            <g key={g}>
              <line
                x1={c + 108 * Math.cos(a)}
                y1={c + 108 * Math.sin(a)}
                x2={c + 138 * Math.cos(a)}
                y2={c + 138 * Math.sin(a)}
                stroke="#27272a"
              />
              <text
                x={c + 123 * Math.cos(t)}
                y={c + 123 * Math.sin(t)}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="15"
                fill="#a1a1aa"
                style={{ fontFamily: 'system-ui, sans-serif' }}
              >
                {g + '︎'}
              </text>
            </g>
          )
        })}
      </g>

      <circle cx={c} cy={c} r="78" fill="none" stroke="#2563eb" strokeOpacity="0.35" strokeDasharray="2 6" />

      <polyline
        points={STARS.map((p) => p.join(',')).join(' ')}
        fill="none"
        stroke="#a855f7"
        strokeOpacity="0.55"
        strokeWidth="1"
      />
      {STARS.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="4" fill="#a855f7" opacity="0.6" filter="url(#zw-glow)" />
          <circle cx={x} cy={y} r="1.8" fill="#fff" />
        </g>
      ))}

      <mask id="zw-crescent">
        <circle cx={c} cy={c + 26} r="15" fill="white" />
        <circle cx={c + 7} cy={c + 21} r="13" fill="black" />
      </mask>
      <circle cx={c} cy={c + 26} r="15" fill="#e4e4e7" mask="url(#zw-crescent)" style={{ filter: 'drop-shadow(0 0 8px rgba(168,85,247,0.7))' }} />
    </svg>
  )
}
