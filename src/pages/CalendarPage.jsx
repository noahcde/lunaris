import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import DayDetail from '../components/DayDetail'
import { LOCKED_TEXT } from '../components/Paywall'
import Legend from '../components/Legend'
import { addDays, capitalize, cx, getDayInfo, isSameDay } from '../lib/astro'

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

// Cases du mois, semaine commençant le lundi ; null pour les cases vides.
function buildMonth(year, month) {
  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7
  const count = new Date(year, month + 1, 0).getDate()
  const cells = Array.from({ length: offset }, () => null)
  for (let d = 1; d <= count; d++) {
    const date = new Date(year, month, d)
    cells.push({ date, info: getDayInfo(date) })
  }
  while (cells.length % 7) cells.push(null)
  return cells
}

function MonthCell({ cell, today, selected, onSelect }) {
  const { date, info } = cell
  const isToday = isSameDay(date, today)
  const isPast = date < today && !isToday
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
      className={cx(
        'relative flex aspect-square flex-col items-center justify-center rounded-xl border text-sm font-semibold tabular-nums',
        'transition-all duration-300 ease-in-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600',
        info.status === 'normal' && 'border-zinc-900 bg-zinc-950 text-zinc-400',
        info.status === 'high' &&
          'border-purple-500 bg-zinc-950 text-white shadow-[0_6px_12px_-8px_rgba(168,85,247,0.9)]',
        info.status === 'blocked' && 'border-zinc-900 bg-black text-zinc-600 opacity-40',
        isPast && info.status !== 'blocked' && 'opacity-50',
        selected && 'ring-2 ring-blue-600 ring-offset-2 ring-offset-black',
        selected && info.status === 'blocked' && 'opacity-80',
      )}
    >
      {date.getDate()}
      {isToday && (
        <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-blue-600 shadow-[0_0_6px_rgba(37,99,235,0.9)]" />
      )}
      {info.status === 'high' && !isToday && (
        <span className="absolute -bottom-px left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-sm bg-purple-500 shadow-[0_0_6px_1px_rgba(168,85,247,0.7)]" />
      )}
    </button>
  )
}

function UpcomingWindows({ today, onPick, locked }) {
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
      <ul className="mt-3 flex flex-col gap-2">
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

export default function CalendarPage({ today, selectedDate, onSelectDate, locked }) {
  const [view, setView] = useState({ year: selectedDate.getFullYear(), month: selectedDate.getMonth() })

  const cells = useMemo(() => buildMonth(view.year, view.month), [view])
  const days = cells.filter(Boolean)
  const highCount = days.filter((c) => c.info.status === 'high').length
  const blockedCount = days.filter((c) => c.info.status === 'blocked').length

  const monthLabel = capitalize(
    new Date(view.year, view.month, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
  )
  const isCurrentMonth = view.year === today.getFullYear() && view.month === today.getMonth()

  const shiftMonth = (delta) =>
    setView(({ year, month }) => {
      const d = new Date(year, month + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })

  const pick = (date) => {
    onSelectDate(date)
    setView({ year: date.getFullYear(), month: date.getMonth() })
  }

  const selectedInfo = getDayInfo(selectedDate)

  return (
    <>
      <header className="pt-8">
        <h1 className="text-[28px] font-extrabold leading-none tracking-tight text-white">
          Calendrier<span className="text-blue-600">.</span>
        </h1>
        <p className="mt-2 text-[13px] text-zinc-400">Vos jours d’alignement, mois par mois.</p>
      </header>

      <section className="rounded-2xl border border-zinc-900 bg-zinc-950 p-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label="Mois précédent"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-900 text-zinc-400 transition-all duration-300 ease-in-out hover:border-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-center">
            <p className="text-[15px] font-semibold text-white">{monthLabel}</p>
            <p className="mt-0.5 text-[11px] tabular-nums text-zinc-500">
              <span className="text-purple-400">{highCount} jours fastes</span> · {blockedCount} bloqués
            </p>
          </div>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label="Mois suivant"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-900 text-zinc-400 transition-all duration-300 ease-in-out hover:border-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1.5">
          {WEEKDAYS.map((d, i) => (
            <span
              key={i}
              className="pb-1 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-600"
            >
              {d}
            </span>
          ))}
          {cells.map((cell, i) =>
            cell ? (
              <MonthCell
                key={i}
                cell={cell}
                today={today}
                selected={isSameDay(cell.date, selectedDate)}
                onSelect={() => onSelectDate(cell.date)}
              />
            ) : (
              <span key={i} aria-hidden="true" />
            ),
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <Legend showToday />
          {!isCurrentMonth && (
            <button
              type="button"
              onClick={() => pick(today)}
              className="shrink-0 rounded-lg px-1.5 py-1 text-xs font-medium text-blue-500 transition-all duration-300 ease-in-out hover:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Aujourd’hui
            </button>
          )}
        </div>
      </section>

      <DayDetail date={selectedDate} info={selectedInfo} locked={locked} />

      <UpcomingWindows today={today} onPick={pick} locked={locked} />
    </>
  )
}
