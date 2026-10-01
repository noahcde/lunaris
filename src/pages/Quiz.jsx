import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Briefcase, Check, Compass, Heart, Leaf, PenLine, Sparkles } from 'lucide-react'
import ZodiacWheel from '../components/ZodiacWheel'
import { cx, getMoonPhase, sunSign } from '../lib/astro'
import { OTHER, OTHER_MAX, QUESTIONS, answerLabel, otherKey } from '../lib/quiz'

const FOCUS_ICONS = { amour: Heart, carriere: Briefcase, energie: Leaf, voie: Compass, confiance: Sparkles, autre: PenLine }

const ANALYSIS_STEPS = [
  'Calcul de votre signe solaire',
  'Lecture de la phase lunaire du jour',
  'Croisement avec vos réponses',
  'Préparation de vos premières actions',
]

const primaryButton = cx(
  'flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-4 text-[15px] font-semibold text-white',
  'shadow-[0_0_24px_rgba(37,99,235,0.5)] transition-all duration-300 ease-in-out hover:bg-blue-500',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black',
  'disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none',
)

function Option({ option, selected, Icon, onSelect }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cx(
        'flex w-full items-center gap-3.5 rounded-xl border px-4 py-4 text-left transition-all duration-300 ease-in-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600',
        selected
          ? 'border-blue-600 bg-blue-600/[0.06] shadow-[0_0_16px_-4px_rgba(37,99,235,0.6)]'
          : 'border-zinc-900 bg-zinc-950 hover:border-zinc-800',
      )}
    >
      {Icon && (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-900 bg-black">
          <Icon className="h-4 w-4 text-blue-600" strokeWidth={2} />
        </span>
      )}
      <span className="flex-1 text-[15px] font-medium text-white">{option.label}</span>
      <span
        className={cx(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ease-in-out',
          selected ? 'border-blue-600 bg-blue-600' : 'border-zinc-700',
        )}
      >
        {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </span>
    </button>
  )
}

