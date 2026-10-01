// Notifications du matin (Firebase Cloud Messaging).
// Lancé chaque heure : envoie un rappel aux personnes dont c'est l'heure choisie, dans leur fuseau horaire,
// une seule fois par jour. Réglages et jetons des appareils : users/{uid}.notifications (écrits par l'app).
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'

const MAX_TOKENS = 10 // appareils gardés par personne (les plus récents)
const DEAD_TOKEN_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
  'messaging/invalid-argument',
])

// Heure (0-23) et date AAAA-MM-JJ actuelles dans un fuseau horaire donné.
function localNow(timeZone, now) {
  let parts
  try {
    parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(now)
  } catch {
    return localNow('Europe/Paris', now) // fuseau inconnu
  }
  const get = (type) => parts.find((p) => p.type === type).value
  return { hour: Number(get('hour')), date: `${get('year')}-${get('month')}-${get('day')}` }
}

export async function sendMorningNotifications({ appUrl, logger }) {
  const db = getFirestore()
  const messaging = getMessaging()
  const now = new Date()
  const snap = await db.collection('users').where('notifications.enabled', '==', true).get()
  let sent = 0

  for (const userDoc of snap.docs) {
    const { firstName, notifications: n } = userDoc.data()
    const { hour, date } = localNow(n.timeZone || 'Europe/Paris', now)
    const tokens = (n.tokens ?? []).slice(-MAX_TOKENS)
    if (hour !== (n.hour ?? 8) || n.lastSent === date || tokens.length === 0) continue

    const result = await messaging.sendEachForMulticast({
      tokens,
      notification: {
        title: 'Lunaris',
        body: firstName ? `${firstName}, votre horoscope du jour est prêt ✨` : 'Votre horoscope du jour est prêt ✨',
      },
      webpush: {
        notification: { icon: `${appUrl}/icon-192.png` },
        fcmOptions: { link: `${appUrl}/#accueil` },
      },
    })
    const dead = tokens.filter((_, i) => DEAD_TOKEN_CODES.has(result.responses[i].error?.code))
    sent += result.successCount
    await userDoc.ref.update({
      'notifications.lastSent': date,
      ...(dead.length ? { 'notifications.tokens': FieldValue.arrayRemove(...dead) } : {}),
    })
  }
  logger.info('Notifications du matin', { candidates: snap.size, sent })
}
