// Backend réel : Firebase Authentication (Google) + Cloud Firestore.
// Document par utilisateur : users/{uid}
//   { firstName, lastName, birthDate, birthTime, completedDays: string[], today: { date, doneIds },
//     notifications: { enabled, hour, timeZone, tokens: string[], lastSent }, updatedAt }
// Horoscope du jour (écrit uniquement par la Cloud Function) : users/{uid}/daily/{date}
import { initializeApp } from 'firebase/app'
import {
  GoogleAuthProvider,
  getAdditionalUserInfo,
  getAuth,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as fbSignOut,
} from 'firebase/auth'
import { arrayRemove, arrayUnion, doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { nextSendAt } from '../schedule'
import { getMessaging, getToken, isSupported as messagingSupported } from 'firebase/messaging'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
}
const app = initializeApp(config)
// Clé publique « Web Push » (console Firebase › Paramètres › Cloud Messaging), nécessaire aux notifications.
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY
const auth = getAuth(app)
auth.languageCode = 'fr'
const db = getFirestore(app)
const functions = getFunctions(app, 'europe-west1')
const getDailyFn = httpsCallable(functions, 'getDaily', { timeout: 120000 })
const getBillingFn = httpsCallable(functions, 'getBilling')
const startCheckoutFn = httpsCallable(functions, 'startCheckout')
const openBillingPortalFn = httpsCallable(functions, 'openBillingPortal')
const sendTestNotificationFn = httpsCallable(functions, 'sendTestNotification')

// Prénom et nom fournis par Google lors de la connexion, gardés pour pré-remplir le profil.
let googleNames = null

const toUser = (u) => {
  if (!u) return null
  const [first = '', ...rest] = (u.displayName ?? '').split(' ')
  return {
    uid: u.uid,
    email: u.email,
    photoURL: u.photoURL,
    givenName: googleNames?.given_name ?? first,
    familyName: googleNames?.family_name ?? rest.join(' '),
  }
}

const rememberNames = (result) => {
  const profile = result && getAdditionalUserInfo(result)?.profile
  if (profile) googleNames = { given_name: profile.given_name, family_name: profile.family_name }
}

export function onAuthChange(callback) {
  getRedirectResult(auth).then(rememberNames).catch(() => {})
  return onAuthStateChanged(auth, (u) => callback(toUser(u)))
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  try {
    rememberNames(await signInWithPopup(auth, provider))
  } catch (err) {
    // Fenêtre bloquée (certains navigateurs mobiles) : on passe par une redirection.
    if (err.code === 'auth/popup-blocked' || err.code === 'auth/operation-not-supported-in-this-environment') {
      await signInWithRedirect(auth, provider)
      return
    }
    if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') return
    throw err
  }
}

export const signOut = () => fbSignOut(auth)

export async function loadUserData(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

export async function saveUserData(uid, partial) {
  await setDoc(doc(db, 'users', uid), { ...partial, updatedAt: serverTimestamp() }, { merge: true })
}

// Horoscope et 3 tâches du jour, générés par l'IA côté serveur (functions/index.js).
// Sans abonnement, le serveur renvoie { locked: true } sans aucun contenu.
export async function getDaily(date) {
  const { data } = await getDailyFn({ date })
  return data
}

// Abonnement Stripe (functions/billing.js). refresh force une relecture chez Stripe, par exemple au retour du paiement.
export async function getBilling(refresh = false) {
  const { data } = await getBillingFn({ refresh })
  return data
}

// Renvoie l'adresse de la page de paiement Stripe, ou null si l'abonnement est déjà actif.
export async function startCheckout(plan) {
  const { data } = await startCheckoutFn({ plan })
  return data.url ?? null
}

// Renvoie l'adresse de l'espace Stripe où l'abonné gère ou résilie son abonnement.
export async function openBillingPortal() {
  const { data } = await openBillingPortalFn({})
  return data.url ?? null
}

// Notifications du matin : autorisation du navigateur, jeton de l'appareil enregistré sur le compte.
// L'envoi est fait chaque minute par le serveur (functions/notify.js) aux personnes dont c'est l'heure choisie.
// Erreurs possibles (err.code) : 'unsupported', 'denied'.
export const notificationsAvailable = Boolean(VAPID_KEY)

const localTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Paris'

// Enregistre le service worker (mis à jour au passage) et renvoie le jeton de cet appareil.
// Attend que le service worker soit vraiment actif : juste après une mise à jour du site,
// le nouveau est encore en cours d'installation et l'iPhone refuse alors l'abonnement.
function waitUntilActive(registration) {
  const worker = registration.installing ?? registration.waiting
  if (!worker) return Promise.resolve()
  return new Promise((resolve) => {
    const done = () => worker.state === 'activated' && resolve()
    worker.addEventListener('statechange', done)
    setTimeout(resolve, 10000)
    done()
  })
}

async function deviceToken() {
  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
  await registration.update().catch(() => {})
  await waitUntilActive(registration)
  return getToken(getMessaging(app), { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration })
}

// Jeton de cet appareil (pour retirer l'ancien du compte quand il change)
// et dernière réactivation réussie des notifications sur cet appareil.
const TOKEN_KEY = 'lunaris-push-token'
const ENABLED_AT_KEY = 'lunaris-push-enabled-at'
const remember = (key, value) => {
  try {
    const previous = localStorage.getItem(key)
    localStorage.setItem(key, value)
    return previous
  } catch {
    return null
  }
}

async function saveToken(uid, token) {
  const ref = doc(db, 'users', uid)
  await setDoc(ref, { notifications: { tokens: arrayUnion(token) } }, { merge: true })
  const previous = remember(TOKEN_KEY, token)
  if (previous && previous !== token) {
    await setDoc(ref, { notifications: { tokens: arrayRemove(previous) } }, { merge: true }).catch(() => {})
  }
}

const dateIn = (timeZone, ms) => new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date(ms))

