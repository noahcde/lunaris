// Parrainage : un lien lunaris-app.fr/?parrain=CODE est gardé dans ce navigateur jusqu'à l'inscription,
// puis envoyé au serveur (claimReferral) une fois le profil créé. Voir functions/referral.js.
const KEY = 'lunaris.parrain'
const CODE_RE = /^[A-HJ-NP-Z2-9]{6}$/

// À l'ouverture : lit ?parrain=… dans l'adresse, le garde, et le retire de l'adresse affichée.
export function captureReferral() {
  try {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('parrain')?.toUpperCase()
    if (!code) return
    if (CODE_RE.test(code)) localStorage.setItem(KEY, code)
    params.delete('parrain')
    const query = params.toString()
    window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`)
  } catch {
    // Stockage ou historique indisponible : le lien n'est simplement pas pris en compte.
  }
}

export function pendingReferral() {
  try {
    const code = localStorage.getItem(KEY)
    return CODE_RE.test(code ?? '') ? code : null
  } catch {
    return null
  }
}

export function clearReferral() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // rien à faire
  }
}

export const inviteLink = (code) => `https://lunaris-app.fr/?parrain=${code}`

// Partage du lien : menu de partage du téléphone, sinon copie dans le presse-papiers.
// Renvoie 'shared', 'copied' ou null (annulé ou impossible).
export async function shareInvite(code) {
  const url = inviteLink(code)
  const text =
    'Je t’offre 7 jours de Lunaris Premium 🎁 Chaque matin, ton horoscope perso et 3 petites choses à faire selon ton signe. ' +
    `Crée ton compte avec mon lien, c’est gratuit et sans carte bancaire : ${url}`
  if (navigator.share) {
    try {
      // Le lien est dans le texte et pas dans « url » : Messages, WhatsApp ou Instagram n'envoient sinon que le lien, sans la phrase.
      await navigator.share({ text })
      return 'shared'
    } catch (err) {
      if (err?.name === 'AbortError') return null
    }
  }
  try {
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    return null
  }
}
