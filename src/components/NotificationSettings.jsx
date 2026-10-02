import { useState } from 'react'
import { Bell, Loader2 } from 'lucide-react'
import { cx } from '../lib/astro'
import { detectPlatform, isStandalone, pushSupported } from '../lib/pwa'

export const DEFAULT_HOUR = 8
const pad = (n) => String(n).padStart(2, '0')

const ERRORS = {
  denied: 'Les notifications sont bloquées pour ce site. Autorisez-les dans les réglages du navigateur, puis réessayez.',
  unsupported: 'Ce navigateur ne permet pas les notifications. Essayez avec Chrome, ou Safari sur iPhone.',
}

// Réglage « Notification » : interrupteur + heure d'envoi.
// Résultat lisible du bouton de test.
function testMessage({ successCount, errors }) {
  if (errors.includes('aucun-appareil')) return 'Aucun appareil enregistré : désactivez puis réactivez l’interrupteur.'
  if (successCount > 0 && errors.length === 0) return 'Notification envoyée : elle doit arriver dans quelques secondes.'
  if (successCount > 0) return `Envoyée à ${successCount} appareil(s), échec sur ${errors.length} (${errors.join(', ')}).`
  return `L’envoi a échoué (${errors.join(', ')}). Désactivez puis réactivez l’interrupteur.`
}

export default function NotificationSettings({ notifications, demo, onEnable, onUpdate, onTest, onShowGuide }) {
  const [pending, setPending] = useState(false)
  const [test, setTest] = useState(null) // null | 'sending' | message
  const [error, setError] = useState(null)
  const enabled = Boolean(notifications?.enabled)
  const hour = notifications?.hour ?? DEFAULT_HOUR
  const minute = notifications?.minute ?? 0

  const needsInstall = !demo && detectPlatform() === 'ios' && !isStandalone()
  const unsupported = !demo && !needsInstall && !pushSupported()

  const sendTest = async () => {
    setTest('sending')
    try {
      setTest(testMessage(await onTest()))
    } catch {
      setTest('Le test n’a pas pu partir. Vérifiez votre connexion, puis réessayez.')
    }
  }

  const toggle = async () => {
    setError(null)
    setTest(null)
    if (enabled) {
      onUpdate({ enabled: false })
      return
    }
    setPending(true)
    try {
      await onEnable(hour, minute)
    } catch (err) {
      setError(ERRORS[err?.code] ?? 'L’activation a échoué. Vérifiez votre connexion, puis réessayez.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="rounded-xl border border-zinc-900 bg-black px-4 py-3.5">
      <div className="flex items-center gap-3">
        <Bell className="h-4 w-4 shrink-0 text-blue-600" />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-white">Notification</p>
          <p className="text-xs text-zinc-500">Un rappel quand votre horoscope du jour est prêt.</p>
        </div>
        {!needsInstall && !unsupported && (
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label="Notification"
            onClick={toggle}
            disabled={pending}
            className={cx(
              'relative h-6 w-11 shrink-0 rounded-full border transition-all duration-300 ease-in-out',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-wait',
              enabled ? 'border-blue-600 bg-blue-600' : 'border-zinc-800 bg-zinc-900',
            )}
          >
            {pending ? (
              <Loader2 className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 animate-spin text-white" />
            ) : (
              <span
                className={cx(
                  'absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white transition-all duration-300 ease-in-out',
                  enabled ? 'left-[22px]' : 'left-0.5',
                )}
              />
            )}
          </button>
        )}
      </div>

      {enabled && (
        <label className="mt-3 flex items-center justify-between gap-3 border-t border-zinc-900 pt-3 text-xs text-zinc-400">
          Heure d’envoi
          <input
            type="time"
            step={60}
            value={`${pad(hour)}:${pad(minute)}`}
            onChange={(e) => {
              const [h, m] = e.target.value.split(':').map(Number)
              if (Number.isInteger(h) && Number.isInteger(m)) onUpdate({ hour: h, minute: m })
            }}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-sm tabular-nums text-white [color-scheme:dark] focus:border-blue-600 focus:outline-none"
          />
        </label>
      )}
      {enabled && onTest && (
        <div className="mt-3 border-t border-zinc-900 pt-3">
          <button
            type="button"
            onClick={sendTest}
            disabled={test === 'sending'}
            className="text-xs font-medium text-blue-500 transition-colors duration-300 hover:text-blue-400 disabled:cursor-wait disabled:text-zinc-500"
          >
            {test === 'sending' ? 'Envoi…' : 'Envoyer une notification de test'}
          </button>
          {test && test !== 'sending' && <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">{test}</p>}
        </div>
      )}

      {needsInstall && (
        <p className="mt-3 border-t border-zinc-900 pt-3 text-xs leading-relaxed text-zinc-400">
          Sur iPhone, ajoutez d’abord Lunaris à votre écran d’accueil, puis ouvrez-le depuis l’icône pour activer les
          notifications.{' '}
          {onShowGuide && (
            <button type="button" onClick={onShowGuide} className="font-medium text-blue-500 hover:text-blue-400">
              Comment faire ?
            </button>
          )}
        </p>
      )}
      {unsupported && (
        <p className="mt-3 border-t border-zinc-900 pt-3 text-xs leading-relaxed text-zinc-400">{ERRORS.unsupported}</p>
      )}
      {error && (
        <p role="alert" className="mt-3 text-xs leading-relaxed text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
