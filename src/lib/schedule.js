// Prochain envoi de la notification du matin : le prochain instant où il est hour:minute dans le fuseau donné.
// (Même code que functions/schedule.js : le serveur le recalcule après chaque envoi.)

function parts(date, timeZone) {
  const p = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date)
  const get = (type) => Number(p.find((x) => x.type === type).value)
  return { y: get('year'), m: get('month') - 1, d: get('day'), h: get('hour'), mi: get('minute'), s: get('second') }
}

// Écart (ms) entre l'heure locale du fuseau et l'heure UTC, à un instant donné (change avec l'heure d'été).
function offset(ms, timeZone) {
  const p = parts(new Date(ms), timeZone)
  return Date.UTC(p.y, p.m, p.d, p.h, p.mi, p.s) - Math.floor(ms / 1000) * 1000
}

function zonedToUtc(y, m, d, h, mi, timeZone) {
  const guess = Date.UTC(y, m, d, h, mi)
  const first = offset(guess, timeZone)
  const second = offset(guess - first, timeZone)
  return guess - second
}

const validZone = (timeZone) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone })
    return timeZone
  } catch {
    return 'Europe/Paris'
  }
}

export function nextSendAt({ hour = 8, minute = 0, timeZone = 'Europe/Paris' }, now = new Date()) {
  const zone = validZone(timeZone || 'Europe/Paris')
  const today = parts(now, zone)
  for (let k = 0; k < 3; k++) {
    const t = zonedToUtc(today.y, today.m, today.d + k, hour, minute, zone)
    if (t > now.getTime()) return new Date(t)
  }
  return new Date(now.getTime() + 86400000)
}
