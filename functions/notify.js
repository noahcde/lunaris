// Notifications du matin (Firebase Cloud Messaging).
// Lancé chaque minute : envoie un rappel aux personnes dont l'heure choisie (heure et minute, dans leur fuseau)
// est arrivée, puis programme l'envoi du lendemain. Réglages et jetons des appareils : users/{uid}.notifications (écrits par l'app).
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import { nextSendAt } from './schedule.js'

const MAX_TOKENS = 10 // appareils gardés par personne (les plus récents)
const DEAD_TOKEN_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
  'messaging/invalid-argument',
])

// Date AAAA-MM-JJ dans un fuseau horaire donné (fuseau inconnu : Paris).
function localDate(timeZone, now) {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: timeZone || 'Europe/Paris' }).format(now)
  } catch {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(now)
  }
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
  const now = new Date()
  // Seules les personnes dont l'heure d'envoi est arrivée sont lues (notifications.nextSendAt, calculé par l'app).
  const snap = await getFirestore().collection('users').where('notifications.nextSendAt', '<=', now).get()
  let sent = 0

  for (const userDoc of snap.docs) {
    const n = userDoc.data().notifications
    const next = nextSendAt(n, new Date(now.getTime() + 60000))
    if (!n.enabled) {
      await userDoc.ref.update({ 'notifications.nextSendAt': null })
      continue
    }
    if (n.tokens?.length) {
      const { successCount, errors } = await sendToUser(userDoc, { appUrl })
      sent += successCount
      if (errors.length) logger.warn('Notification du matin non délivrée', { uid: userDoc.id, errors })
    }
    await userDoc.ref.update({ 'notifications.lastSent': localDate(n.timeZone, now), 'notifications.nextSendAt': next })
  }
  if (snap.size) logger.info('Notifications du matin', { candidates: snap.size, sent })
}

// Bouton « Envoyer une notification de test » du profil.
export async function sendTestNotification({ uid, appUrl, logger }) {
  const userDoc = await getFirestore().doc(`users/${uid}`).get()
  const result = await sendToUser(userDoc, { appUrl, body: 'Notification de test : tout fonctionne ✨' })
  logger.info('Notification de test', { uid, ...result })
  return result
}
