// Installation sur l'écran d'accueil et prise en charge des notifications selon l'appareil.

// Ouvert depuis l'icône de l'écran d'accueil (et non dans le navigateur).
export const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true

export function detectPlatform() {
  const ua = navigator.userAgent
  // Les iPad récents se présentent comme un Mac : on les reconnaît à l'écran tactile.
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'desktop'
}

// Sur iPhone, les notifications ne marchent que dans le site installé sur l'écran d'accueil.
export const pushSupported = () =>
  'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window

// Chrome et Edge proposent leur propre fenêtre d'installation : on la garde pour notre bouton « Installer ».
let installPrompt = null
const listeners = new Set()
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    installPrompt = e
    listeners.forEach((fn) => fn(true))
  })
  window.addEventListener('appinstalled', () => {
    installPrompt = null
    listeners.forEach((fn) => fn(false))
  })
}

export const canPromptInstall = () => Boolean(installPrompt)

export function onInstallAvailable(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export async function promptInstall() {
  if (!installPrompt) return false
  const prompt = installPrompt
  installPrompt = null
  prompt.prompt()
  const { outcome } = await prompt.userChoice
  return outcome === 'accepted'
}
