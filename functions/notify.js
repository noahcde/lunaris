// Notifications du matin (Firebase Cloud Messaging).
// Lancé chaque minute : envoie un rappel aux personnes dont l'heure choisie (heure et minute, dans leur fuseau)
// est arrivée, puis programme l'envoi du lendemain. Réglages et jetons des appareils : users/{uid}.notifications (écrits par l'app).
import { getFirestore, FieldPath, FieldValue } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import { nextSendAt } from './schedule.js'
import { sunSign } from './astro.js'

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
// Sites d'où une personne peut avoir activé les notifications : le toucher rouvre le même site,
// sinon elle arriverait sur un autre domaine où elle n'est pas connectée.
const APP_ORIGINS = new Set([
  'https://lunaris-app.fr',
  'https://www.lunaris-app.fr',
  'https://lunaris.fr',
  'https://www.lunaris.fr',
  'https://horoscope-55ff8.web.app',
  'https://horoscope-55ff8.firebaseapp.com',
])

// Envoie la notification à tous les appareils d'une personne. Renvoie le nombre d'envois réussis
// et le code d'erreur de chaque échec ; les appareils désinscrits sont retirés du compte.
async function sendToUser(userDoc, { appUrl, body }) {
  const { firstName, notifications: n } = userDoc.data()
  const tokens = (n?.tokens ?? []).slice(-MAX_TOKENS)
  if (tokens.length === 0) return { successCount: 0, errors: ['aucun-appareil'] }

  // Un envoi par site d'origine, chacun avec son propre lien.
  const groups = new Map()
  for (const token of tokens) {
    const origin = APP_ORIGINS.has(n.origins?.[token]) ? n.origins[token] : appUrl
    groups.set(origin, [...(groups.get(origin) ?? []), token])
  }

  let successCount = 0
  const errors = []
  const dead = []
  for (const [origin, group] of groups) {
    const result = await getMessaging().sendEachForMulticast({
      tokens: group,
      notification: {
        title: 'Lunaris',
        body: body ?? (firstName ? `${firstName}, votre horoscope du jour est prêt ✨` : 'Votre horoscope du jour est prêt ✨'),
      },
      webpush: {
        headers: { Urgency: 'high' },
        notification: { icon: `${origin}/lunaris-192.png` },
        fcmOptions: { link: `${origin}/#accueil` },
      },
    })
    successCount += result.successCount
    result.responses.forEach((r, i) => {
      if (r.success) return
      errors.push(r.error?.code ?? 'inconnue')
      if (DEAD_TOKEN_CODES.has(r.error?.code)) dead.push(group[i])
    })
  }
  if (dead.length) {
    await userDoc.ref.update(
      'notifications.tokens',
      FieldValue.arrayRemove(...dead),
      ...dead.flatMap((t) => [new FieldPath('notifications', 'origins', t), FieldValue.delete()]),
    )
  }
  return { successCount, errors }
}

// Texte de la notification du matin : la phrase du jour du signe de la personne (functions/phrase.js),
// ou le rappel habituel si son signe est inconnu ou si la phrase n'a pas pu être générée.
async function morningBody(userData, date, phraseOf, logger) {
  if (!phraseOf || !userData.birthDate) return undefined
  try {
    const sign = sunSign(userData.birthDate)
    const phrase = await phraseOf(date, sign)
    return phrase ? `${sign} · ${phrase}` : undefined
  } catch (err) {
    logger.warn('Phrase du jour indisponible', { date, error: String(err) })
    return undefined
  }
}

// phraseOf(date, signe) : phrase du jour d'un signe (peut échouer : le rappel habituel est alors envoyé).
export async function sendMorningNotifications({ appUrl, logger, phraseOf }) {
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
      const body = await morningBody(userDoc.data(), localDate(n.timeZone, now), phraseOf, logger)
      const { successCount, errors } = await sendToUser(userDoc, { appUrl, body })
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

// Parrainage : prévient le parrain qu'un ami l'a rejoint (sans effet s'il n'a pas activé les notifications).
export async function sendReferralNotification({ uid, friendName, appUrl, logger }) {
  const userDoc = await getFirestore().doc(`users/${uid}`).get()
  if (!userDoc.exists || !userDoc.data().notifications?.tokens?.length) return
  const who = friendName || 'Un ami'
  const result = await sendToUser(userDoc, { appUrl, body: `${who} a rejoint Lunaris grâce à vous : 7 jours offerts 🎁` })
  logger.info('Notification de parrainage', { uid, ...result })
}
