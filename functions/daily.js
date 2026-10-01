// Génération de l'horoscope du jour et des 3 tâches d'alignement avec OpenAI.
import OpenAI from 'openai'
import { zodTextFormat } from 'openai/helpers/zod'
import { z } from 'zod'

export const DailySchema = z.object({
  insight: z.object({
    title: z.string().describe('Une phrase courte et percutante, 60 caractères maximum.'),
    text: z.string().describe('Deux ou trois phrases, 280 caractères maximum.'),
  }),
  tasks: z
    .array(
      z.object({
        title: z.string().describe('Action concrète commençant par un verbe, 45 caractères maximum.'),
        hint: z.string().describe('Lien avec l’horoscope du jour, 60 caractères maximum.'),
      }),
    )
    .describe('Exactement trois tâches.'),
})

const SYSTEM = `Tu es l'astrologue de l'application Aligned, qui relie l'astrologie personnalisée à la productivité.
Chaque jour, tu écris pour un utilisateur :
- un horoscope du jour personnalisé selon son signe solaire (et son ascendant si l'heure de naissance est connue), ancré dans la phase lunaire et le climat astral fournis ;
- trois tâches d'alignement réalisables dans la journée, qui découlent directement de cet horoscope.

Ton : professionnel, sobre, encourageant, sans mysticisme excessif ni promesses. Tutoiement interdit, utilise « vous ».
Les tâches sont concrètes, utiles pour le travail ou l'équilibre personnel, faisables en moins de deux heures chacune, et variées (par exemple : une tâche de concentration, une tâche relationnelle, une tâche de recul ou de soin).
N'invente pas d'aspects planétaires précis au degré près ; reste dans des formulations astrologiques générales.
Écris en français.`

let client = null

export async function generateDaily({ model, firstName, sign, birthTime, dateLabel, moonPhase, dayStatus }) {
  client ??= new OpenAI() // lit OPENAI_API_KEY (secret Firebase)

  const profile = [
    `Prénom : ${firstName}`,
    `Signe solaire : ${sign}`,
    birthTime ? `Heure de naissance : ${birthTime}` : 'Heure de naissance inconnue',
    `Date du jour : ${dateLabel}`,
    `Phase lunaire : ${moonPhase}`,
    `Climat du jour dans le calendrier de manifestation : ${dayStatus}`,
  ].join('\n')

  const response = await client.responses.parse({
    model,
    instructions: SYSTEM,
    input: `Voici le profil et le contexte du jour :\n\n${profile}`,
    text: { format: zodTextFormat(DailySchema, 'daily') },
  })

  const daily = response.output_parsed
  if (!daily || daily.tasks.length < 3) throw new Error(`unparsed:${response.status}`)
  return { insight: daily.insight, tasks: daily.tasks.slice(0, 3) }
}
