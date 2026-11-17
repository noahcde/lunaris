// Cloud Functions appelées par l'app :
// - getDaily : horoscope et 3 tâches du jour, réservés aux abonnés. Le résultat est mis en cache dans
//   users/{uid}/daily/{date} : un seul appel à l'IA par personne et par jour.
// - getBilling, startCheckout, openBillingPortal : abonnement Stripe (voir billing.js).
// - morningNotifications : rappel quotidien à l'heure et la minute choisies par chacun (voir notify.js), lancé chaque minute.
//   La notification contient la phrase du jour du signe de la personne (voir phrase.js, un appel à l'IA par jour en tout).
// - getReferral, claimReferral : parrainage, 7 jours offerts à l'ami et au parrain (voir referral.js).
import { defineSecret, defineString } from 'firebase-functions/params'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { logger } from 'firebase-functions'
import { dayContext, sunSign } from './astro.js'

// Les modules lourds (Firebase Admin, OpenAI) sont chargés à la première requête seulement :
// le déploiement analyse ce fichier avec un délai court, et un chargement lent le fait échouer.
let deps = null
async function loadDeps() {
  if (!deps) {
    const [{ initializeApp, getApps }, { getFirestore, FieldValue }, { generateDaily, generateOpening }, billing, referral, phrase] = await Promise.all([
      import('firebase-admin/app'),
      import('firebase-admin/firestore'),
      import('./daily.js'),
      import('./billing.js'),
      import('./referral.js'),
      import('./phrase.js'),
    ])
    // firebase-functions crée sa propre app nommée : on vérifie l'app par défaut, pas le nombre d'apps.
    if (!getApps().some((app) => app.name === '[DEFAULT]')) initializeApp()
    deps = { db: getFirestore(), FieldValue, generateDaily, generateOpening, billing, referral, phrase }
  }
  return deps
}
const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY')
const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY')
// Modèle OpenAI utilisé, modifiable sans toucher au code (fichier functions/.env).
const OPENAI_MODEL = defineString('OPENAI_MODEL', { default: 'gpt-5.4-mini' })
// Comptes Google ayant tout l'accès sans abonnement (propriétaires de l'app), séparés par des virgules (functions/.env).
const FREE_ACCESS_EMAILS = defineString('FREE_ACCESS_EMAILS', { default: '' })
// Adresse du site ouverte au clic sur une notification (functions/.env).
const APP_URL = defineString('APP_URL', { default: 'https://horoscope-55ff8.web.app' })

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

// Adresses vers lesquelles Stripe peut renvoyer l'utilisateur après le paiement.
const ALLOWED_ORIGINS = [
  'https://horoscope-55ff8.web.app',
  'https://horoscope-55ff8.firebaseapp.com',
  'https://lunaris.fr',
  'https://www.lunaris.fr',
  'https://lunaris-app.fr',
  'https://www.lunaris-app.fr',
  'http://localhost:5173',
]
const originOf = (request) => {
  const origin = request.rawRequest?.headers?.origin
  return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
}

const FREE_ACCESS = {
  active: true,
  status: 'free',
  plan: null,
  trialEnd: null,
  periodEnd: null,
  cancelAtPeriodEnd: false,
  trialUsed: true,
  hasCustomer: false,
}

// Adresse vérifiée par Google uniquement : impossible de s'attribuer l'accès en changeant son profil.
const hasFreeAccess = (request) => {
  const { email, email_verified: verified } = request.auth?.token ?? {}
  if (!email || !verified) return false
  const allowed = FREE_ACCESS_EMAILS.value()
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return allowed.includes(email.toLowerCase())
}

const requireUid = (request) => {
  const uid = request.auth?.uid
  if (!uid) throw new HttpsError('unauthenticated', 'Connexion requise.')
  return uid
}

// Accès Premium : propriétaires, abonnement Stripe, ou jours offerts par le parrainage (status 'gift').
async function accessState(request, uid, { refresh = false } = {}) {
  if (hasFreeAccess(request)) return FREE_ACCESS
  const { billing, referral } = await loadDeps()
  const state = await stripeCall('Lecture de l’abonnement impossible', uid, () => billing.getBillingState(uid, { refresh }))
  if (state.active) return state
  const until = await referral.grantUntil(uid)
  if (until > Date.now()) return { ...state, active: true, status: 'gift', periodEnd: Math.floor(until / 1000) }
  return state
}

// Textes du jour d'un signe (mêmes pour tout le signe, voir phrase.js).
async function textsOf(date) {
  const { phrase } = await loadDeps()
  return phrase.phrasesOfDay({ model: OPENAI_MODEL.value(), date })
}
// Seule la phrase va dans la notification ; l'horoscope général reste dans l'app.
async function phraseOf(date, sign) {
  return (await textsOf(date)).signs[sign] ?? null
}

const stripeCall = async (label, uid, fn) => {
  try {
    return await fn()
  } catch (err) {
    logger.error(label, { uid, error: String(err) })
    throw new HttpsError('unavailable', 'Le service de paiement est indisponible. Réessayez dans un instant.')
  }
}