function Analysis({ onDone }) {
  const [done, setDone] = useState(0)
  useEffect(() => {
    if (done >= ANALYSIS_STEPS.length) {
      const t = setTimeout(onDone, 500)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setDone((d) => d + 1), 850)
    return () => clearTimeout(t)
  }, [done, onDone])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-10 text-center" aria-live="polite">
      <ZodiacWheel className="w-56" spinning />
      <h1 className="mt-6 text-xl font-bold tracking-tight text-white">Analyse de votre ciel…</h1>
      <ul className="mt-6 flex w-full max-w-xs flex-col gap-3 text-left">
        {ANALYSIS_STEPS.map((step, i) => (
          <li
            key={step}
            className={cx(
              'flex items-center gap-3 text-sm transition-all duration-300 ease-in-out',
              i < done ? 'text-white' : i === done ? 'text-zinc-400' : 'text-zinc-700',
            )}
          >
            <span
              className={cx(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ease-in-out',
                i < done ? 'border-purple-500 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.6)]' : 'border-zinc-800',
                i === done && 'animate-pulse border-zinc-600',
              )}
            >
              {i < done && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
            </span>
            {step}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Result({ answers, onContinue }) {
  const sign = sunSign(answers.birthDate)
  const moon = getMoonPhase(new Date())
  const rows = [
    ['Signe solaire', sign],
    ['Votre priorité', answerLabel(answers, 'focus')],
    ['Votre période', answerLabel(answers, 'period')],
    ['Lune du jour', moon.name],
  ]
  return (
    <div className="flex min-h-screen flex-col justify-between pb-10 pt-14">
      <div>
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
          <Sparkles className="h-4 w-4 text-purple-500 drop-shadow-[0_0_6px_rgba(168,85,247,0.6)]" strokeWidth={2} />
          Analyse terminée
        </p>
        <h1 className="mt-3 text-[28px] font-extrabold leading-tight tracking-tight text-white">
          Votre profil astral est prêt.
        </h1>
        <div className="mt-6 divide-y divide-zinc-900 rounded-2xl border border-zinc-900 bg-zinc-950 px-4">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-3.5">
              <span className="text-xs text-zinc-500">{label}</span>
              <span className="text-right text-sm font-medium text-white">{value}</span>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm leading-relaxed text-zinc-400">
          Votre premier horoscope et vos trois actions du jour sont calculés à partir de ce profil. Créez votre
          compte pour les découvrir et les retrouver chaque matin.
        </p>
      </div>
      <button type="button" onClick={onContinue} className={cx(primaryButton, 'mt-8')}>
        Découvrir mon analyse
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
}

export default function Quiz({ initial, onBack, onComplete }) {
  const [answers, setAnswers] = useState(initial ?? {})
  const [step, setStep] = useState(0) // 0..3 questions, 4 date de naissance, 5 analyse, 6 résultat
  const total = QUESTIONS.length + 1

  const back = () => (step === 0 ? onBack() : setStep((s) => s - 1))

  if (step === 5) return <Analysis onDone={() => setStep(6)} />
  if (step === 6) return <Result answers={answers} onContinue={() => onComplete(answers)} />

  const question = QUESTIONS[step]
  const choose = (value) => {
    setAnswers((a) => ({ ...a, [question.id]: value }))
    // « Autre » attend le texte libre : on ne passe pas tout de suite à la question suivante.
    if (value !== OTHER) setTimeout(() => setStep((s) => s + 1), 250)
  }
  const otherText = question ? (answers[otherKey(question.id)] ?? '') : ''
  const otherSelected = question && answers[question.id] === OTHER
  const sign = sunSign(answers.birthDate)

  return (
    <div className="flex min-h-screen flex-col pb-10 pt-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={back}
          aria-label="Retour"
          className="rounded-lg p-1.5 text-zinc-400 transition-all duration-300 ease-in-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div
          className="h-1 flex-1 overflow-hidden rounded-sm bg-zinc-900"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={step + 1}
          aria-label="Progression du questionnaire"
        >
          <div
            className="h-full rounded-sm bg-gradient-to-r from-blue-600 to-purple-500 transition-all duration-500 ease-in-out"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
        <span className="text-xs tabular-nums text-zinc-500">
          {step + 1}/{total}
        </span>
      </div>

      {question ? (
        <div key={question.id} className="mt-10 animate-page-in">
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-white">{question.title}</h1>
          <div role="radiogroup" aria-label={question.title} className="mt-6 flex flex-col gap-2.5">
            {question.options.map((o) => (
              <Option
                key={o.value}
                option={o}
                Icon={question.id === 'focus' ? FOCUS_ICONS[o.value] : null}
                selected={answers[question.id] === o.value}
                onSelect={() => choose(o.value)}
              />
            ))}
          </div>
          {otherSelected && (
            <form
              className="mt-4 animate-page-in"
              onSubmit={(e) => {
                e.preventDefault()
                if (otherText.trim()) setStep((s) => s + 1)
              }}
            >
              <label htmlFor="other" className="block text-xs font-medium text-zinc-400">
                Précisez en quelques mots
              </label>
              <input
                id="other"
                type="text"
                autoFocus
                maxLength={OTHER_MAX}
                value={otherText}
                onChange={(e) => setAnswers((a) => ({ ...a, [otherKey(question.id)]: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-zinc-900 bg-zinc-950 px-4 py-3.5 text-[15px] text-white placeholder:text-zinc-600 transition-all duration-300 ease-in-out focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                placeholder="Votre réponse"
              />
              <p className="mt-1.5 text-right text-[11px] tabular-nums text-zinc-500">
                {otherText.length}/{OTHER_MAX}
              </p>
              <button type="submit" disabled={!otherText.trim()} className={cx(primaryButton, 'mt-3')}>
                Continuer
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      ) : (
        <form
          className="mt-10 flex flex-1 animate-page-in flex-col justify-between"
          onSubmit={(e) => {
            e.preventDefault()
            if (sign) setStep(5)
          }}
        >
          <div>
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-white">Quelle est votre date de naissance ?</h1>
            <p className="mt-2 text-sm text-zinc-400">Elle détermine votre signe et le ton de vos analyses.</p>
            <input
              type="date"
              aria-label="Date de naissance"
              value={answers.birthDate ?? ''}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setAnswers((a) => ({ ...a, birthDate: e.target.value }))}
              className="mt-6 w-full rounded-xl border border-zinc-900 bg-zinc-950 px-4 py-3.5 text-[15px] text-white transition-all duration-300 ease-in-out focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
            {sign && (
              <p className="mt-3 flex items-center gap-2 text-sm text-zinc-300">
                <Sparkles className="h-4 w-4 text-purple-500" strokeWidth={2} />
                Vous êtes <span className="font-semibold text-white">{sign}</span>
              </p>
            )}
          </div>
          <button type="submit" disabled={!sign} className={cx(primaryButton, 'mt-8')}>
            Lancer l’analyse
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      )}
    </div>
  )
}
