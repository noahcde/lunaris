import { LegalLinks } from './LegalPage'
import { ArrowRight, CalendarDays, Check, ListChecks, MessageCircleQuestion, Moon, Sparkles, Star } from 'lucide-react'
import ZodiacWheel from '../components/ZodiacWheel'
import { EXAMPLE_REVIEWS, REVIEWS } from '../content/reviews'
import { cx } from '../lib/astro'
import Logo from '../components/Logo'

const STEPS = [
  { Icon: MessageCircleQuestion, title: 'Vous répondez à 5 questions', text: 'Ce qui vous occupe, la période que vous traversez, votre date de naissance.' },
  { Icon: Moon, title: 'Votre ciel est analysé', text: 'Votre signe, la phase lunaire et le climat du jour sont croisés avec vos réponses.' },
  { Icon: ListChecks, title: 'Chaque matin, 3 actions alignées', text: 'Un horoscope personnel et des tâches concrètes, faites pour votre journée.' },
]

const PHASES = [0.1, 0.3, 0.5, 0.75, 1]

function MoonPhase({ fraction }) {
  // Partie éclairée dessinée par un masque : 0 = nouvelle lune, 1 = pleine lune.
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden="true">
      <defs>
        <mask id={`m-${fraction}`}>
          <rect width="48" height="48" fill="black" />
          <circle cx="24" cy="24" r="16" fill="white" />
          {fraction < 1 && <circle cx={24 - fraction * 32} cy="24" r="16" fill="black" />}
        </mask>
      </defs>
      <circle cx="24" cy="24" r="16" fill="#18181b" stroke="#27272a" />
      <circle
        cx="24"
        cy="24"
        r="16"
        fill="#e4e4e7"
        mask={`url(#m-${fraction})`}
        style={{ filter: fraction === 1 ? 'drop-shadow(0 0 6px rgba(168,85,247,0.7))' : undefined }}
      />
    </svg>
  )
}

