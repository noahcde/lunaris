// Backend de démonstration : aucune connexion réelle, données gardées dans ce navigateur.
// Utilisé tant que les variables VITE_FIREBASE_* ne sont pas renseignées (et dans l'aperçu).
import { addDays, sunSign } from '../astro'
import { dayKey } from '../streak'

const SESSION_KEY = 'aligned.demo.session'
const DATA_KEY = 'aligned.demo.user'

const DEMO_USER = {
  uid: 'demo',
  email: 'camille.martin@example.com',
  photoURL: null,
  givenName: 'Camille',
  familyName: 'Martin',
}

const read = (key) => {
  try {
    return JSON.parse(window.localStorage.getItem(key))
  } catch {
    return null
  }
}
const write = (key, value) => {
  try {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Stockage indisponible : la démo fonctionne en mémoire.
  }
}

let memory = { session: read(SESSION_KEY), data: read(DATA_KEY) }
const listeners = new Set()
const emit = () => listeners.forEach((cb) => cb(memory.session ? DEMO_USER : null))

// Historique d'exemple pour que la série ne parte pas de zéro dans la démo.
const exampleDays = () => {
  const today = new Date()
  return [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 14, 15, 17].map((n) => dayKey(addDays(today, -n)))
}

export function onAuthChange(callback) {
  listeners.add(callback)
  setTimeout(() => callback(memory.session ? DEMO_USER : null), 250)
  return () => listeners.delete(callback)
}

export async function signInWithGoogle() {
  await new Promise((r) => setTimeout(r, 600))
  memory.session = true
  write(SESSION_KEY, true)
  emit()
}

export async function signOut() {
  memory.session = null
  write(SESSION_KEY, null)
  emit()
}

export async function loadUserData() {
  if (!memory.data) {
    memory.data = { completedDays: exampleDays() }
    write(DATA_KEY, memory.data)
  }
  return memory.data
}

export async function saveUserData(_uid, partial) {
  memory.data = { ...memory.data, ...partial }
  write(DATA_KEY, memory.data)
}

// Remet la démo à zéro (profil + historique), pour rejouer l'inscription.
export function resetDemo() {
  memory = { session: null, data: null }
  write(SESSION_KEY, null)
  write(DATA_KEY, null)
  emit()
}

// Contenu d'exemple : dans l'app réelle, il est généré par l'IA selon le signe.
const SAMPLES = [
  {
    insight: {
      title: 'La clarté naît de l’équilibre.',
      text: 'Votre signe profite d’un ciel apaisé : les échanges sont fluides et les décisions plus nettes. Pesez chaque option une seule fois, puis engagez-vous.',
      sections: [
        { theme: 'amour', text: 'Vénus adoucit les échanges et rend vos mots plus justes que d’habitude. C’est le bon jour pour dire ce que vous gardez pour vous depuis quelque temps, sans dramatiser. Évitez seulement les sujets sensibles par message : en face, le ton passe mieux. La fin de journée est le moment le plus propice.' },
        { theme: 'travail', text: 'Le climat favorise les décisions, surtout en fin de matinée où l’esprit est plus clair. Si un choix traîne depuis quelque temps, c’est un bon jour pour le trancher en vous fiant aux faits. Prudence avec les débats déjà tranchés : les rouvrir risquerait de vous faire perdre du temps.' },
        { theme: 'energie', text: 'L’énergie est plutôt stable le matin et pourrait baisser en milieu d’après-midi. Le climat du jour favorise le mouvement plus que l’immobilité. Si la fatigue se fait sentir, elle demande surtout un changement de rythme.' },
        { theme: 'interieur', text: 'Le climat du jour vous pousse à chercher l’équilibre entre ce que vous voulez et ce qu’on attend de vous. Une petite culpabilité peut surgir si vous dites non : elle passera vite. Le soir est propice au calme et au recul.' },
      ],
    },
    tasks: [
      { title: 'Trancher une décision en attente', hint: 'La Lune éclaire ce que vous repoussez.' },
      { title: 'Bloquer 90 min de travail profond', hint: 'Votre concentration culmine ce matin.' },
      { title: 'Remercier un collègue par écrit', hint: 'Vénus favorise les liens sincères.' },
    ],
  },
  {
    insight: {
      title: 'Avancez par petites touches précises.',
      text: 'L’énergie du jour récompense la méthode plus que l’élan. Fractionnez vos objectifs et terminez ce qui est déjà commencé avant d’ouvrir un nouveau chantier.',
      sections: [
        { theme: 'argent', text: 'Saturne invite à la rigueur et au tri. Le climat est favorable pour faire le point sur les petites dépenses qui s’accumulent, sans urgence. La soirée se prête moins aux achats : la fatigue pourrait rendre les envies plus pressantes.' },
        { theme: 'travail', text: 'La méthode paie aujourd’hui plus que l’inspiration. Les tâches longues avancent bien si vous les découpez en étapes courtes. L’après-midi est moins favorable aux réunions : gardez-le pour le travail de fond.' },
        { theme: 'amities', text: 'Les liens d’amitié sont favorisés, surtout dans les échanges simples et sincères. Si un contact s’est espacé, le moment se prête à le renouer sans effort. Les discussions de groupe pourraient être moins fluides que les tête-à-tête.' },
        { theme: 'interieur', text: 'La Lune décroissante favorise le lâcher-prise et le tri, au dehors comme au dedans. Acceptez de ne pas tout finir aujourd’hui, vous avancerez mieux demain. Si une ancienne préoccupation refait surface, elle n’appelle pas forcément de réponse immédiate.' },
      ],
    },
    tasks: [
      { title: 'Finir une tâche commencée hier', hint: 'Saturne soutient la persévérance.' },
      { title: 'Ranger votre espace de travail', hint: 'Un cadre net appelle un esprit net.' },
      { title: 'Planifier les trois priorités de demain', hint: 'La Lune décroissante invite au tri.' },
    ],
  },
]

