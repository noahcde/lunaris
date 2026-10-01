import { useEffect, useState } from 'react'
import { Download, EllipsisVertical, MonitorDown, PlusSquare, Share, Smartphone, X } from 'lucide-react'
import { LogoMark } from './Logo'
import { cx } from '../lib/astro'
import { canPromptInstall, detectPlatform, onInstallAvailable, promptInstall } from '../lib/pwa'

const TABS = [
  { id: 'ios', label: 'iPhone' },
  { id: 'android', label: 'Android' },
  { id: 'desktop', label: 'Ordinateur' },
]

const STEPS = {
  ios: [
    { Icon: Smartphone, text: 'Ouvrez Lunaris dans Safari (les autres navigateurs ne permettent pas l’ajout).' },
    { Icon: Share, text: 'Touchez le bouton Partager, le carré avec une flèche vers le haut, en bas de l’écran.' },
    { Icon: PlusSquare, text: 'Faites défiler puis touchez « Sur l’écran d’accueil », puis « Ajouter ».' },
  ],
  android: [
    { Icon: Smartphone, text: 'Ouvrez Lunaris dans Chrome.' },
    { Icon: EllipsisVertical, text: 'Touchez les trois points en haut à droite.' },
    { Icon: Download, text: 'Choisissez « Installer l’application » ou « Ajouter à l’écran d’accueil », puis confirmez.' },
  ],
  desktop: [
    { Icon: MonitorDown, text: 'Dans Chrome ou Edge, cliquez sur l’icône d’installation à droite de la barre d’adresse.' },
    { Icon: Download, text: 'Confirmez avec « Installer » : Lunaris s’ouvre alors dans sa propre fenêtre.' },
    { Icon: Smartphone, text: 'Pour votre téléphone, ouvrez Lunaris dessus et suivez l’onglet iPhone ou Android.' },
  ],
}

// Guide « Ajouter à l'écran d'accueil », proposé après le paiement et depuis le profil.
// `children` reçoit le réglage des notifications, affiché sous les étapes.
export default function InstallGuide({ open, onClose, children }) {
  const [platform, setPlatform] = useState(detectPlatform)
  const [installable, setInstallable] = useState(canPromptInstall)

  useEffect(() => onInstallAvailable(setInstallable), [])
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const install = async () => {
    if (await promptInstall()) onClose()
  }

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
        aria-label="Installer Lunaris"
        className={cx(
          'absolute inset-x-0 bottom-0 mx-auto max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-b-0 border-zinc-900 bg-zinc-950 px-5 pt-5',
          'transition-all duration-300 ease-in-out',
          'lg:bottom-auto lg:top-[6vh] lg:rounded-2xl lg:border-b',
          open ? 'translate-y-0 lg:opacity-100' : 'translate-y-full lg:translate-y-4 lg:opacity-0',
        )}
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <LogoMark className="h-11 w-11" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-500">Bienvenue dans Premium</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-white">Ajoutez Lunaris à votre écran d’accueil</h2>
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
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Retrouvez votre horoscope en un geste, comme une application, avec l’icône Lunaris.
        </p>

        <div role="tablist" aria-label="Appareil" className="mt-5 grid grid-cols-3 gap-1 rounded-xl border border-zinc-900 bg-black p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={platform === t.id}
              onClick={() => setPlatform(t.id)}
              className={cx(
                'rounded-lg py-2 text-xs font-medium transition-all duration-300 ease-in-out',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600',
                platform === t.id ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-300',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {platform !== 'ios' && installable ? (
          <button
            type="button"
            onClick={install}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-[15px] font-semibold text-white shadow-[0_0_24px_rgba(37,99,235,0.5)] transition-all duration-300 ease-in-out hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <Download className="h-4 w-4" />
            Installer Lunaris
          </button>
        ) : (
          <ol className="mt-4 flex flex-col gap-2">
            {STEPS[platform].map(({ Icon, text }, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl border border-zinc-900 bg-black px-4 py-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-600 text-xs font-semibold text-white">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm leading-relaxed text-zinc-300">{text}</span>
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
              </li>
            ))}
          </ol>
        )}
        {platform === 'ios' && (
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            Ouvrez ensuite Lunaris depuis la nouvelle icône et reconnectez-vous avec Google.
          </p>
        )}

        {children && <div className="mt-5">{children}</div>}

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl border border-zinc-800 px-4 py-3 text-sm font-medium text-white transition-all duration-300 ease-in-out hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          C’est noté
        </button>
      </div>
    </div>
  )
}
