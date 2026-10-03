// Dates exactes des nouvelles et pleines lunes (Jean Meeus, « Astronomical Algorithms », chap. 49)
// et signe du zodiaque où elles tombent (longitude du Soleil, chap. 25). Précision : environ une minute.

const rad = (d) => (d * Math.PI) / 180
const DELTA_T = 70 / 86400 // écart entre temps terrestre et temps universel (vers 2026), en jours

function phaseJde(k, full) {
  const T = k / 1236.85
  const E = 1 - 0.002516 * T - 0.0000074 * T * T
  const M = rad(2.5534 + 29.1053567 * k - 0.0000014 * T * T - 0.00000011 * T ** 3)
  const Mp = rad(201.5643 + 385.81693528 * k + 0.0107582 * T * T + 0.00001238 * T ** 3 - 0.000000058 * T ** 4)
  const F = rad(160.7108 + 390.67050284 * k - 0.0016118 * T * T - 0.00000227 * T ** 3 + 0.000000011 * T ** 4)
  const O = rad(124.7746 - 1.56375588 * k + 0.0020672 * T * T + 0.00000215 * T ** 3)
  const s = Math.sin
  let jde = 2451550.09766 + 29.530588861 * k + 0.00015437 * T * T - 0.00000015 * T ** 3 + 0.00000000073 * T ** 4
  const c = full
    ? [-0.40614 * s(Mp), 0.17302 * E * s(M), 0.01614 * s(2 * Mp), 0.01043 * s(2 * F), 0.00734 * E * s(Mp - M)]
    : [-0.4072 * s(Mp), 0.17241 * E * s(M), 0.01608 * s(2 * Mp), 0.01039 * s(2 * F), 0.00739 * E * s(Mp - M)]
  c.push(
    (full ? -0.00515 : -0.00514) * E * s(Mp + M),
    (full ? 0.00209 : 0.00208) * E * E * s(2 * M),
    -0.00111 * s(Mp - 2 * F),
    -0.00057 * s(Mp + 2 * F),
    0.00056 * E * s(2 * Mp + M),
    -0.00042 * s(3 * Mp),
    0.00042 * E * s(M + 2 * F),
    0.00038 * E * s(M - 2 * F),
    -0.00024 * E * s(2 * Mp - M),
    -0.00017 * s(O),
    -0.00007 * s(Mp + 2 * M),
    0.00004 * s(2 * Mp - 2 * F),
    0.00004 * s(3 * M),
    0.00003 * s(Mp + M - 2 * F),
    0.00003 * s(2 * Mp + 2 * F),
    -0.00003 * s(Mp + M + 2 * F),
    0.00003 * s(Mp - M + 2 * F),
    -0.00002 * s(Mp - M - 2 * F),
    -0.00002 * s(3 * Mp + M),
    0.00002 * s(4 * Mp),
  )
  for (const x of c) jde += x
  return jde
}

// Longitude apparente du Soleil, en degrés.
function sunLongitude(jd) {
  const T = (jd - 2451545) / 36525
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T
  const M = rad(357.52911 + 35999.05029 * T - 0.0001537 * T * T)
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
    0.000289 * Math.sin(3 * M)
  const O = rad(125.04 - 1934.136 * T)
  return (((L0 + C - 0.00569 - 0.00478 * Math.sin(O)) % 360) + 360) % 360
}

export const SIGN_ORDER = ['belier', 'taureau', 'gemeaux', 'cancer', 'lion', 'vierge', 'balance', 'scorpion', 'sagittaire', 'capricorne', 'verseau', 'poissons']

// Toutes les nouvelles et pleines lunes entre deux dates (objets Date), dans l'ordre.
export function lunations(from, to) {
  const events = []
  const year = from.getUTCFullYear() + from.getUTCMonth() / 12
  for (let k = Math.floor((year - 2000) * 12.3685) - 1; ; k++) {
    for (const full of [false, true]) {
      const jde = phaseJde(full ? k + 0.5 : k, full)
      const jd = jde - DELTA_T
      const date = new Date((jd - 2440587.5) * 86400000)
      if (date > to) return events
      if (date < from) continue
      const moonLon = (sunLongitude(jd) + (full ? 180 : 0)) % 360
      events.push({ type: full ? 'pleine' : 'nouvelle', date, sign: SIGN_ORDER[Math.floor(moonLon / 30)], degree: moonLon % 30 })
    }
  }
}
