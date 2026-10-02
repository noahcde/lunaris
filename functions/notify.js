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

// Envoie la notification à tous les appareils d'une personne. Renvoie le nombre d'envois réussis
// et le code d'erreur de chaque échec ; les appareils désinscrits sont retirés du compte.
async function sendToUser(userDoc, { appUrl, body }) {
  const { firstName, notifications: n } = userDoc.data()
  const tokens = (n?.tokens ?? []).slice(-MAX_TOKENS)
  if (tokens.length === 0) return { successCount: 0, errors: ['aucun-appareil'] }

  const result = await getMessaging().sendEachForMulticast({
    tokens,
    notification: {
      title: 'Lunaris',
      body: body ?? (firstName ? `${firstName}, votre horoscope du jour est prêt ✨` : 'Votre horoscope du jour est prêt ✨'),
    },
    webpush: {
      headers: { Urgency: 'high' },
      notification: { icon: `${appUrl}/lunaris-192.png` },
      fcmOptions: { link: `${appUrl}/#accueil` },
    },
  })
  const errors = result.responses.filter((r) => !r.success).map((r) => r.error?.code ?? 'inconnue')
  const dead = tokens.filter((_, i) => DEAD_TOKEN_CODES.has(result.responses[i].error?.code))
  if (dead.length) await userDoc.ref.update({ 'notifications.tokens': FieldValue.arrayRemove(...dead) })
  return { successCount: result.successCount, errors }
}

export async function sendMorningNotifications({ appUrl, logger }) {
  const db = getFirestore()
  const now = new Date()
  const snap = await db.collection('users').where('notifications.enabled', '==', true).get()
  let sent = 0

  for (const userDoc of snap.docs) {
    const n = userDoc.data().notifications
    const { hour, date } = localNow(n.timeZone || 'Europe/Paris', now)
    if (hour !== (n.hour ?? 8) || n.lastSent === date || !n.tokens?.length) continue

    const { successCount, errors } = await sendToUser(userDoc, { appUrl })
    sent += successCount
    if (errors.length) logger.warn('Notification du matin non délivrée', { uid: userDoc.id, errors })
    await userDoc.ref.update({ 'notifications.lastSent': date })
  }
  logger.info('Notifications du matin', { candidates: snap.size, sent })
}

// Bouton « Envoyer une notification de test » du profil.
export async function sendTestNotification({ uid, appUrl, logger }) {
  const userDoc = await getFirestore().doc(`users/${uid}`).get()
  const result = await sendToUser(userDoc, { appUrl, body: 'Notification de test : tout fonctionne ✨' })
  logger.info('Notification de test', { uid, ...result })
  return result
}
