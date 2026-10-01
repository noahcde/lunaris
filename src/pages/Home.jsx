import { useMemo } from 'react'
import { Sparkles, Check, Moon, Zap, ChevronRight } from 'lucide-react'
import DayDetail from '../components/DayDetail'
import StreakCard from '../components/StreakCard'
import { Avatar } from '../components/ProfileSheet'
import Legend from '../components/Legend'
import UpcomingWindows from '../components/UpcomingWindows'
import { LOCKED_TEXT, UnlockButton } from '../components/Paywall'
import { addDays, capitalize, cx, getDayInfo, getMoonPhase, isSameDay, sunSign } from '../lib/astro'
import Logo from '../components/Logo'

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

function Header({ today, energy, user, profile, onOpenProfile }) {
  const dateLabel = capitalize(
    today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
  )
  const moon = getMoonPhase(today)

  return (
    <header className="flex items-start justify-between pt-8">
      <div>
        <Logo as="h1" className="text-[28px]" />
        <p className="mt-2 text-[13px] text-zinc-400">{dateLabel}</p>
        <p className="mt-0.5 flex items-center gap-1.5 whitespace-nowrap text-xs text-zinc-500">
          <Moon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          <span>{moon.name}</span>
          <span className="tabular-nums text-zinc-600">· {moon.illumination}%</span>
        </p>
      </div>

      <div className="flex items-center gap-2">
      <div
        role="img"
        aria-label={`Énergie sociale : ${energy}%`}
        className="flex h-9 items-center gap-2 rounded-xl border border-zinc-900 bg-zinc-950 px-2.5"
      >
        <Zap className="h-4 w-4 text-blue-600" strokeWidth={2.25} />
        <div className="flex items-end gap-[3px]" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={cx(
                'w-[3px] rounded-[1px]',
                i < Math.round(energy / 25) ? 'bg-blue-600' : 'bg-zinc-800',
              )}
              style={{ height: 6 + i * 3 }}
            />
          ))}
        </div>
        <span className="text-xs font-medium tabular-nums text-zinc-400">{energy}%</span>
      </div>
        <button
          type="button"
          onClick={onOpenProfile}
          aria-label="Ouvrir le profil"
          className="rounded-xl transition-all duration-300 ease-in-out hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <Avatar user={user} profile={profile} />
        </button>
      </div>
    </header>
  )
}

/* ------------------------------------------------------------------ */
/* Insight cosmique                                                    */
/* ------------------------------------------------------------------ */

function Skeleton({ className }) {
  return <span className={cx('block animate-pulse rounded-md bg-zinc-900', className)} />
}

// Textes d'attente affichés floutés : le vrai contenu n'est jamais envoyé sans abonnement.
const LOCKED_INSIGHT = {
  title: 'Une journée propice aux décisions claires.',
  text: 'Le ciel du jour éclaire vos priorités et met en lumière une énergie à canaliser. Votre signe trouve un appui inattendu dans les échanges de l’après-midi.',
}
const LOCKED_TASKS = [
  { title: 'Clarifier une priorité du jour', hint: 'Le ciel soutient votre concentration.' },
  { title: 'Reprendre contact avec un proche', hint: 'Les échanges sont favorisés.' },
  { title: 'Prendre dix minutes de recul', hint: 'La Lune invite à ralentir.' },
]

