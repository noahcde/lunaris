// Cloud Functions appelées par l'app :
// - getDaily : horoscope et 3 tâches du jour, réservés aux abonnés. Le résultat est mis en cache dans
//   users/{uid}/daily/{date} : un seul appel à l'IA par personne et par jour.
// - getBilling, startCheckout, openBillingPortal : abonnement Stripe (voir billing.js).
import { defineSecret, defineString } from 'firebase-functions/params'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions'
import { dayContext, sunSign } from './astro.js'

// Les modules lourds (Firebase Admin, OpenAI) sont chargés à la première requête seulement :
// le déploiement analyse ce fichier avec un délai court, et un chargement lent le fait échouer.
let deps = null
async function loadDeps() {
  if (!deps) {
    const [{ initializeApp, getApps }, { getFirestore, FieldValue }, { generateDaily }, billing] = await Promise.all([
      import('firebase-admin/app'),
      import('firebase-admin/firestore'),
      import('./daily.js'),
      import('./billing.js'),
    ])
    // firebase-functions crée sa propre app nommée : on vérifie l'app par défaut, pas le nombre d'apps.
    if (!getApps().some((app) => app.name === '[DEFAULT]')) initializeApp()
    deps = { db: getFirestore(), FieldValue, generateDaily, billing }
  }
  return deps
}
const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY')
const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY')
// Modèle OpenAI utilisé, modifiable sans toucher au code (fichier functions/.env).
const OPENAI_MODEL = defineString('OPENAI_MODEL', { default: 'gpt-5.4-mini' })

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

// Adresses vers lesquelles Stripe peut renvoyer l'utilisateur après le paiement.
const ALLOWED_ORIGINS = [
  'https://horoscope-55ff8.web.app',
  'https://horoscope-55ff8.firebaseapp.com',
  'http://localhost:5173',
]
const originOf = (request) => {
  const origin = request.rawRequest?.headers?.origin
  return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
}

const requireUid = (request) => {
  const uid = request.auth?.uid
  if (!uid) throw new HttpsError('unauthenticated', 'Connexion requise.')
  return uid
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
    const { billing } = await loadDeps()
    return stripeCall('Lecture de l’abonnement impossible', uid, () =>
      billing.getBillingState(uid, { refresh: request.data?.refresh === true }),
    )
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

    const { db, FieldValue, generateDaily, billing } = await loadDeps()

    // Sans abonnement, aucun contenu n'est envoyé : l'app affiche un texte flouté à la place.
    const state = await stripeCall('Lecture de l’abonnement impossible', uid, () => billing.getBillingState(uid))
    if (!state.active) return { date, locked: true }

    const cacheRef = db.doc(`users/${uid}/daily/${date}`)
    const cached = await cacheRef.get()
    if (cached.exists) return cached.data()

    const user = (await db.doc(`users/${uid}`).get()).data()
    if (!user?.birthDate) throw new HttpsError('failed-precondition', 'Profil incomplet.')

    try {
      const daily = await generateDaily({
        model: OPENAI_MODEL.value(),
        firstName: user.firstName,
        sign: sunSign(user.birthDate),
        birthTime: user.birthTimeUnknown ? null : user.birthTime,
        ...dayContext(date),
      })
      const result = { ...daily, date, generatedAt: FieldValue.serverTimestamp() }
      await cacheRef.set(result)
      return { ...daily, date }
    } catch (err) {
      logger.error('Génération du jour impossible', { uid, date, error: String(err) })
      throw new HttpsError('unavailable', 'La génération a échoué. Réessayez dans un instant.')
    }
  },
)