export const getBilling = onCall(
  { secrets: [STRIPE_SECRET_KEY], region: 'europe-west1', maxInstances: 10 },
  async (request) => {
    const uid = requireUid(request)
    return accessState(request, uid, { refresh: request.data?.refresh === true })
  },
)

export const startCheckout = onCall(
  { secrets: [STRIPE_SECRET_KEY], region: 'europe-west1', maxInstances: 10 },
  async (request) => {
    const uid = requireUid(request)
    const { billing } = await loadDeps()
    const plan = request.data?.plan
    if (!billing.isPlan(plan)) throw new HttpsError('invalid-argument', 'Formule inconnue.')
    return stripeCall('Création du paiement impossible', uid, () =>
      billing.createCheckout({ uid, email: request.auth.token.email, plan, origin: originOf(request) }),
    )
  },
)

export const openBillingPortal = onCall(
  { secrets: [STRIPE_SECRET_KEY], region: 'europe-west1', maxInstances: 10 },
  async (request) => {
    const uid = requireUid(request)
    const { billing } = await loadDeps()
    return stripeCall('Ouverture de l’espace abonnement impossible', uid, () =>
      billing.createPortal({ uid, origin: originOf(request) }),
    )
  },
)

export const getDaily = onCall(
  { secrets: [OPENAI_API_KEY, STRIPE_SECRET_KEY], region: 'europe-west1', timeoutSeconds: 120, maxInstances: 10 },
  async (request) => {
    const uid = requireUid(request)

    // La date vient du téléphone (fuseau de l'utilisateur) ; on refuse tout écart de plus d'un jour.
    const date = request.data?.date
    if (!DATE_RE.test(date ?? '')) throw new HttpsError('invalid-argument', 'Date invalide.')
    const drift = Math.abs(Date.parse(`${date}T12:00:00Z`) - Date.now())
    if (!(drift < 2 * 86400000)) throw new HttpsError('invalid-argument', 'Date hors limites.')

    const { db, FieldValue, generateDaily } = await loadDeps()

    // Sans abonnement : un seul jour d'aperçu (message du jour + 1 tâche), le premier jour où la personne ouvre l'app.
    // Ensuite, gratuit pour toujours : la phrase du jour et l'horoscope général de son signe,
    // plus le début de son horoscope personnel (titre + première phrase) ; le reste est flouté.
    const state = await accessState(request, uid)
    if (!state.active) {
      // previews/{uid} n'est accessible qu'au serveur : l'app ne peut pas remettre l'aperçu à zéro.
      const previewRef = db.doc(`previews/${uid}`)
      const previewDate = (await previewRef.get()).data()?.date
      if (previewDate && previewDate !== date) {
        const [phrase, opening] = await Promise.all([freePhrase(db, uid, date), openingFor(db, FieldValue, uid, date)])
        return { date, locked: true, phrase, opening }
      }
      const daily = await dailyFor({ db, FieldValue, generateDaily, uid, date })
      if (!previewDate) await previewRef.set({ date, at: FieldValue.serverTimestamp() })
      return {
        date,
        locked: true,
        preview: { insight: { title: daily.insight.title, text: daily.insight.text }, tasks: daily.tasks.slice(0, 1) },
      }
    }

    return dailyFor({ db, FieldValue, generateDaily, uid, date })
  },
)

// Partie gratuite { sign, text, general } (phrase + horoscope général du signe), ou null si le profil ou la génération manque (l'app floute alors tout).
async function freePhrase(db, uid, date) {
  try {
    const birthDate = (await db.doc(`users/${uid}`).get()).data()?.birthDate
    if (!birthDate) return null
    const sign = sunSign(birthDate)
    const { signs, general } = await textsOf(date)
    const text = signs[sign]
    return text ? { sign, text, general: general[sign] ?? null } : null
  } catch (err) {
    logger.warn('Phrase du jour indisponible', { uid, date, error: String(err) })
    return null
  }
}

// Personne / profil utilisés par l'IA.
const personOf = (user) => ({
  firstName: user.firstName,
  sign: sunSign(user.birthDate),
  birthTime: user.birthTimeUnknown ? null : user.birthTime,
  quiz: user.quiz,
})

// Début gratuit de l'horoscope personnel { title, text }, généré une fois par jour et gardé dans openings/{uid_date}
// (collection inaccessible depuis l'app). null en cas d'échec : l'app floute alors tout l'horoscope personnel.
async function openingFor(db, FieldValue, uid, date) {
  const ref = db.doc(`openings/${uid}_${date}`)
  try {
    const snap = await ref.get()
    if (snap.exists) return { title: snap.data().title, text: snap.data().text }
    const user = (await db.doc(`users/${uid}`).get()).data()
    if (!user?.birthDate) return null
    const { generateOpening } = await loadDeps()
    const opening = await generateOpening({ model: OPENAI_MODEL.value(), ...personOf(user), ...dayContext(date) })
    await ref.set({ ...opening, uid, date, generatedAt: FieldValue.serverTimestamp() })
    return opening
  } catch (err) {
    logger.warn('Début d’horoscope indisponible', { uid, date, error: String(err) })
    return null
  }
}

