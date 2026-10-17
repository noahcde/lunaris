// Textes des pages outils : « Lune aujourd'hui » et « Quel est mon signe ? » (lunaris-app.fr/lune-aujourdhui/, /quel-est-mon-signe/).

// Les 8 phases de la Lune, dans l'ordre du cycle.
export const PHASES_LUNE = [
  {
    nom: 'Nouvelle lune',
    texte: 'La Lune est entre la Terre et le Soleil : sa face éclairée nous est cachée, elle est invisible dans le ciel. Symboliquement, c’est le moment de poser une intention et de commencer quelque chose de neuf.',
  },
  {
    nom: 'Premier croissant',
    texte: 'Un mince croissant apparaît le soir à l’ouest, juste après le coucher du Soleil. La lumière grandit : c’est le temps des premiers pas, encore fragiles, vers ce que l’on a décidé.',
  },
  {
    nom: 'Premier quartier',
    texte: 'La moitié droite de la Lune est éclairée (vue depuis l’hémisphère Nord). C’est un cap : les premiers obstacles se présentent, et il faut choisir de continuer ou d’ajuster.',
  },
  {
    nom: 'Gibbeuse croissante',
    texte: 'La Lune est presque pleine et se lève dans l’après-midi. C’est une phase d’affinage : on peaufine, on corrige, on prépare ce qui va aboutir.',
  },
  {
    nom: 'Pleine lune',
    texte: 'La Terre est entre le Soleil et la Lune, entièrement éclairée et visible toute la nuit. C’est le point culminant du cycle : on fait le bilan, on célèbre et on relâche ce qui pèse.',
  },
  {
    nom: 'Gibbeuse décroissante',
    texte: 'La lumière commence à diminuer et la Lune se lève de plus en plus tard dans la soirée. C’est un temps de gratitude et de transmission, pour partager ce que l’on a appris.',
  },
  {
    nom: 'Dernier quartier',
    texte: 'Seule la moitié gauche est éclairée, visible surtout en seconde partie de nuit et le matin. C’est le moment de trier, de ranger et de laisser partir ce qui n’a plus sa place.',
  },
  {
    nom: 'Dernier croissant',
    texte: 'Un fin croissant se montre à l’aube, à l’est, avant de disparaître. Fin de cycle : on ralentit, on se repose et on se prépare au renouveau de la prochaine nouvelle lune.',
  },
]

export const FAQ_LUNE_AUJOURDHUI = [
  {
    q: 'Quelle est la phase de la Lune ce soir ?',
    a: 'La phase de la Lune du jour est affichée en haut de cette page, avec le pourcentage de surface éclairée et l’âge de la Lune depuis la dernière nouvelle lune. Elle se met à jour automatiquement chaque jour.',
  },
  {
    q: 'Comment savoir si la Lune est croissante ou décroissante ?',
    a: 'Dans l’hémisphère Nord, une Lune croissante est éclairée sur sa droite et forme un « D » ; une Lune décroissante est éclairée sur sa gauche et forme un « C ». La Lune est croissante entre la nouvelle lune et la pleine lune, puis décroissante jusqu’à la nouvelle lune suivante.',
  },
  {
    q: 'Combien de temps dure un cycle lunaire ?',
    a: 'Un cycle complet, d’une nouvelle lune à la suivante, dure en moyenne 29 jours, 12 heures et 44 minutes. Chacune des 8 phases dure donc environ 3 à 4 jours.',
  },
  {
    q: 'Quand est la prochaine pleine lune ?',
    a: 'La date et l’heure de la prochaine pleine lune et de la prochaine nouvelle lune sont indiquées sur cette page. Le calendrier lunaire de Lunaris donne toutes les dates de l’année, avec le signe dans lequel chaque lune se forme.',
  },
  {
    q: 'La Lune a-t-elle une influence sur nous ?',
    a: 'La science a montré l’influence de la Lune sur les marées, mais pas sur l’humeur ou le comportement humain. En astrologie, les phases lunaires servent plutôt de repère symbolique pour rythmer ses projets : commencer à la nouvelle lune, faire le bilan à la pleine lune.',
  },
]

// Premier jour de chaque signe (mois, jour), dates habituelles de la presse astrologique.
export const DEBUTS_SIGNES = {
  belier: [3, 21],
  taureau: [4, 20],
  gemeaux: [5, 21],
  cancer: [6, 21],
  lion: [7, 23],
  vierge: [8, 23],
  balance: [9, 23],
  scorpion: [10, 23],
  sagittaire: [11, 22],
  capricorne: [12, 22],
  verseau: [1, 20],
  poissons: [2, 19],
}

export const FAQ_MON_SIGNE = [
  {
    q: 'Comment connaître son signe astrologique ?',
    a: 'Votre signe astrologique (ou signe solaire) dépend de la position du Soleil dans le zodiaque le jour de votre naissance. Il suffit donc de votre jour et de votre mois de naissance : entrez-les ci-dessus pour le connaître.',
  },
  {
    q: 'Je suis né à la limite entre deux signes, quel est mon signe ?',
    a: 'Le Soleil ne change pas de signe exactement le même jour chaque année : selon l’année, le changement peut avoir lieu un jour plus tôt ou plus tard. Si vous êtes né le premier ou le dernier jour d’un signe, votre signe exact dépend de votre année, de votre heure et de votre lieu de naissance.',
  },
  {
    q: 'Quelle est la différence entre le signe et l’ascendant ?',
    a: 'Le signe correspond à la position du Soleil à votre naissance, et décrit votre personnalité profonde. L’ascendant est le signe qui se levait à l’horizon à l’instant précis de votre naissance : pour le calculer, il faut l’heure et le lieu de naissance exacts. Il décrit plutôt la façon dont vous vous montrez aux autres.',
  },
  {
    q: 'Quels sont les 12 signes du zodiaque dans l’ordre ?',
    a: 'Bélier, Taureau, Gémeaux, Cancer, Lion, Vierge, Balance, Scorpion, Sagittaire, Capricorne, Verseau et Poissons. Le zodiaque commence avec le Bélier, à l’équinoxe de printemps.',
  },
]