function AppPreview() {
  return (
    <div className="mx-auto w-full max-w-[300px] rounded-[28px] border border-zinc-800 bg-black p-3 shadow-[0_0_60px_-12px_rgba(37,99,235,0.45)]">
      <div className="mx-auto mb-3 h-1 w-14 rounded-sm bg-zinc-800" />
      <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-4">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
          <Sparkles className="h-3.5 w-3.5 text-purple-500" strokeWidth={2} />
          Insight cosmique
        </p>
        <p className="mt-2 text-sm font-semibold leading-snug text-white">Avancez par petites touches précises.</p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-400">
          L’énergie du jour récompense la méthode plus que l’élan. Terminez ce qui est commencé.
        </p>
      </div>
      <ul className="mt-2.5 flex flex-col gap-2">
        {[
          ['Finir une tâche commencée hier', true],
          ['Bloquer 90 min de travail profond', true],
          ['Planifier vos 3 priorités de demain', false],
        ].map(([title, done]) => (
          <li
            key={title}
            className={cx(
              'flex items-center gap-2.5 rounded-xl border px-3 py-2.5',
              done ? 'border-purple-500/30 bg-purple-500/[0.06]' : 'border-zinc-900 bg-zinc-950',
            )}
          >
            <span
              className={cx(
                'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                done ? 'border-purple-500 bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]' : 'border-zinc-700',
              )}
            >
              {done && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
            </span>
            <span className={cx('text-[11px] font-medium', done ? 'text-zinc-500 line-through' : 'text-white')}>{title}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2.5 flex gap-1.5">
        {['high', 'normal', 'blocked', 'normal', 'high'].map((s, i) => (
          <span
            key={i}
            className={cx(
              'flex h-10 flex-1 items-center justify-center rounded-lg border text-[11px] font-semibold tabular-nums',
              s === 'high' && 'border-purple-500 text-white shadow-[0_4px_10px_-6px_rgba(168,85,247,0.9)]',
              s === 'normal' && 'border-zinc-800 text-zinc-400',
              s === 'blocked' && 'border-red-500/50 bg-red-500/[0.08] text-red-300',
            )}
          >
            {12 + i}
          </span>
        ))}
      </div>
    </div>
  )
}

function Reviews({ demo }) {
  const examples = REVIEWS.length === 0
  const list = examples ? (demo ? EXAMPLE_REVIEWS : []) : REVIEWS
  if (list.length === 0) return null
  return (
    <section>
      <h2 className="text-xl font-bold tracking-tight text-white lg:text-3xl">Ils se sont alignés</h2>
      {examples && (
        <p className="mt-1 text-xs text-zinc-500">Aperçu : remplacez ces exemples par de vrais avis d’utilisateurs.</p>
      )}
      <ul className="no-scrollbar -mx-5 mt-4 flex snap-x gap-3 overflow-x-auto px-5 pb-1 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
        {list.map((r, i) => (
          <li key={i} className="w-[260px] shrink-0 snap-start rounded-2xl border border-zinc-900 bg-zinc-950 p-4 lg:w-auto">
            <div className="flex items-center gap-0.5" aria-label="5 étoiles sur 5">
              {[0, 1, 2, 3, 4].map((s) => (
                <Star key={s} className="h-3.5 w-3.5 fill-blue-600 text-blue-600" />
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">« {r.text} »</p>
            <p className="mt-3 text-xs text-zinc-500">
              <span className="font-medium text-white">{r.name}</span> · {r.sign}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

function StartButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-4 text-[15px] font-semibold text-white',
        'shadow-[0_0_24px_rgba(37,99,235,0.5)] transition-all duration-300 ease-in-out hover:bg-blue-500',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black',
      )}
    >
      Révéler mon analyse astrale
      <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
    </button>
  )
}

function DesktopStart({ onStart, className }) {
  return (
    <div className={cx('hidden lg:block lg:max-w-sm', className)}>
      <StartButton onClick={onStart} />
      <p className="mt-2 text-center text-xs text-zinc-500">5 questions · moins de 2 minutes</p>
    </div>
  )
}

export default function Landing({ onStart, onSignIn, demo }) {
  return (
    <div className="pb-36 lg:pb-24">
      <header className="flex items-center justify-between pt-6 lg:pt-8">
        <Logo />
        <button
          type="button"
          onClick={onSignIn}
          className="rounded-lg px-2 py-1 text-xs font-medium text-zinc-400 transition-all duration-300 ease-in-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          J’ai déjà un compte
        </button>
      </header>

      <section className="pt-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 lg:pt-20">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-500">Astrologie × productivité</p>
          <h1 className="mt-3 text-[34px] font-extrabold leading-[1.08] tracking-tight text-white lg:text-[56px]">
            Votre ciel du jour, transformé en actions concrètes.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-zinc-400 lg:text-lg">
            Lunaris lit votre signe, la Lune et le climat astral du jour pour vous donner chaque matin un horoscope
            personnel et trois actions simples à accomplir.
          </p>
          <DesktopStart onStart={onStart} className="mt-8" />
        </div>
        <ZodiacWheel className="mx-auto mt-6 w-full max-w-[320px] lg:mt-0 lg:max-w-[440px]" />
      </section>

      <section className="mt-6 lg:mt-24 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="lg:order-2">
          <h2 className="text-xl font-bold tracking-tight text-white lg:text-3xl">Ce que vous recevez chaque matin</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400 lg:text-base">
            Un insight écrit pour vous, trois tâches qui en découlent, et un calendrier qui montre vos jours les plus
            favorables.
          </p>
        </div>
        <div className="mt-6 lg:order-1 lg:mt-0">
          <AppPreview />
        </div>
      </section>

      <section className="mt-14 lg:mt-24">
        <h2 className="text-xl font-bold tracking-tight text-white lg:text-3xl">Comment ça marche</h2>
        <ol className="mt-4 flex flex-col gap-2.5 lg:mt-6 lg:grid lg:grid-cols-3 lg:gap-4">
          {STEPS.map(({ Icon, title, text }, i) => (
            <li key={title} className="flex gap-3.5 rounded-2xl border border-zinc-900 bg-zinc-950 p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-900 bg-black">
                <Icon className="h-4 w-4 text-blue-600" strokeWidth={2} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-white">
                  {i + 1}. {title}
                </span>
                <span className="mt-1 block text-[13px] leading-relaxed text-zinc-400">{text}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14 rounded-2xl border border-zinc-900 bg-zinc-950 p-5 lg:mt-24 lg:p-8">
        <div className="flex items-center justify-between">
          {PHASES.map((f) => (
            <MoonPhase key={f} fraction={f} />
          ))}
        </div>
        <h2 className="mt-4 text-lg font-bold tracking-tight text-white">Au rythme de la Lune</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
          Chaque jour est classé : favorable, neutre ou à ménager. Vous savez quand lancer un projet et quand
          prendre du recul.
        </p>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-zinc-500">
          <CalendarDays className="h-3.5 w-3.5" />
          Vos prochaines fenêtres favorables, mois par mois
        </p>
      </section>

      <div className="mt-14 lg:mt-24">
        <Reviews demo={demo} />
      </div>

      <DesktopStart onStart={onStart} className="mx-auto mt-16" />

      <footer className="mt-14 border-t border-zinc-900 pt-6 lg:mt-20">
        <nav aria-label="Astrologie" className="mb-3 flex justify-center gap-4 text-xs text-zinc-500">
          <a href="/signes/" className="transition-colors duration-300 hover:text-zinc-300">
            Signes du zodiaque
          </a>
          <a href="/calendrier-lunaire/" className="transition-colors duration-300 hover:text-zinc-300">
            Calendrier lunaire
          </a>
        </nav>
        <LegalLinks />
        <p className="mt-3 text-center text-[11px] text-zinc-700">© 2026 Lunaris</p>
      </footer>

      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t lg:hidden border-zinc-900 bg-black/85 backdrop-blur"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
      >
        <div className="mx-auto w-full max-w-md px-5 pt-4">
          <StartButton onClick={onStart} />
          <p className="mt-2 text-center text-[11px] text-zinc-500">5 questions · moins de 2 minutes</p>
        </div>
      </div>
    </div>
  )
}
