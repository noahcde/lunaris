// Parrainage : chaque compte a un lien d'invitation (lunaris-app.fr/?parrain=CODE).
// Quand un nouveau compte s'inscrit avec ce lien, l'ami et le parrain reçoivent chacun 7 jours de Premium.
// Collections réservées au serveur (inaccessibles depuis l'app) :
//   referralCodes/{code} → { uid }               (code → parrain)
//   referrals/{uid}      → { code, invited, referredBy, referredAt }
//   grants/{uid}         → { until }              (accès Premium offert jusqu'à cette date, en ms)
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

export const REWARD_DAYS = 7
const MAX_INVITED = 20 // amis récompensés au maximum par parrain
const NEW_ACCOUNT_MS = 7 * 86400000 // seuls les comptes créés depuis moins de 7 jours peuvent utiliser un lien
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sans 0/O ni 1/I, faciles à confondre
export const CODE_RE = /^[A-HJ-NP-Z2-9]{6}$/

const db = () => getFirestore()

function randomCode() {
  let code = ''
  for (let i = 0; i < 6; i++) code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  return code
}

// Lien d'invitation de la personne (créé à la première demande) et nombre d'amis déjà invités.
export async function referralOf(uid) {
  const ref = db().doc(`referrals/${uid}`)
  const data = (await ref.get()).data() ?? {}
  if (data.code) return { code: data.code, invited: data.invited ?? 0 }
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode()
    try {
      await db().doc(`referralCodes/${code}`).create({ uid })
    } catch {
      continue // code déjà pris : on en tire un autre
    }
    await ref.set({ code }, { merge: true })
    return { code, invited: data.invited ?? 0 }
  }
  throw new Error('code-indisponible')
}

// Date de fin de l'accès offert (ms), 0 si aucun.
export async function grantUntil(uid) {
  return (await db().doc(`grants/${uid}`).get()).data()?.until ?? 0
}

// Ajoute des jours offerts, à la suite de ceux qui restent.
export async function addGrant(uid, days) {
  const ref = db().doc(`grants/${uid}`)
  return db().runTransaction(async (tx) => {
    const current = (await tx.get(ref)).data()?.until ?? 0
    const until = Math.max(current, Date.now()) + days * 86400000
    tx.set(ref, { until }, { merge: true })
    return until
  })
}

// Utilisation d'un lien par un nouveau compte. Renvoie { ok: true, referrer } ou { ok: false, reason }.
// hasSubscriptionHistory : le compte a déjà eu un abonnement ou un essai Stripe (il ne compte pas comme nouveau).
export async function claim({ uid, code, hasSubscriptionHistory }) {
  if (!CODE_RE.test(code ?? '')) return { ok: false, reason: 'code-invalide' }
  const referrer = (await db().doc(`referralCodes/${code}`).get()).data()?.uid
  if (!referrer) return { ok: false, reason: 'code-inconnu' }
  if (referrer === uid) return { ok: false, reason: 'soi-meme' }
  if (hasSubscriptionHistory) return { ok: false, reason: 'deja-abonne' }
  const created = Date.parse((await getAuth().getUser(uid)).metadata.creationTime)
  if (!(Date.now() - created < NEW_ACCOUNT_MS)) return { ok: false, reason: 'compte-ancien' }

  return db().runTransaction(async (tx) => {
    const mineRef = db().doc(`referrals/${uid}`)
    const theirsRef = db().doc(`referrals/${referrer}`)
    const [mine, theirs] = await Promise.all([tx.get(mineRef), tx.get(theirsRef)])
    if (mine.data()?.referredBy) return { ok: false, reason: 'deja-parraine' }
    const invited = theirs.data()?.invited ?? 0
    // Lectures avant écritures (règle des transactions Firestore).
    const grantRef = db().doc(`grants/${uid}`)
    const grant = (await tx.get(grantRef)).data()?.until ?? 0
    tx.set(mineRef, { referredBy: referrer, referredAt: FieldValue.serverTimestamp() }, { merge: true })
    tx.set(grantRef, { until: Math.max(grant, Date.now()) + REWARD_DAYS * 86400000 }, { merge: true })
    tx.set(theirsRef, { invited: invited + 1 }, { merge: true })
    return { ok: true, referrer, rewardReferrer: invited < MAX_INVITED }
  })
}
