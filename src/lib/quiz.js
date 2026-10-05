// Questionnaire d'entrée : ce que la personne cherche en ce moment.
// Les réponses sont gardées dans ce navigateur jusqu'à la connexion, puis enregistrées sur le compte (users/{uid}.quiz)
// et transmises à l'IA pour orienter l'horoscope et les tâches.
// Réponse libre « Autre » : texte tapé par la personne, limité en longueur.
export const OTHER = 'autre'
export const OTHER_MAX = 80
const otherOption = { value: OTHER, label: 'Autre' }

export const QUESTIONS = [
  {
    id: 'situation',
    title: 'Quelle est votre situation ?',
    options: [
      { value: 'etudiant', label: 'Étudiant·e' },
      { value: 'salarie', label: 'Salarié·e' },
      { value: 'independant', label: 'Indépendant·e ou entrepreneur·e' },
      { value: 'recherche', label: 'En recherche d’emploi' },
      { value: 'parent', label: 'Parent au foyer' },
      { value: 'retraite', label: 'Retraité·e' },
      otherOption,
    ],
  },
  {
    id: 'focus',
    title: 'Qu’est-ce qui vous occupe le plus en ce moment ?',
    options: [
      { value: 'amour', label: 'Amour et relations' },
      { value: 'carriere', label: 'Carrière et argent' },
      { value: 'energie', label: 'Énergie et bien-être' },
      { value: 'voie', label: 'Trouver ma voie' },
      { value: 'confiance', label: 'Confiance en moi' },
      otherOption,
    ],
  },
  {
    id: 'period',
    title: 'Comment décririez-vous cette période ?',
    options: [
      { value: 'bloque', label: 'Je me sens bloqué·e' },
      { value: 'transition', label: 'Je suis en pleine transition' },
      { value: 'stable', label: 'Plutôt stable, mais j’en veux plus' },
      { value: 'deborde', label: 'Je suis débordé·e' },
      otherOption,
    ],
  },
  {
    id: 'expectation',
    title: 'Qu’attendez-vous de Lunaris ?',
    options: [
      { value: 'comprendre', label: 'Comprendre ce que je traverse' },
      { value: 'timing', label: 'Savoir quand agir' },
      { value: 'actions', label: 'Des actions concrètes chaque jour' },
      { value: 'motivation', label: 'Retrouver de la motivation' },
      otherOption,
    ],
  },
  {
    id: 'time',
    title: 'Combien de temps pouvez-vous y consacrer par jour ?',
    options: [
      { value: '5', label: '5 minutes' },
      { value: '15', label: '15 minutes' },
      { value: '30', label: '30 minutes ou plus' },
    ],
  },
]

export const otherKey = (questionId) => `${questionId}Other`

export const SITUATION = QUESTIONS[0]

// Libellé d'une réponse : le texte tapé pour « Autre », sinon le libellé de l'option choisie.
export function answerLabel(answers, questionId) {
  const value = answers?.[questionId]
  if (value === OTHER) return answers[otherKey(questionId)]?.trim() || 'Autre'
  return QUESTIONS.find((q) => q.id === questionId)?.options.find((o) => o.value === value)?.label ?? null
}

const KEY = 'aligned.quiz'

export function loadQuiz() {
  try {
    return JSON.parse(window.localStorage.getItem(KEY))
  } catch {
    return null
  }
}

export function saveQuiz(quiz) {
  try {
    if (quiz) window.localStorage.setItem(KEY, JSON.stringify(quiz))
    else window.localStorage.removeItem(KEY)
  } catch {
    // Stockage indisponible : les réponses restent en mémoire pour cette visite.
  }
}
