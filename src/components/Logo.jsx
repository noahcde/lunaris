import { cx } from '../lib/astro'

// Logo Lunaris (fourni par Maxence) : un cercle et un point, comme deux phases de la Lune.
export function LogoMark({ className = 'h-8 w-8' }) {
  return (
    <svg viewBox="0 0 32 32" className={cx('shrink-0', className)} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#16141f" />
      <circle cx="16" cy="11" r="3.6" fill="none" stroke="#5b74e8" strokeWidth="1.4" />
      <circle cx="16" cy="20.5" r="3.8" fill="#7d6be6" />
    </svg>
  )
}

// Logo complet : symbole + « Lunaris ». `size` : sm (en-têtes de page), md (accueil), lg (connexion).
const SIZES = {
  sm: { mark: 'h-7 w-7', text: 'text-xl', gap: 'gap-2' },
  md: { mark: 'h-9 w-9', text: 'text-[26px]', gap: 'gap-2.5' },
  lg: { mark: 'h-12 w-12', text: 'text-[40px]', gap: 'gap-3' },
}

export default function Logo({ size = 'md', className, as: Tag = 'p' }) {
  const s = SIZES[size]
  return (
    <Tag className={cx('flex items-center leading-none', s.gap, s.text, className)}>
      <LogoMark className={s.mark} />
      <span className="font-logo font-medium tracking-tight text-[#e4e0f2]">Lunaris</span>
    </Tag>
  )
}
