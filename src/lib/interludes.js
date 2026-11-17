// Petits écrans glissés entre les questions du questionnaire : ils montrent à la personne
// ce que Lunaris va faire de sa réponse, pour lui donner envie d'aller au bout.
// Aucun chiffre ni avis : uniquement ce que l'app fait vraiment (l'IA reçoit ces réponses, voir functions/quiz.js).

export const SIGN_INFO = {
  Bélier: { glyph: '♈', element: 'Feu', text: 'Direct et courageux, vous lancez les choses avant tout le monde.' },
  Taureau: { glyph: '♉', element: 'Terre', text: 'Fiable et patient, vous construisez des choses qui durent.' },
  Gémeaux: { glyph: '♊', element: 'Air', text: 'Curieux et vif, vous avez toujours une idée et une question d’avance.' },
  Cancer: { glyph: '♋', element: 'Eau', text: 'Protecteur et intuitif, vous sentez ce que les autres ne disent pas.' },
  Lion: { glyph: '♌', element: 'Feu', text: 'Généreux et chaleureux, vous donnez de l’élan à tout ce que vous touchez.' },
  Vierge: { glyph: '♍', element: 'Terre', text: 'Précis et attentionné, vous voyez le détail qui fait la différence.' },
  Balance: { glyph: '♎', element: 'Air', text: 'Diplomate et élégant, vous cherchez l’équilibre en toute chose.' },
  Scorpion: { glyph: '♏', element: 'Eau', text: 'Intense et loyal, vous allez toujours au fond des choses.' },
  Sagittaire: { glyph: '♐', element: 'Feu', text: 'Optimiste et libre, vous voyez toujours un peu plus loin.' },
  Capricorne: { glyph: '♑', element: 'Terre', text: 'Ambitieux et constant, vous avancez marche après marche.' },
  Verseau: { glyph: '♒', element: 'Air', text: 'Original et indépendant, vous pensez souvent avant les autres.' },
  Poissons: { glyph: '♓', element: 'Eau', text: 'Sensible et créatif, vous ressentez tout, et c’est une force.' },
}

// Écran affiché après une question, selon la réponse choisie : { kicker, title, text }.
export const INTERLUDES = {
  situation: {
    kicker: 'Lunaris s’adapte à vous',
    title: 'Des tâches faites pour votre vie, pas pour celle d’un autre.',
    texts: {
      etudiant: 'Vos tâches tiendront compte de votre vie d’étudiant·e : révisions, budget, rythme des cours et des partiels.',
      salarie: 'Vos tâches s’adapteront à vos journées de travail, pour rester faisables avant, pendant ou après le bureau.',
      independant: 'Vos tâches tiendront compte de votre activité : clients, organisation, et les pauses que vous oubliez de prendre.',
      recherche: 'Vos tâches vous aideront à avancer chaque jour sans vous épuiser : une démarche, un contact, un moment pour vous.',
      parent: 'Vos tâches suivront le rythme de la maison, avec des moments rien qu’à vous.',
      retraite: 'Vos tâches feront la place à vos projets, à vos proches et à vos envies du moment.',
      autre: 'Vos tâches seront pensées à partir de ce que vous venez de décrire.',
    },
  },
  focus: {
    kicker: 'Votre priorité',
    title: 'Votre horoscope partira de ce qui compte pour vous.',
    texts: {
      amour: 'Chaque matin, Lunaris mettra en avant ce qui se joue côté cœur et relations.',
      carriere: 'Chaque matin, Lunaris mettra en avant le travail, l’argent et les bons moments pour agir.',
      energie: 'Chaque matin, Lunaris vous dira quand foncer et quand ralentir.',
      voie: 'Chaque matin, Lunaris vous aidera à faire un pas vers ce qui compte vraiment pour vous.',
      confiance: 'Chaque matin, Lunaris vous montrera quand oser, avec de petites actions pour prendre confiance.',
      autre: 'Chaque matin, Lunaris tiendra compte de ce que vous venez de confier.',
    },
  },
  period: {
    kicker: 'Votre période',
    title: 'On avance à votre rythme.',
    texts: {
      bloque: 'Quand on se sent bloqué·e, un petit pas compte plus qu’un grand plan. Lunaris vous proposera des actions simples à lancer.',
      transition: 'Une transition demande des repères. Votre calendrier lunaire vous montrera les jours les plus propices pour avancer.',
      stable: 'Vous avez une bonne base. Lunaris vous aidera à viser un peu plus haut, un jour à la fois.',
      deborde: 'Quand tout déborde, mieux vaut peu mais bien. Lunaris gardera vos tâches courtes et réalistes.',
      autre: 'Lunaris tiendra compte de ce que vous traversez en ce moment.',
    },
  },
}
