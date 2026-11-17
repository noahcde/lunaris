// Parrainage : un lien lunaris-app.fr/?parrain=CODE est gardé dans ce navigateur jusqu'à l'inscription,
// puis envoyé au serveur (claimReferral) une fois le profil créé. Voir functions/referral.js.
const KEY = 'lunaris.parrain'
const CODE_RE = /^[A-HJ-NP-Z2-9]{6}$/

// À l'ouverture : lit ?parrain=… dans l'adresse et le garde. Le code reste dans l'adresse jusqu'à son utilisation :
// si la personne copie l'adresse (par exemple pour quitter le navigateur de Snapchat), l'invitation suit.
export function captureReferral() {
  try {
    const code = new URLSearchParams(window.location.search).get('parrain')?.toUpperCase()
    if (code && CODE_RE.test(code)) localStorage.setItem(KEY, code)
  } catch {
    // Stockage indisponible : le lien n'est simplement pas pris en compte.
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
    const params = new URLSearchParams(window.location.search)
    if (params.has('parrain')) {
      params.delete('parrain')
      const query = params.toString()
      window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`)
    }
  } catch {
    // rien à faire
  }
}

export const inviteLink = (code) => `https://lunaris-app.fr/?parrain=${code}`

// Partage du lien : menu de partage du téléphone, sinon copie dans le presse-papiers.
// Renvoie 'shared', 'copied' ou null (annulé ou impossible).
export async function shareInvite(code) {
  const url = inviteLink(code)
  const text = `Teste Lunaris : ton horoscope et 3 tâches à faire chaque jour. 7 jours offerts avec mon lien 🎁 ${url}`
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
