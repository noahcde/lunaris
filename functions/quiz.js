// Copie serveur des réponses possibles au questionnaire d'entrée (src/lib/quiz.js).
// Seules ces valeurs connues sont transmises à l'IA : aucun texte libre de l'utilisateur n'entre dans le prompt.
const LABELS = {
  focus: {
    label: 'Ce qui l’occupe le plus en ce moment',
    values: {
      amour: 'amour et relations',
      carriere: 'carrière et argent',
      energie: 'énergie et bien-être',
      voie: 'trouver sa voie',
      confiance: 'confiance en soi',
    },
  },
  period: {
    label: 'Période traversée',
    values: {
      bloque: 'se sent bloqué·e',
      transition: 'en pleine transition',
      stable: 'plutôt stable, mais en veut plus',
      deborde: 'débordé·e',
    },
  },
  expectation: {
    label: 'Ce qu’elle attend de l’application',
    values: {
      comprendre: 'comprendre ce qu’elle traverse',
      timing: 'savoir quand agir',
      actions: 'des actions concrètes chaque jour',
      motivation: 'retrouver de la motivation',
    },
  },
  time: {
    label: 'Temps disponible par jour pour les tâches',
    values: { 5: 'environ 5 minutes', 15: 'environ 15 minutes', 30: '30 minutes ou plus' },
  },
}

export function quizLines(quiz) {
  if (!quiz || typeof quiz !== 'object') return []
  return Object.entries(LABELS).flatMap(([id, { label, values }]) => {
    const value = Object.hasOwn(values, quiz[id]) ? values[quiz[id]] : null
    return value ? [`${label} : ${value}`] : []
  })
}
