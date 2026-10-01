import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import DayDetail from '../components/DayDetail'
import Legend from '../components/Legend'
import MoonCycle from '../components/MoonCycle'
import UpcomingWindows from '../components/UpcomingWindows'
import { capitalize, cx, getDayInfo, isSameDay } from '../lib/astro'
import Logo from '../components/Logo'

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
        <Logo size="sm" className="mb-4" />
        <h1 className="text-[28px] font-extrabold leading-none tracking-tight text-white">
          Calendrier<span className="text-blue-600">.</span>
        </h1>
        <p className="mt-2 text-[13px] text-zinc-400">Vos jours d’alignement, mois par mois.</p>
      </header>

      {/* Sur ordinateur : le mois à gauche, le détail du jour et les fenêtres à droite. */}
      <div className="flex flex-col gap-7 lg:grid lg:grid-cols-[3fr_2fr] lg:items-start lg:gap-10">
        <section className="rounded-2xl border border-zinc-900 bg-zinc-950 p-4 lg:p-6">
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

        <div className="flex flex-col gap-7">
          <DayDetail date={selectedDate} info={selectedInfo} locked={locked} />
          <UpcomingWindows today={today} onPick={pick} locked={locked} />
        </div>
      </div>

      <MoonCycle
        from={new Date(view.year, view.month, 1)}
        days={new Date(view.year, view.month + 1, 0).getDate()}
        title={`Cycle lunaire · ${monthLabel}`}
        onPick={onSelectDate}
        className="hidden lg:block"
      />
    </>
  )
}
