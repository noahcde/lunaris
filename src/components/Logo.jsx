import { cx } from '../lib/astro'

// Symbole Aligned : un croissant de lune et une étoile bleue, dans un carré arrondi.
export function LogoMark({ className = 'h-8 w-8' }) {
  return (
    <svg viewBox="0 0 32 32" className={cx('shrink-0', className)} aria-hidden="true">
      <defs>
        <mask id="aligned-crescent">
          <rect width="32" height="32" fill="white" />
          <circle cx="20.5" cy="12.5" r="7.5" fill="black" />
        </mask>
      </defs>
      <rect x="0.5" y="0.5" width="31" height="31" rx="9" fill="#09090b" stroke="#27272a" />
      <circle cx="15" cy="17" r="9" fill="#fafafa" mask="url(#aligned-crescent)" />
      <path d="M23 6.5 L24 9 L26.5 10 L24 11 L23 13.5 L22 11 L19.5 10 L22 9 Z" fill="#2563eb" />
    </svg>
  )
}

// Logo complet : symbole + « Aligned. ». `size` : sm (en-têtes de page), md (accueil), lg (connexion).
const SIZES = {
  sm: { mark: 'h-6 w-6', text: 'text-base', gap: 'gap-2' },
  md: { mark: 'h-8 w-8', text: 'text-xl', gap: 'gap-2.5' },
  lg: { mark: 'h-11 w-11', text: 'text-[34px]', gap: 'gap-3' },
}

export default function Logo({ size = 'md', className, as: Tag = 'p' }) {
  const s = SIZES[size]
  return (
    <Tag className={cx('flex items-center font-extrabold leading-none tracking-tight text-white', s.gap, s.text, className)}>
      <LogoMark className={s.mark} />
      <span>
        Aligned<span className="text-blue-600">.</span>
      </span>
    </Tag>
  )
}