function CosmicInsight({ daily, sign, onRetry, trialAvailable, onUnlock }) {
  return (
    <section className="rounded-2xl border border-zinc-900 bg-zinc-950 p-5" aria-busy={daily.status === 'loading'}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles
            className="h-4 w-4 text-purple-500 drop-shadow-[0_0_6px_rgba(168,85,247,0.6)]"
            strokeWidth={2}
          />
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
            Insight cosmique
          </span>
        </div>
        {sign && <span className="text-[11px] text-zinc-500">{sign}</span>}
      </div>

      {daily.status === 'ready' && (
        <>
          <h2 className="mt-3 text-[17px] font-semibold leading-snug text-white">{daily.insight.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">{daily.insight.text}</p>
        </>
      )}

      {daily.status === 'locked' && (
        <div className="relative">
          <div aria-hidden="true" className={LOCKED_TEXT}>
            <h2 className="mt-3 text-[17px] font-semibold leading-snug text-white">{LOCKED_INSIGHT.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{LOCKED_INSIGHT.text}</p>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm font-medium text-white">Votre horoscope du jour vous attend.</p>
            <UnlockButton trialAvailable={trialAvailable} onClick={onUnlock} />
          </div>
        </div>
      )}

      {(daily.status === 'loading' || daily.status === 'idle') && (
        <div className="mt-3">
          <p className="text-xs text-zinc-500">Lecture de votre ciel du jour…</p>
          <Skeleton className="mt-3 h-4 w-4/5" />
          <Skeleton className="mt-3 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-11/12" />
          <Skeleton className="mt-2 h-3 w-2/3" />
        </div>
      )}

      {daily.status === 'error' && (
        <div className="mt-3">
          <p className="text-sm text-zinc-400">Votre horoscope n’a pas pu être généré.</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-xl border border-zinc-800 px-3 py-2 text-xs font-medium text-blue-500 transition-all duration-300 ease-in-out hover:border-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Réessayer
          </button>
        </div>
      )}
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Tâches d'alignement                                                 */
/* ------------------------------------------------------------------ */

function TaskItem({ task, onToggle }) {
  const { done } = task
  return (
    <li>
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        onClick={() => onToggle(task.id)}
        className={cx(
          'group flex w-full items-center gap-3.5 rounded-xl border px-4 py-3.5 text-left',
          'transition-all duration-300 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
          done
            ? 'border-purple-500/30 bg-purple-500/[0.06]'
            : 'border-zinc-900 bg-zinc-950 hover:border-zinc-800',
        )}
      >
        <span
          className={cx(
            'flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border',
            'transition-all duration-300 ease-in-out',
            done
              ? 'border-purple-500 bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.55)]'
              : 'border-zinc-700 bg-transparent group-hover:border-zinc-500',
          )}
        >
          <Check
            className={cx(
              'h-3.5 w-3.5 text-white transition-all duration-300 ease-in-out',
              done ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
            )}
            strokeWidth={3}
          />
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={cx(
              'block text-[15px] font-medium transition-all duration-300 ease-in-out',
              done ? 'text-zinc-500 line-through decoration-zinc-600' : 'text-white',
            )}
          >
            {task.title}
          </span>
          <span
            className={cx(
              'mt-0.5 block text-xs transition-all duration-300 ease-in-out',
              done ? 'text-zinc-600' : 'text-zinc-400',
            )}
          >
            {task.hint}
          </span>
        </span>
      </button>
    </li>
  )
}

function LockedTask({ task }) {
  return (
    <li className="flex items-center gap-3.5 rounded-xl border border-zinc-900 bg-zinc-950 px-4 py-3.5">
      <span className="h-[22px] w-[22px] shrink-0 rounded-full border border-zinc-800" />
      <span aria-hidden="true" className={cx('min-w-0 flex-1', LOCKED_TEXT)}>
        <span className="block text-[15px] font-medium text-white">{task.title}</span>
        <span className="mt-0.5 block text-xs text-zinc-400">{task.hint}</span>
      </span>
    </li>
  )
}

function AlignmentTasks({ tasks, onToggle, loading, locked }) {
  const total = 3
  const doneCount = tasks.filter((t) => t.done).length
  const progress = Math.round((doneCount / total) * 100)

  return (
    <section>
      <div className="flex items-baseline justify-between">
        <h2 className="text-[15px] font-semibold text-white">Tâches d’alignement</h2>
        <span className="text-xs font-medium tabular-nums text-zinc-400">
          {doneCount}/{total} · {progress}%
        </span>
      </div>

      <div
        className="mt-3 h-1 w-full overflow-hidden rounded-sm bg-zinc-900"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label="Progression des tâches"
      >
        <div
          className={cx(
            'h-full rounded-sm bg-gradient-to-r from-blue-600 to-purple-500 transition-all duration-500 ease-in-out',
            progress > 0 && 'shadow-[0_0_10px_rgba(37,99,235,0.6)]',
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      <ul className="mt-4 flex flex-col gap-2.5">
        {locked
          ? LOCKED_TASKS.map((task) => <LockedTask key={task.title} task={task} />)
          : loading
          ? [0, 1, 2].map((i) => (
              <li
                key={i}
                className="flex items-center gap-3.5 rounded-xl border border-zinc-900 bg-zinc-950 px-4 py-3.5"
              >
                <span className="h-[22px] w-[22px] shrink-0 rounded-full border border-zinc-800" />
                <span className="flex-1">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="mt-2 h-2.5 w-1/2" />
                </span>
              </li>
            ))
          : tasks.map((task) => <TaskItem key={task.id} task={task} onToggle={onToggle} />)}
      </ul>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Calendrier de manifestation (5 prochains jours)                     */
/* ------------------------------------------------------------------ */

function DayCell({ date, info, selected, onSelect }) {
  const { status } = info
  const short = date.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cx(
        'relative flex flex-1 flex-col items-center gap-1 rounded-xl border px-1 py-3',
        'transition-all duration-300 ease-in-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600',
        status === 'normal' && 'border-zinc-800 bg-zinc-950 text-zinc-400',
        status === 'high' &&
          'border-purple-500 bg-zinc-950 text-white shadow-[0_6px_14px_-8px_rgba(168,85,247,0.9)]',
        status === 'blocked' && 'border-zinc-900 bg-black text-zinc-600 opacity-40',
        selected && status === 'normal' && 'border-zinc-600',
        selected && status === 'blocked' && 'opacity-70',
        selected && status === 'high' && 'bg-purple-500/[0.08]',
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">{short}</span>
      <span className="text-lg font-semibold tabular-nums leading-none">{date.getDate()}</span>
      {status === 'high' && (
        <span className="absolute -bottom-px left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-sm bg-purple-500 shadow-[0_0_8px_2px_rgba(168,85,247,0.7)]" />
      )}
    </button>
  )
}

function ManifestationStrip({ today, selectedDate, onSelectDate, onOpenCalendar, locked }) {
  const days = useMemo(
    () => [1, 2, 3, 4, 5].map((i) => addDays(today, i)).map((date) => ({ date, info: getDayInfo(date) })),
    [today],
  )
  const selected = days.find((d) => isSameDay(d.date, selectedDate)) ?? days[0]

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Calendrier de manifestation
        </h2>
        <button
          type="button"
          onClick={() => onOpenCalendar(selected.date)}
          className="flex items-center gap-0.5 rounded-lg px-1.5 py-1 text-xs font-medium text-blue-500 transition-all duration-300 ease-in-out hover:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          Voir le mois
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        {days.map(({ date, info }) => (
          <DayCell
            key={date.toDateString()}
            date={date}
            info={info}
            selected={isSameDay(date, selected.date)}
            onSelect={() => onSelectDate(date)}
          />
        ))}
      </div>

      <div className="mt-4">
        <DayDetail date={selected.date} info={selected.info} locked={locked} />
      </div>
      <div className="mt-3">
        <Legend />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Home({ today, user, profile, onOpenProfile, daily, onRetryDaily, tasks, onToggleTask, streak, selectedDate, onSelectDate, onOpenCalendar, locked, trialAvailable, onUnlock }) {
  return (
    <>
      <Header today={today} energy={72} user={user} profile={profile} onOpenProfile={onOpenProfile} />
      {/* Sur ordinateur : horoscope et tâches à gauche, série et calendrier à droite. */}
      <div className="flex flex-col gap-7 lg:grid lg:grid-cols-2 lg:items-start lg:gap-10">
        <div className="flex flex-col gap-7">
          <CosmicInsight
            daily={daily}
            sign={sunSign(profile.birthDate)}
            onRetry={onRetryDaily}
            trialAvailable={trialAvailable}
            onUnlock={onUnlock}
          />
          <AlignmentTasks tasks={tasks} onToggle={onToggleTask} loading={daily.status !== 'ready'} locked={locked} />
        </div>
        <div className="flex flex-col gap-7">
          <StreakCard
            today={today}
            completed={streak.completed}
            streak={streak.current}
            best={streak.best}
            remaining={streak.remaining}
          />
          <ManifestationStrip
            today={today}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            onOpenCalendar={onOpenCalendar}
            locked={locked}
          />
        </div>
      </div>
      {/* Sur ordinateur, la place restante montre les prochains jours favorables. */}
      <div className="mt-8 hidden lg:block">
        <UpcomingWindows
          today={today}
          onPick={onOpenCalendar}
          locked={locked}
          listClassName="grid grid-cols-3 gap-3"
        />
      </div>
    </>
  )
}
