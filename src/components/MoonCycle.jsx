import { useMemo } from 'react'
import { Moon } from 'lucide-react'
import { capitalize, cx, moonEvents } from '../lib/astro'

// Conseil associé à chaque grande phase, indépendant de l'abonnement.
const ADVICE = [
  'Poser une intention nouvelle.',
  'Passer à l’action et persévérer.',
  'Récolter, célébrer, partager.',
  'Trier et lâcher ce qui pèse.',
]

function QuarterIcon({ quarter }) {
  // 0 nouvelle lune, 1 premier quartier (moitié droite), 2 pleine lune, 3 dernier quartier (moitié gauche).
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden="true">
      <circle cx="16" cy="16" r="11" fill="#18181b" stroke="#3f3f46" />
      {quarter === 2 && <circle cx="16" cy="16" r="11" fill="#e4e4e7" />}
      {quarter === 1 && <path d="M16 5 A11 11 0 0 1 16 27 Z" fill="#e4e4e7" />}
      {quarter === 3 && <path d="M16 5 A11 11 0 0 0 16 27 Z" fill="#e4e4e7" />}
    </svg>
  )
}

export default function MoonCycle({ from, days, title, onPick, className }) {
  const events = useMemo(() => moonEvents(from, days), [from.getTime(), days])

  return (
    <section className={cx('mt-8', className)}>
      <div className="flex items-center gap-2">
        <Moon className="h-3.5 w-3.5 text-blue-500" strokeWidth={2} />
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{title}</h2>
      </div>
      <ul className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-3">
        {events.map(({ date, quarter, name }) => (
          <li key={date.toDateString()}>
            <button
              type="button"
              onClick={() => onPick(date)}
              className="flex w-full items-center gap-3 rounded-xl border border-zinc-900 bg-zinc-950 p-3.5 text-left transition-all duration-300 ease-in-out hover:border-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <QuarterIcon quarter={quarter} />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-white">{name}</span>
                <span className="block text-xs text-zinc-400">
                  {capitalize(date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }))}
                </span>
                <span className="mt-1 block text-xs text-zinc-500">{ADVICE[quarter]}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