// Horoscope et tâches du jour, générés une fois puis relus depuis users/{uid}/daily/{date}.
async function dailyFor({ db, FieldValue, generateDaily, uid, date }) {
  const cacheRef = db.doc(`users/${uid}/daily/${date}`)
  const cached = await cacheRef.get()
  if (cached.exists) {
    const { generatedAt, ...daily } = cached.data()
    return daily
  }

  const user = (await db.doc(`users/${uid}`).get()).data()
  if (!user?.birthDate) throw new HttpsError('failed-precondition', 'Profil incomplet.')

  // Tâches des 7 jours précédents : l'IA doit en proposer d'autres.
  const previousDays = [1, 2, 3, 4, 5, 6, 7].map((k) =>
    new Date(Date.parse(`${date}T12:00:00Z`) - k * 86400000).toISOString().slice(0, 10),
  )
  const previous = await db.getAll(...previousDays.map((d) => db.doc(`users/${uid}/daily/${d}`)))
  const recentTasks = previous.flatMap((d) => (d.exists ? (d.data().tasks ?? []).map((t) => t.title) : []))

  // Début déjà montré gratuitement ce jour-là : l'horoscope complet le reprend, pour ne pas changer sous ses yeux.
  const openingSnap = await db.doc(`openings/${uid}_${date}`).get()
  const opening = openingSnap.exists ? { title: openingSnap.data().title, text: openingSnap.data().text } : null

  try {
    const daily = await generateDaily({
      uid,
      date,
      recentTasks,
      opening,
      model: OPENAI_MODEL.value(),
      ...personOf(user),
      ...dayContext(date),
    })
    await cacheRef.set({ ...daily, date, generatedAt: FieldValue.serverTimestamp() })
    return { ...daily, date }
  } catch (err) {
    logger.error('Génération du jour impossible', { uid, date, error: String(err) })
    throw new HttpsError('unavailable', 'La génération a échoué. Réessayez dans un instant.')
  }
}

export const morningNotifications = onSchedule(
  { schedule: '* * * * *', timeZone: 'Europe/Paris', region: 'europe-west1', timeoutSeconds: 120, secrets: [OPENAI_API_KEY] },
  async () => {
    await loadDeps() // initialise Firebase Admin
    const { sendMorningNotifications } = await import('./notify.js')
    await sendMorningNotifications({ appUrl: APP_URL.value(), logger, phraseOf })
  },
)

export const sendTestNotification = onCall({ region: 'europe-west1', maxInstances: 10 }, async (request) => {
  const uid = requireUid(request)
  await loadDeps() // initialise Firebase Admin
  const notify = await import('./notify.js')
  return notify.sendTestNotification({ uid, appUrl: APP_URL.value(), logger })
})

// Parrainage : lien d'invitation de la personne et nombre d'amis invités.
export const getReferral = onCall({ region: 'europe-west1', maxInstances: 10 }, async (request) => {
  const uid = requireUid(request)
  const { referral } = await loadDeps()
  return referral.referralOf(uid)
})

// Parrainage : un nouveau compte arrivé par un lien d'invitation. L'ami reçoit 7 jours offerts tout de suite ;
// le parrain aussi (jours offerts, ou prochain prélèvement repoussé de 7 jours s'il est abonné).
export const claimReferral = onCall(
  { secrets: [STRIPE_SECRET_KEY], region: 'europe-west1', maxInstances: 10 },
  async (request) => {
    const uid = requireUid(request)
    const { db, billing, referral } = await loadDeps()
    const state = await stripeCall('Lecture de l’abonnement impossible', uid, () => billing.getBillingState(uid))
    const result = await referral.claim({ uid, code: String(request.data?.code ?? '').toUpperCase(), hasSubscriptionHistory: state.trialUsed })
    if (!result.ok) return { ok: false, reason: result.reason }

    if (result.rewardReferrer) {
      try {
        const extended = await billing.extendSubscription(result.referrer, referral.REWARD_DAYS)
        if (!extended) await referral.addGrant(result.referrer, referral.REWARD_DAYS)
      } catch (err) {
        // Stripe injoignable : le parrain reçoit ses jours en accès offert plutôt que rien.
        logger.error('Récompense du parrain via Stripe impossible', { referrer: result.referrer, error: String(err) })
        await referral.addGrant(result.referrer, referral.REWARD_DAYS)
      }
      const friendName = (await db.doc(`users/${uid}`).get()).data()?.firstName
      const { sendReferralNotification } = await import('./notify.js')
      await sendReferralNotification({ uid: result.referrer, friendName, appUrl: APP_URL.value(), logger }).catch(() => {})
    }
    logger.info('Parrainage', { uid, referrer: result.referrer, rewardReferrer: result.rewardReferrer })
    return { ok: true, days: referral.REWARD_DAYS }
  },
)
