// Backend réel : Firebase Authentication (Google) + Cloud Firestore.
// Document par utilisateur : users/{uid}
//   { firstName, lastName, birthDate, birthTime, completedDays: string[], today: { date, doneIds }, updatedAt }
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
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
})
const auth = getAuth(app)
auth.languageCode = 'fr'
const db = getFirestore(app)
const functions = getFunctions(app, 'europe-west1')
const getDailyFn = httpsCallable(functions, 'getDaily', { timeout: 120000 })
const getBillingFn = httpsCallable(functions, 'getBilling')
const startCheckoutFn = httpsCallable(functions, 'startCheckout')
const openBillingPortalFn = httpsCallable(functions, 'openBillingPortal')

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

export const mode = 'firebase'
