import { useState } from 'react'
import { BellOff, Loader2 } from 'lucide-react'

// Bandeau de l'accueil quand cet appareil ne reçoit plus la notification du matin
// (abonnement perdu, souvent sur iPhone après une mise à jour du site) : un toucher le recrée.
export default function NotificationsPaused({ onReactivate }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(false)

  const reactivate = async () => {
    setPending(true)
    setError(false)
    try {
      await onReactivate()
    } catch {
      setError(true)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mt-5 rounded-xl border border-zinc-900 bg-zinc-950 px-4 py-3.5">
      <div className="flex items-center gap-3">
        <BellOff className="h-4 w-4 shrink-0 text-blue-600" />
        <p className="min-w-0 flex-1 text-sm text-white">Vos notifications sont en pause sur cet appareil.</p>
        <button
          type="button"
          onClick={reactivate}
          disabled={pending}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-wait"
        >
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Réactiver
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-zinc-500">
          La réactivation a échoué. Vérifiez que les notifications sont autorisées pour Lunaris dans les réglages, puis réessayez.
        </p>
      )}
    </div>
  )
}
