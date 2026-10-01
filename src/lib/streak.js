import { addDays } from './astro'

// Clé locale AAAA-MM-JJ (évite les décalages de fuseau de toISOString).
export const dayKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// Une série ne compte qu'à partir de deux jours accomplis d'affilée.
export const STREAK_MIN = 2
const asStreak = (run) => (run >= STREAK_MIN ? run : 0)

// Jours consécutifs complétés jusqu'à aujourd'hui (même un seul).
// Si aujourd'hui n'est pas encore complété, la série d'hier reste active.
export function currentRun(set, today) {
  let start = set.has(dayKey(today)) ? 0 : 1
  let count = 0
  while (set.has(dayKey(addDays(today, -(start + count))))) count++
  return count
}

// Série en cours affichée : 0 tant qu'il n'y a pas deux jours d'affilée.
export const currentStreak = (set, today) => asStreak(currentRun(set, today))

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
  return asStreak(best)
}
