import { useMemo } from 'react'
import { ChevronRight, Sparkles } from 'lucide-react'
import { LOCKED_TEXT } from './Paywall'
import { addDays, capitalize, cx, getDayInfo } from '../lib/astro'

// Les trois prochains jours de haute manifestation.
export default function UpcomingWindows({ today, onPick, locked, listClassName = 'flex flex-col gap-2' }) {
  const windows = useMemo(() => {
    const found = []
    for (let i = 1; found.length < 3 && i < 90; i++) {
      const date = addDays(today, i)
      const info = getDayInfo(date)
      if (info.status === 'high') found.push({ date, info })
    }
    return found
  }, [today])

  return (
    <section>
      <div className="flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-purple-500" strokeWidth={2} />
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Prochaines fenêtres
        </h2>
      </div>
      <ul className={cx('mt-3', listClassName)}>
        {windows.map(({ date, info }) => (
          <li key={date.toDateString()}>
            <button
              type="button"
              onClick={() => onPick(date)}
              className="group flex w-full items-center gap-3.5 rounded-xl border border-zinc-900 bg-zinc-950 px-3 py-3 text-left transition-all duration-300 ease-in-out hover:border-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <span className="flex w-11 shrink-0 flex-col items-center rounded-lg border border-purple-500/40 py-1.5">
                <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-zinc-400">
                  {date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')}
                </span>
                <span className="text-base font-semibold tabular-nums leading-tight text-white">
                  {date.getDate()}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-white">
                  {capitalize(date.toLocaleDateString('fr-FR', { weekday: 'long' }))}
                </span>
                <span
                  aria-hidden={locked}
                  className={cx('mt-0.5 block text-xs leading-snug text-zinc-400', locked && LOCKED_TEXT)}
                >
                  {info.note}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-zinc-600 transition-all duration-300 ease-in-out group-hover:text-zinc-400" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
