// Consentement aux cookies de mesure d'audience (Microsoft Clarity).
// Clarity n'est chargé qu'après « Accepter ». Le choix est gardé 6 mois, puis redemandé (recommandation CNIL).

const CLARITY_ID = import.meta.env.VITE_CLARITY_ID
const KEY = 'lunaris.consent'
const MAX_AGE = 182 * 86400000 // environ 6 mois

export const analyticsAvailable = Boolean(CLARITY_ID)

const listeners = new Set()

export function getConsent() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(KEY))
    if (saved && Date.now() - saved.at < MAX_AGE) return saved.value // 'accepted' | 'refused'
  } catch {
    // Stockage indisponible : on redemandera.
  }
  return null
}

let loaded = false
function loadClarity() {
  if (loaded || !CLARITY_ID || CLARITY_ID === 'apercu') return
  loaded = true
  window.clarity =
    window.clarity ||
    function (...args) {
      ;(window.clarity.q = window.clarity.q || []).push(args)
    }
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.clarity.ms/tag/${CLARITY_ID}`
  document.head.appendChild(script)
  window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' })
}

export function setConsent(value) {
  const previous = getConsent()
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ value, at: Date.now() }))
  } catch {
    // Choix gardé pour cette visite seulement.
  }
  if (value === 'accepted') loadClarity()
  // Retrait de l'accord : on prévient Clarity et on recharge la page pour l'arrêter complètement.
  if (value === 'refused' && previous === 'accepted' && loaded) {
    window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' })
    window.location.reload()
    return
  }
  listeners.forEach((fn) => fn(value))
}

// Rouvre le bandeau (lien « Gérer les cookies »).
export function resetConsent() {
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    // Rien à effacer.
  }
  listeners.forEach((fn) => fn(null))
}

export function onConsentChange(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

// Au chargement de la page : si l'accord a déjà été donné, Clarity démarre directement.
export function startAnalyticsIfAllowed() {
  if (getConsent() === 'accepted') loadClarity()
}
