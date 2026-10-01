// Calculs astrologiques simplifiés et déterministes (aucune donnée externe).

const SYNODIC_MONTH = 29.530588853
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14) // 6 janv. 2000, 18:14 UTC
const DAY_MS = 86400000

const MOON_NAMES = [
  'Nouvelle lune',
  'Premier croissant',
  'Premier quartier',
  'Gibbeuse croissante',
  'Pleine lune',
  'Gibbeuse décroissante',
  'Dernier quartier',
  'Dernier croissant',
]

export function getMoonPhase(date) {
  // Phase évaluée à midi pour qu'un même jour donne toujours le même résultat.
  const noon = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12)
  const days = (noon - KNOWN_NEW_MOON) / DAY_MS
  const age = ((days % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH
  const illumination = Math.round(((1 - Math.cos((2 * Math.PI * age) / SYNODIC_MONTH)) / 2) * 100)
  const index = Math.round((age / SYNODIC_MONTH) * 8) % 8
  return { name: MOON_NAMES[index], index, illumination }
}

const HIGH_NOTES = [
  'Lune en trigone avec Jupiter : lancez ce qui compte.',
  'Soleil sextile Vénus : fenêtre propice aux accords.',
  'Mercure direct et fluide : idéal pour signer ou présenter.',
  'Mars en harmonie avec le Soleil : l’élan est de votre côté.',
]
const NORMAL_NOTES = [
  'Énergie stable. Idéal pour avancer sur l’existant.',
  'Journée neutre. Consolidez et rangez.',
  'Rythme régulier. Privilégiez les tâches de fond.',
  'Ciel calme. Bon moment pour planifier la suite.',
]
const BLOCKED_NOTES = [
  'Mars carré Saturne : évitez les décisions engageantes.',
  'Lune hors course : reportez les lancements importants.',
]

const dayNumber = (date) =>
  Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS)

// Statut d'un jour : 'high' (haute manifestation), 'blocked' ou 'normal'.
export function getDayInfo(date) {
  const n = dayNumber(date)
  const hash = (n * 7919 + 13) % 11
  const moon = getMoonPhase(date)

  let status = 'normal'
  if (hash === 2 || hash === 9) status = 'blocked'
  else if (hash === 0 || hash === 6 || moon.illumination >= 98 || moon.illumination <= 2) status = 'high'

  const pool = status === 'high' ? HIGH_NOTES : status === 'blocked' ? BLOCKED_NOTES : NORMAL_NOTES
  const energy = status === 'high' ? 80 + (n % 4) * 5 : status === 'blocked' ? 25 + (n % 3) * 5 : 50 + (n % 5) * 5

  return { status, note: pool[n % pool.length], moon, energy }
}

export const STATUS_LABELS = {
  high: 'Haute manifestation',
  normal: 'Jour normal',
  blocked: 'Jour bloqué',
}

export const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

export const addDays = (date, n) => {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

export const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

export const cx = (...classes) => classes.filter(Boolean).join(' ')

export const longDate = (d) =>
  capitalize(d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }))

// Signe solaire à partir d'une date de naissance « AAAA-MM-JJ ».
const SIGNS = [
  ['Capricorne', 1, 19],
  ['Verseau', 2, 18],
  ['Poissons', 3, 20],
  ['Bélier', 4, 19],
  ['Taureau', 5, 20],
  ['Gémeaux', 6, 20],
  ['Cancer', 7, 22],
  ['Lion', 8, 22],
  ['Vierge', 9, 22],
  ['Balance', 10, 22],
  ['Scorpion', 11, 21],
  ['Sagittaire', 12, 21],
  ['Capricorne', 12, 31],
]

export function sunSign(birthDate) {
  if (!birthDate) return null
  const [, m, d] = birthDate.split('-').map(Number)
  return SIGNS.find(([, month, lastDay]) => m < month || (m === month && d <= lastDay))[0]
}