// Heure (ms) de la dernière notification reçue par cet appareil, notée par le service worker.
async function lastPushReceived() {
  try {
    const res = await (await caches.open('lunaris-push')).match('/derniere-notification')
    return res ? Number(await res.text()) || 0 : 0
  } catch {
    return 0
  }
}

// Le serveur a envoyé la notification aujourd'hui mais cet appareil ne l'a pas reçue :
// l'iPhone a perdu l'abonnement (souvent après une mise à jour du site) et seul un toucher peut le recréer.
async function missedToday(uid, timeZone) {
  const snap = await getDoc(doc(db, 'users', uid))
  const today = dateIn(timeZone, Date.now())
  if (snap.data()?.notifications?.lastSent !== today) return false
  let enabledAt = 0
  try {
    enabledAt = Number(localStorage.getItem(ENABLED_AT_KEY)) || 0
  } catch {
    // stockage indisponible : on ne regarde que la dernière notification reçue
  }
  const lastOk = Math.max(await lastPushReceived(), enabledAt)
  return !lastOk || dateIn(timeZone, lastOk) !== today
}

// À chaque ouverture : si les notifications sont autorisées, on renvoie le jeton (il peut changer).
// La date du prochain envoi est recalculée au passage (heure d'été, changement de fuseau…).
// Renvoie { needsTap: true } quand l'abonnement de cet appareil est perdu : l'app propose alors « Réactiver ».
export async function refreshNotifications(uid, settings) {
  const timeZone = localTimeZone()
  await setDoc(doc(db, 'users', uid), { notifications: { timeZone, nextSendAt: nextSendAt({ ...settings, timeZone }) } }, { merge: true })
  if (!VAPID_KEY || !('Notification' in window)) return { needsTap: false }
  if (Notification.permission === 'default') return { needsTap: true }
  if (Notification.permission !== 'granted') return { needsTap: false }
  if (!(await messagingSupported().catch(() => false))) return { needsTap: false }
  let token
  try {
    token = await deviceToken()
  } catch {
    return { needsTap: true }
  }
  await saveToken(uid, token)
  return { needsTap: await missedToday(uid, timeZone).catch(() => false) }
}

export async function enableNotifications(uid, hour, minute = 0) {
  if (!VAPID_KEY || !('Notification' in window)) throw Object.assign(new Error(), { code: 'unsupported' })
  // Demande d'autorisation en premier, directement après le toucher : l'iPhone l'exige.
  const permission = await Notification.requestPermission()
  if (!(await messagingSupported().catch(() => false))) throw Object.assign(new Error(), { code: 'unsupported' })
  if (permission !== 'granted') throw Object.assign(new Error(), { code: 'denied' })
  const token = await deviceToken()
  const settings = { enabled: true, hour, minute, timeZone: localTimeZone() }
  await setDoc(
    doc(db, 'users', uid),
    { notifications: { ...settings, nextSendAt: nextSendAt(settings) }, updatedAt: serverTimestamp() },
    { merge: true },
  )
  await saveToken(uid, token)
  remember(ENABLED_AT_KEY, String(Date.now()))
  return settings
}

// Envoie tout de suite une notification à tous les appareils du compte : { successCount, errors }.
export async function sendTestNotification() {
  const { data } = await sendTestNotificationFn({})
  return data
}

export async function updateNotifications(uid, partial) {
  await setDoc(doc(db, 'users', uid), { notifications: partial, updatedAt: serverTimestamp() }, { merge: true })
}

export const mode = 'firebase'
