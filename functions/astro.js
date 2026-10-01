// Copie côté serveur des calculs de src/lib/astro.js (signe solaire, phase lunaire, statut du jour).
const SYNODIC_MONTH = 29.530588853
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14)
const DAY_MS = 86400000
const MOON_NAMES = [
  'Nouvelle lune', 'Premier croissant', 'Premier quartier', 'Gibbeuse croissante',
  'Pleine lune', 'Gibbeuse décroissante', 'Dernier quartier', 'Dernier croissant',
]
const SIGNS = [
  ['Capricorne', 1, 19], ['Verseau', 2, 18], ['Poissons', 3, 20], ['Bélier', 4, 19],
  ['Taureau', 5, 20], ['Gémeaux', 6, 20], ['Cancer', 7, 22], ['Lion', 8, 22],
  ['Vierge', 9, 22], ['Balance', 10, 22], ['Scorpion', 11, 21], ['Sagittaire', 12, 21],
  ['Capricorne', 12, 31],
]

export function sunSign(birthDate) {
  const [, m, d] = birthDate.split('-').map(Number)
  return SIGNS.find(([, month, lastDay]) => m < month || (m === month && d <= lastDay))[0]
}

// dateKey au format AAAA-MM-JJ (date locale de l'utilisateur).
export function dayContext(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number)
  const noon = Date.UTC(y, m - 1, d, 12)
  const age = ((((noon - KNOWN_NEW_MOON) / DAY_MS) % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH
  const illumination = Math.round(((1 - Math.cos((2 * Math.PI * age) / SYNODIC_MONTH)) / 2) * 100)
  const moonPhase = MOON_NAMES[Math.round((age / SYNODIC_MONTH) * 8) % 8]

  const n = Math.floor(Date.UTC(y, m - 1, d) / DAY_MS)
  const hash = (n * 7919 + 13) % 11
  let dayStatus = 'journée neutre'
  if (hash === 2 || hash === 9) dayStatus = 'jour bloqué, à éviter pour les décisions engageantes'
  else if (hash === 0 || hash === 6 || illumination >= 98 || illumination <= 2) dayStatus = 'jour de haute manifestation, favorable aux lancements'

  const dateLabel = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  })
  return { moonPhase: `${moonPhase} (${illumination} % éclairée)`, dayStatus, dateLabel }
}
