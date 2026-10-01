// Choix du backend : Firebase si la configuration est fournie, sinon la démo locale.
import * as demo from './demo'

export const firebaseConfigured = Boolean(import.meta.env.VITE_FIREBASE_API_KEY)

let backendPromise = null

export function getBackend() {
  if (!backendPromise) {
    backendPromise = firebaseConfigured ? import('./firebase') : Promise.resolve(demo)
  }
  return backendPromise
}
