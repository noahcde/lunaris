import { cx } from '../lib/astro'

// Icône Lunaris (fournie par Maxence) : un cercle et un point, comme deux phases de la Lune.
export function LogoMark({ className = 'h-8 w-8' }) {
  return (
    <svg viewBox="0 0 32 32" className={cx('shrink-0', className)} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#16141f" />
      <circle cx="16" cy="11" r="3.6" fill="none" stroke="#5b74e8" strokeWidth="1.4" />
      <circle cx="16" cy="20.5" r="3.8" fill="#7d6be6" />
    </svg>
  )
}

// Les quatre phases du logo : nouvelle lune, croissant, premier quartier, pleine lune.
const MOONS = [
  { cx: 30, color: '#5b74e8', lit: null },
  { cx: 91, color: '#6470e7', lit: 'crescent' },
  { cx: 152, color: '#746ce6', lit: 'half' },
  { cx: 213, color: '#7d6be6', lit: 'full' },
]

export function LogoMoons({ className = 'h-6' }) {
  const R = 26.5
  return (
    <svg viewBox="0 0 243 60" className={cx('shrink-0', className)} aria-hidden="true">
      {MOONS.map(({ cx: x, color, lit }) =>
        lit === 'full' ? (
          <circle key={x} cx={x} cy="30" r="24" fill={color} />
        ) : (
          <g key={x}>
            <circle cx={x} cy="30" r={R - 3} fill="none" stroke={color} strokeWidth="6" />
            {lit === 'half' && <path d={`M${x} ${30 - R} A${R} ${R} 0 0 1 ${x} ${30 + R} Z`} fill={color} />}
            {lit === 'crescent' && (
              <path d={`M${x} ${30 - R} A${R} ${R} 0 0 1 ${x} ${30 + R} A11 ${R} 0 0 0 ${x} ${30 - R} Z`} fill={color} />
            )}
          </g>
        ),
      )}
    </svg>
  )
}

// Logo complet : petite icône + « Lunaris » sur téléphone, les quatre lunes sur ordinateur.
// `size` : sm (en-têtes de page), md (accueil), lg (connexion ; lunes empilées au-dessus du nom sur ordinateur).
const SIZES = {
  sm: { mark: 'h-7 w-7', moons: 'lg:h-[18px]', text: 'text-xl', gap: 'gap-2 lg:gap-2.5' },
  md: { mark: 'h-9 w-9', moons: 'lg:h-6', text: 'text-[26px]', gap: 'gap-2.5 lg:gap-3' },
  lg: { mark: 'h-12 w-12', moons: 'lg:h-12', text: 'text-[40px] lg:text-[44px]', gap: 'gap-3 lg:gap-4' },
}

export default function Logo({ size = 'md', className, as: Tag = 'p' }) {
  const s = SIZES[size]
  return (
    <Tag
      className={cx(
        'flex items-center leading-none',
        size === 'lg' && 'lg:flex-col lg:items-start',
        s.gap,
        s.text,
        className,
      )}
    >
      <LogoMark className={cx(s.mark, 'lg:hidden')} />
      <LogoMoons className={cx('hidden lg:block', s.moons)} />
      <span className="font-logo font-medium tracking-tight text-[#e4e0f2]">Lunaris</span>
    </Tag>
  )
}
