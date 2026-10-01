import { addDays } from './astro'

// Clé locale AAAA-MM-JJ (évite les décalages de fuseau de toISOString).
export const dayKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// Série en cours : jours consécutifs complétés jusqu'à aujourd'hui.
// Si aujourd'hui n'est pas encore complété, la série d'hier reste active.
export function currentStreak(set, today) {
  let start = set.has(dayKey(today)) ? 0 : 1
  let count = 0
  while (set.has(dayKey(addDays(today, -(start + count))))) count++
  return count
}

export function bestStreak(set) {
  let best = 0
  for (const key of set) {
    const [y, m, d] = key.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    if (set.has(dayKey(addDays(date, -1)))) continue // pas le début d'une série
    let run = 1
    while (set.has(dayKey(addDays(date, run)))) run++
    best = Math.max(best, run)
  }
  return best
}
