import { useEffect, useState } from 'react'
import { Check, Lock, Sparkles, X } from 'lucide-react'
import { cx } from '../lib/astro'

export const PLANS = {
  yearly: { label: 'Annuel', price: '49,99 €', period: '/an', note: 'Soit 4,17 € par mois', badge: '−40 %' },
  monthly: { label: 'Mensuel', price: '6,99 €', period: '/mois', note: 'Sans engagement' },
}

const BENEFITS = [
  'Votre horoscope personnalisé chaque jour',
  'Trois tâches d’alignement tirées de votre ciel',
  'Le détail de chaque jour du calendrier',
]

// Texte flouté affiché à la place du contenu réservé aux abonnés.
export const LOCKED_TEXT = 'select-none blur-[5px]'

export function UnlockButton({ trialAvailable, onClick, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white',
        'shadow-[0_0_18px_rgba(37,99,235,0.45)] transition-all duration-300 ease-in-out hover:bg-blue-500',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black',
        className,
      )}
    >
      <Lock className="h-4 w-4" strokeWidth={2.25} />
      {trialAvailable ? 'Débloquer · 2 jours offerts' : 'Débloquer'}
    </button>
  )
}

function PlanOption({ id, plan, selected, onSelect }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(id)}
      className={cx(
        'flex w-full items-center gap-3.5 rounded-xl border px-4 py-3.5 text-left transition-all duration-300 ease-in-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600',
        selected ? 'border-blue-600 bg-blue-600/[0.06] shadow-[0_0_16px_-4px_rgba(37,99,235,0.6)]' : 'border-zinc-900 bg-black hover:border-zinc-800',
      )}
    >
      <span
        className={cx(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ease-in-out',
          selected ? 'border-blue-600 bg-blue-600' : 'border-zinc-700',
        )}
      >
        {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-[15px] font-semibold text-white">{plan.label}</span>
          {plan.badge && (
            <span className="rounded-md border border-blue-600/40 bg-blue-600/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400">
              {plan.badge}
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-xs text-zinc-500">{plan.note}</span>
      </span>
      <span className="text-right">
        <span className="text-[15px] font-semibold tabular-nums text-white">{plan.price}</span>
        <span className="text-xs text-zinc-500">{plan.period}</span>
      </span>
    </button>
  )
}

export default function Paywall({ open, trialAvailable, onClose, onSubscribe }) {
  const [plan, setPlan] = useState('yearly')
  const [state, setState] = useState('idle') // idle | loading | error

  useEffect(() => {
    if (!open) return
    setState('idle')
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const subscribe = async () => {
    setState('loading')
    try {
      await onSubscribe(plan)
    } catch {
      setState('error')
    }
  }

  const chosen = PLANS[plan]

  return (
    <div
      className={cx('fixed inset-0 z-50 transition-all duration-300 ease-in-out', open ? 'visible' : 'invisible')}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={cx('absolute inset-0 bg-black/70 transition-opacity duration-300 ease-in-out', open ? 'opacity-100' : 'opacity-0')}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Abonnement Lunaris"
        className={cx(
          'absolute inset-x-0 bottom-0 mx-auto max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-b-0 border-zinc-900 bg-zinc-950 px-5 pt-5',
          'transition-all duration-300 ease-in-out',
          // Sur ordinateur : fenêtre centrée plutôt que panneau en bas d'écran.
          'lg:bottom-auto lg:top-[8vh] lg:rounded-2xl lg:border-b',
          open ? 'translate-y-0 lg:opacity-100' : 'translate-y-full lg:translate-y-4 lg:opacity-0',
        )}
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
              <Sparkles className="h-4 w-4 text-purple-500 drop-shadow-[0_0_6px_rgba(168,85,247,0.6)]" strokeWidth={2} />
              Lunaris Premium
            </p>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-white">
              {trialAvailable ? 'Essayez 2 jours offerts' : 'Débloquez votre ciel'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-lg p-1.5 text-zinc-500 transition-all duration-300 ease-in-out hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <ul className="mt-4 flex flex-col gap-2">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-center gap-2.5 text-sm text-zinc-300">
              <Check className="h-4 w-4 shrink-0 text-blue-600" strokeWidth={2.5} />
              {b}
            </li>
          ))}
        </ul>

        <div role="radiogroup" aria-label="Formule" className="mt-5 flex flex-col gap-2">
          {Object.entries(PLANS).map(([id, p]) => (
            <PlanOption key={id} id={id} plan={p} selected={plan === id} onSelect={setPlan} />
          ))}
        </div>

        <button
          type="button"
          onClick={subscribe}
          disabled={state === 'loading'}
          className={cx(
            'mt-5 w-full rounded-xl bg-blue-600 px-4 py-3.5 text-[15px] font-semibold text-white',
            'shadow-[0_0_20px_rgba(37,99,235,0.45)] transition-all duration-300 ease-in-out hover:bg-blue-500',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
            'disabled:cursor-wait disabled:opacity-70',
          )}
        >
          {state === 'loading' ? 'Ouverture du paiement…' : trialAvailable ? 'Commencer mes 2 jours offerts' : 'S’abonner'}
        </button>

        {state === 'error' && (
          <p className="mt-3 text-center text-xs text-zinc-400">Le paiement n’a pas pu s’ouvrir. Réessayez dans un instant.</p>
        )}

        <p className="mt-3 text-center text-xs leading-relaxed text-zinc-500">
          {trialAvailable
            ? `Carte demandée, aucun débit pendant 2 jours. Ensuite ${chosen.price}${chosen.period}, résiliable à tout moment.`
            : `${chosen.price}${chosen.period}, résiliable à tout moment.`}
          <br />
          Paiement sécurisé par Stripe.
        </p>
      </div>
    </div>
  )
}
