// Copie serveur des réponses possibles au questionnaire d'entrée (src/lib/quiz.js).
// Les valeurs connues sont traduites en libellés. La réponse libre « Autre » est nettoyée, limitée à 80 caractères
// et présentée à l'IA entre guillemets comme une simple description de la personne.
const LABELS = {
  situation: {
    label: 'Situation',
    values: {
      etudiant: 'étudiant·e',
      salarie: 'salarié·e',
      independant: 'indépendant·e ou entrepreneur·e',
      recherche: 'en recherche d’emploi',
      parent: 'parent au foyer',
      retraite: 'retraité·e',
    },
  },
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

const OTHER_MAX = 80

const cleanFreeText = (text) =>
  typeof text === 'string'
    ? text
        .replace(/[\u0000-\u001f\u007f«»"]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, OTHER_MAX)
    : ''

export function quizLines(quiz) {
  if (!quiz || typeof quiz !== 'object') return []
  return Object.entries(LABELS).flatMap(([id, { label, values }]) => {
    if (quiz[id] === 'autre') {
      const text = cleanFreeText(quiz[`${id}Other`])
      return text ? [`${label} (réponse libre) : « ${text} »`] : []
    }
    const value = Object.hasOwn(values, quiz[id]) ? values[quiz[id]] : null
    return value ? [`${label} : ${value}`] : []
  })
}
