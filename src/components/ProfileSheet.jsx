import { useEffect } from 'react'
import { CreditCard, Download, LogOut, Pencil, RotateCcw, Sparkles, X } from 'lucide-react'
import { cx, sunSign } from '../lib/astro'

const formatBirth = (profile) => {
  const [y, m, d] = profile.birthDate.split('-').map(Number)
  const date = new Date(y, m - 1, d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  return profile.birthTime ? `${date} à ${profile.birthTime.replace(':', 'h')}` : `${date}, heure inconnue`
}

const shortDate = (seconds) =>
  new Date(seconds * 1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })

const PLAN_LABELS = { monthly: 'Mensuel', yearly: 'Annuel' }

const billingLabel = (billing) => {
  if (!billing) return '…'
  if (!billing.active) return 'Aucun'
  if (billing.status === 'free') return 'Accès offert'
  if (billing.status === 'trialing' && billing.trialEnd) return `Essai offert jusqu’au ${shortDate(billing.trialEnd)}`
  const plan = PLAN_LABELS[billing.plan] ?? 'Premium'
  if (!billing.periodEnd) return plan
  return billing.cancelAtPeriodEnd
    ? `${plan} · se termine le ${shortDate(billing.periodEnd)}`
    : `${plan} · renouvelé le ${shortDate(billing.periodEnd)}`
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="min-w-0 truncate text-right text-sm text-white">{value}</span>
    </div>
  )
}

const actionClass = cx(
  'flex w-full items-center gap-3 rounded-xl border border-zinc-900 bg-black px-4 py-3 text-left text-sm',
  'transition-all duration-300 ease-in-out hover:border-zinc-800',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600',
)

export default function ProfileSheet({ open, user, profile, streak, billing, demo, onClose, onEdit, onSubscribe, onManageBilling, onSignOut, onResetDemo, notificationSettings, onInstall }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div
      className={cx('fixed inset-0 z-40 transition-all duration-300 ease-in-out', open ? 'visible' : 'invisible')}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={cx('absolute inset-0 bg-black/70 transition-opacity duration-300 ease-in-out', open ? 'opacity-100' : 'opacity-0')}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Profil"
        className={cx(
          'absolute inset-x-0 bottom-0 mx-auto w-full max-w-md rounded-t-2xl border border-b-0 border-zinc-900 bg-zinc-950 px-5 pt-5',
          'transition-all duration-300 ease-in-out',
          // Sur ordinateur : fenêtre centrée plutôt que panneau en bas d'écran.
          'lg:bottom-auto lg:top-[8vh] lg:rounded-2xl lg:border-b',
          open ? 'translate-y-0 lg:opacity-100' : 'translate-y-full lg:translate-y-4 lg:opacity-0',
        )}
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar user={user} profile={profile} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-white">
                {profile.firstName} {profile.lastName}
              </p>
              <p className="truncate text-xs text-zinc-500">{user.email}</p>
            </div>
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

        <div className="mt-4 divide-y divide-zinc-900 border-y border-zinc-900">
          <Row label="Signe solaire" value={sunSign(profile.birthDate)} />
          <Row label="Naissance" value={formatBirth(profile)} />
          <Row label="Série en cours" value={`${streak.current} ${streak.current > 1 ? 'jours' : 'jour'} · record ${streak.best}`} />
          <Row label="Abonnement" value={billingLabel(billing)} />
        </div>

        {notificationSettings && <div className="mt-5">{notificationSettings}</div>}

        <div className="mt-5 flex flex-col gap-2">
          {billing?.status === 'free' ? null : billing?.active ? (
            <button type="button" onClick={onManageBilling} className={cx(actionClass, 'text-white')}>
              <CreditCard className="h-4 w-4 text-blue-600" />
              {demo ? 'Résilier l’abonnement (démo)' : 'Gérer mon abonnement'}
            </button>
          ) : (
            <button type="button" onClick={onSubscribe} className={cx(actionClass, 'text-white')}>
              <Sparkles className="h-4 w-4 text-blue-600" />
              {billing?.trialUsed ? 'S’abonner à Lunaris Premium' : 'Essayer Premium · 2 jours offerts'}
            </button>
          )}
          {onInstall && (
            <button type="button" onClick={onInstall} className={cx(actionClass, 'text-white')}>
              <Download className="h-4 w-4 text-blue-600" />
              Ajouter à l’écran d’accueil
            </button>
          )}
          <button type="button" onClick={onEdit} className={cx(actionClass, 'text-white')}>
            <Pencil className="h-4 w-4 text-blue-600" />
            Modifier mon profil
          </button>
          {demo && (
            <button type="button" onClick={onResetDemo} className={cx(actionClass, 'text-zinc-400')}>
              <RotateCcw className="h-4 w-4" />
              Réinitialiser la démo
            </button>
          )}
          <button type="button" onClick={onSignOut} className={cx(actionClass, 'text-zinc-400')}>
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  )
}

export function Avatar({ user, profile, size = 'sm' }) {
  const initials = `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase()
  const dim = size === 'lg' ? 'h-11 w-11 text-sm' : 'h-9 w-9 text-xs'
  return user.photoURL ? (
    <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className={cx(dim, 'shrink-0 rounded-xl border border-zinc-900 object-cover')} />
  ) : (
    <span className={cx(dim, 'flex shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-black font-semibold text-white')}>
      {initials}
    </span>
  )
}
