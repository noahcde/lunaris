// Phrase du jour par signe : une phrase courte et marquante pour chacun des 12 signes,
// envoyée dans la notification du matin et visible gratuitement dans l'app (même sans abonnement).
// Avec elle, un horoscope général du signe (quelques lignes), gratuit dans l'app mais jamais dans la notification.
// Un seul appel à l'IA par jour pour tous les utilisateurs : le résultat est gardé dans phrases/{date}
// (collection inaccessible depuis l'app).
import OpenAI from 'openai'
import { zodTextFormat } from 'openai/helpers/zod'
import { z } from 'zod'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { dayContext } from './astro.js'

export const SIGN_NAMES = [
  'Bélier', 'Taureau', 'Gémeaux', 'Cancer', 'Lion', 'Vierge',
  'Balance', 'Scorpion', 'Sagittaire', 'Capricorne', 'Verseau', 'Poissons',
]

const PhrasesSchema = z.object({
  signs: z
    .array(
      z.object({
        sign: z.enum(SIGN_NAMES),
        phrase: z.string().describe('La phrase du jour pour ce signe, 90 caractères maximum.'),
        horoscope: z.string().describe('Horoscope général du jour pour ce signe : 3 ou 4 phrases, 350 caractères maximum.'),
      }),
    )
    .describe('Exactement douze entrées, une par signe, dans l’ordre du zodiaque.'),
})

const SYSTEM = `Tu écris la « phrase du jour » de l'application d'astrologie Lunaris, une pour chacun des douze signes.
Elle s'affiche dans la notification du matin : la personne doit se sentir comprise, sourire et avoir envie d'ouvrir l'app.

Règles :
- Une seule phrase (ou deux très courtes), 90 caractères maximum, sans emoji.
- C'est un constat ou l'ambiance du jour, pas une consigne : les actions à faire sont déjà dans les tâches de l'app.
- Ton complice et bienveillant, avec une pointe d'humour tendre. Jamais moqueur, jamais blessant, jamais moralisateur,
  et jamais de pique contre les autres (pas de « tout le monde est lent », « ils ne vous méritent pas »).
- Elle colle au tempérament du signe et au climat du jour fournis (phase lunaire, type de journée), sans les citer mot pour mot.
- Jamais de fait affirmé sur la vie de la personne (pas de « quelqu'un va vous appeler »), pas de promesse.
- Pas de clichés d'horoscope (« les astres sont avec vous », « belle journée en perspective »).
- Douze phrases vraiment différentes les unes des autres.
- Vouvoiement (« vous »), en français.

Pour chaque signe, écris aussi un « horoscope général » du jour, lu dans l'app (jamais dans la notification) :
- 3 ou 4 phrases, 350 caractères maximum, même ton complice et bienveillant, sans emoji.
- Il prolonge la phrase sans la répéter : l'humeur du jour, ce qui sera facile, ce qui demandera un peu de patience.
- Il reste général (le même pour tout le signe) : des tendances, jamais de fait affirmé sur la vie de la personne,
  pas de consigne précise (les tâches personnelles sont réservées aux abonnés).

Exemples du ton attendu pour la phrase : « Vous avez déjà la réponse. Vous attendez juste qu'on vous la confirme. » ; « Votre énergie va plus vite que votre journée, et c'est plutôt une qualité. » ; « Vous retenez tout, même ce que les autres ont oublié. C'est une forme de tendresse. »`

let client = null

async function generatePhrases({ model, date }) {
  client ??= new OpenAI() // lit OPENAI_API_KEY (secret Firebase)
  const { dateLabel, moonPhase, dayStatus } = dayContext(date)
  const response = await client.responses.parse({
    model,
    instructions: SYSTEM,
    input: `Date : ${dateLabel}\nPhase lunaire : ${moonPhase}\nClimat du jour : ${dayStatus}`,
    text: { format: zodTextFormat(PhrasesSchema, 'phrases') },
  })
  const parsed = response.output_parsed?.signs ?? []
  const signs = Object.fromEntries(parsed.map((s) => [s.sign, s.phrase.trim()]))
  const general = Object.fromEntries(parsed.map((s) => [s.sign, s.horoscope.trim()]))
  if (SIGN_NAMES.some((name) => !signs[name] || !general[name])) throw new Error(`unparsed:${response.status}`)
  return { signs, general }
}

// Textes du jour { signs: signe → phrase, general: signe → horoscope général }, générés au premier besoin puis relues depuis phrases/{date}.
// Après un échec, on attend 10 minutes avant de réessayer (évite un appel à l'IA par personne si OpenAI est en panne).
const pending = new Map()
const failedAt = new Map()
const RETRY_MS = 10 * 60 * 1000
export function phrasesOfDay({ model, date }) {
  if (Date.now() - (failedAt.get(date) ?? 0) < RETRY_MS) return Promise.reject(new Error('retry-later'))
  if (!pending.has(date)) {
    const job = loadOrGenerate({ model, date }).catch((err) => {
      pending.delete(date)
      failedAt.set(date, Date.now())
      throw err
    })
    pending.set(date, job)
    // Une instance peut vivre plusieurs jours : on ne garde que les dates récentes en mémoire.
    if (pending.size > 4) pending.delete(pending.keys().next().value)
  }
  return pending.get(date)
}

async function loadOrGenerate({ model, date }) {
  const ref = getFirestore().doc(`phrases/${date}`)
  const snap = await ref.get()
  const pick = (data) => ({ signs: data.signs ?? {}, general: data.general ?? {} })
  if (snap.exists) return pick(snap.data())
  const texts = await generatePhrases({ model, date })
  try {
    await ref.create({ date, ...texts, generatedAt: FieldValue.serverTimestamp() })
    return texts
  } catch {
    // Une autre instance l'a écrite entre-temps : on garde la sienne, pour que tout le monde ait la même.
    const other = (await ref.get()).data()
    return other ? pick(other) : texts
  }
}
