// Navigateurs intégrés aux applis (Instagram, Snapchat, TikTok, Facebook, Messenger…) : Google y refuse la connexion,
// et la fenêtre de connexion ne s'ouvre jamais (le bouton tourne sans fin). On propose alors d'ouvrir le site
// dans Safari ou Chrome, avec le code d'invitation dans l'adresse (le navigateur de l'appli et Safari ne partagent rien).
import { pendingReferral } from './referral'

const IN_APP_RE = /Instagram|FBAN|FBAV|FB_IAB|FBIOS|Messenger|Snapchat|musical_ly|BytedanceWebview|TikTok|Line\/|LinkedInApp|Twitter|Pinterest|; wv\)/i

export const inAppBrowser = () => typeof navigator !== 'undefined' && IN_APP_RE.test(navigator.userAgent ?? '')
export const isAndroid = () => /Android/i.test(navigator.userAgent ?? '')

// Adresse du site à rouvrir, avec le code d'invitation s'il y en a un.
export function siteLink() {
  const code = pendingReferral()
  return `${window.location.origin}/${code ? `?parrain=${code}` : ''}`
}

// Android : ce lien ouvre directement le site dans Chrome.
export function chromeIntentLink() {
  const url = new URL(siteLink())
  return `intent://${url.host}${url.pathname}${url.search}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url.href)};end`
}