export async function getDaily(date) {
  await new Promise((r) => setTimeout(r, 900))
  if (!billingState().active) return { date, locked: true }
  const sign = sunSign(memory.data?.birthDate) ?? 'votre signe'
  const sample = SAMPLES[Number(date.slice(-2)) % SAMPLES.length]
  return {
    date,
    insight: { ...sample.insight, text: sample.insight.text.replace('Votre signe', `Le ${sign}`) },
    tasks: sample.tasks,
  }
}

// Abonnement simulé : aucun paiement, l'essai de 2 jours démarre directement.
const NO_SUBSCRIPTION = {
  active: false,
  status: null,
  plan: null,
  trialEnd: null,
  periodEnd: null,
  cancelAtPeriodEnd: false,
  trialUsed: false,
  hasCustomer: false,
}
const billingState = () => memory.data?.billing ?? NO_SUBSCRIPTION

export async function getBilling() {
  await new Promise((r) => setTimeout(r, 300))
  return billingState()
}

export async function startCheckout(plan) {
  await new Promise((r) => setTimeout(r, 800))
  const now = Math.floor(Date.now() / 1000)
  const trial = !billingState().trialUsed
  const periodEnd = trial ? now + 2 * 86400 : now + (plan === 'yearly' ? 365 : 30) * 86400
  await saveUserData(null, {
    billing: {
      active: true,
      status: trial ? 'trialing' : 'active',
      plan,
      trialEnd: trial ? periodEnd : null,
      periodEnd,
      cancelAtPeriodEnd: false,
      trialUsed: true,
      hasCustomer: true,
    },
  })
  return null
}

// Dans la démo, « Gérer mon abonnement » résilie tout de suite, pour revoir l'écran flouté.
export async function openBillingPortal() {
  await saveUserData(null, { billing: { ...NO_SUBSCRIPTION, trialUsed: true, hasCustomer: true } })
  return null
}

// Démo : les notifications sont simulées (aucune autorisation demandée, rien n'est envoyé).
export const notificationsAvailable = true

export async function enableNotifications(_uid, hour, minute = 0) {
  await new Promise((r) => setTimeout(r, 400))
  const settings = { enabled: true, hour, minute, timeZone: 'Europe/Paris' }
  await saveUserData(null, { notifications: settings })
  return settings
}

export async function refreshNotifications() {
  return { needsTap: false }
}

export async function sendTestNotification() {
  await new Promise((r) => setTimeout(r, 600))
  return { successCount: 1, errors: [] }
}

export async function updateNotifications(_uid, partial) {
  const current = memory.data?.notifications ?? {}
  await saveUserData(null, { notifications: { ...current, ...partial } })
}

export const mode = 'demo'
