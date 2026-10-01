import { Moon, Zap } from 'lucide-react'
import { STATUS_LABELS, cx, longDate } from '../lib/astro'
import { LOCKED_TEXT } from './Paywall'

// Carte de détail d'un jour, partagée par l'accueil et le calendrier.
export default function DayDetail({ date, info, locked = false }) {
  return (
    <div className="rounded-xl border border-zinc-900 bg-zinc-950 px-4 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">{longDate(date)}</p>
        <span
          className={cx(
            'shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]',
            info.status === 'high' && 'border-purple-500/40 bg-purple-500/10 text-purple-300',
            info.status === 'normal' && 'border-zinc-800 text-zinc-400',
            info.status === 'blocked' && 'border-red-500/40 bg-red-500/10 text-red-300',
          )}
        >
          {STATUS_LABELS[info.status]}
        </span>
      </div>
      <p aria-hidden={locked} className={cx('mt-1.5 text-[13px] leading-relaxed text-zinc-400', locked && LOCKED_TEXT)}>
        {info.note}
      </p>
      <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <Moon className="h-3.5 w-3.5" strokeWidth={2} />
          {info.moon.name}
        </span>
        <span className="flex items-center gap-1.5 tabular-nums">
          <Zap className="h-3.5 w-3.5 text-blue-600" strokeWidth={2.25} />
          Énergie {info.energy}%
        </span>
      </div>
    </div>
  )
}
