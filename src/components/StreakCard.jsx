import { Flame } from 'lucide-react'
import { addDays, cx } from '../lib/astro'
import { dayKey } from '../lib/streak'

const DAYS_SHOWN = 14

export default function StreakCard({ today, completed, streak, run, best, remaining }) {
  const todayDone = remaining === 0
  const days = Array.from({ length: DAYS_SHOWN }, (_, i) => addDays(today, i - DAYS_SHOWN + 1))

  return (
    <section className="rounded-2xl border border-zinc-900 bg-zinc-950 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame
              className={cx(
                'h-4 w-4 transition-all duration-300 ease-in-out',
                todayDone
                  ? 'text-purple-500 drop-shadow-[0_0_6px_rgba(168,85,247,0.7)]'
                  : 'text-blue-600',
              )}
              strokeWidth={2.25}
            />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
              Série
            </span>
          </div>
          <p className="mt-2 flex items-baseline gap-1.5">
            <span className="text-[32px] font-extrabold leading-none tabular-nums tracking-tight text-white">
              {streak}
            </span>
            <span className="text-sm font-medium text-zinc-400">{streak > 1 ? 'jours' : 'jour'}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-[0.1em] text-zinc-600">Record</p>
          <p className="mt-1 text-sm font-semibold tabular-nums text-zinc-300">{best} jours</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[repeat(14,minmax(0,1fr))] gap-1" aria-label="14 derniers jours">
        {days.map((date) => {
          const key = dayKey(date)
          const done = completed.has(key)
          const isToday = key === dayKey(today)
          return (
            <span
              key={key}
              title={date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
              className={cx(
                'aspect-square rounded-[4px] border transition-all duration-300 ease-in-out',
                done && 'border-purple-500 bg-purple-500',
                done && isToday && 'shadow-[0_0_10px_rgba(168,85,247,0.7)]',
                !done && isToday && 'border-dashed border-blue-600 bg-transparent',
                !done && !isToday && 'border-zinc-900 bg-zinc-900',
              )}
            />
          )
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] tabular-nums text-zinc-600">
        <span>{days[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }).replace('.', '')}</span>
        <span>Aujourd’hui</span>
      </div>

      <p className="mt-3 text-[13px] text-zinc-400">
        {todayDone ? (
          <span className="text-white">
            {streak > 0 ? 'Journée alignée. Votre série continue.' : 'Journée alignée. Revenez demain pour lancer votre série.'}
          </span>
        ) : (
          <>
            Encore{' '}
            <span className="font-medium tabular-nums text-white">
              {remaining} {remaining > 1 ? 'tâches' : 'tâche'}
            </span>{' '}
            {streak > 0
              ? 'pour prolonger la série aujourd’hui.'
              : run > 0
                ? 'pour lancer la série aujourd’hui.'
                : 'aujourd’hui. Deux jours d’affilée lancent votre série.'}
          </>
        )}
      </p>
    </section>
  )
}
