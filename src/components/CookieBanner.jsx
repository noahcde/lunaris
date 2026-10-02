import { useEffect, useState } from 'react'
import { analyticsAvailable, getConsent, onConsentChange, setConsent } from '../lib/consent'

// Bandeau de consentement : « Refuser » et « Accepter » ont le même poids, comme l'exige la CNIL.
export default function CookieBanner() {
  const [choice, setChoice] = useState(getConsent)

  useEffect(() => onConsentChange(setChoice), [])

  if (!analyticsAvailable || choice) return null

  // Les deux boutons sont identiques : aucun choix n'est mis en avant.
  const button =
    'flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 ease-in-out hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600'

  return (
    <div
      role="dialog"
      aria-label="Cookies"
      className="fixed inset-x-0 bottom-0 z-[60] px-3 lg:bottom-6 lg:left-auto lg:right-6 lg:w-[400px] lg:px-0"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
    >
      <div className="mx-auto max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-[0_-8px_40px_rgba(0,0,0,0.6)]">
        <p className="text-sm font-semibold text-white">Un petit cookie ?</p>
        <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
          Avec votre accord, nous mesurons comment le site est utilisé (Microsoft Clarity), pour
          l’améliorer. Vos informations personnelles sont masquées. Aucune publicité.{' '}
          <a href="#cookies" className="text-zinc-300 underline underline-offset-2 hover:text-white">
            En savoir plus
          </a>
        </p>
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={() => setConsent('refused')} className={button}>
            Refuser
          </button>
          <button type="button" onClick={() => setConsent('accepted')} className={button}>
            Accepter
          </button>
        </div>
      </div>
    </div>
  )
}
