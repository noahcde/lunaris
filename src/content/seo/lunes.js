// Sens de chaque nouvelle lune et pleine lune selon le signe où elle tombe (pages lunaris-app.fr/calendrier-lunaire/…).
export const PHASES = {
  nouvelle: {
    nom: 'Nouvelle lune',
    intro: 'La nouvelle lune survient lorsque la Lune passe entre la Terre et le Soleil : sa face éclairée est tournée vers le Soleil, si bien qu’elle reste invisible dans notre ciel. Elle se trouve alors dans le même signe que le Soleil, et c’est ce signe qui lui donne sa couleur symbolique. Dans la tradition astrologique, ce moment de pénombre ouvre un nouveau cycle d’environ 29 jours. C’est le temps des intentions, des graines que l’on plante et des projets que l’on ose commencer.',
    conseils: [
      'Notez par écrit une à trois intentions claires pour le cycle qui s’ouvre.',
      'Choisissez une première action très simple à faire dans les 48 heures.',
      'Allégez votre agenda pour laisser de la place à ce qui commence.',
      'Accordez-vous un moment calme, sans écran, pour écouter ce qui vous appelle vraiment.',
    ],
  },
  pleine: {
    nom: 'Pleine lune',
    intro: 'La pleine lune se produit lorsque la Terre se trouve entre le Soleil et la Lune : notre satellite apparaît alors entièrement éclairé, face au Soleil. Elle se situe donc dans le signe opposé à celui du Soleil, ce qui met en tension deux pôles complémentaires du zodiaque. La tradition y voit un point culminant du cycle, où ce qui a été semé deux semaines plus tôt devient visible. C’est un temps de bilan, de célébration et de lâcher-prise.',
    conseils: [
      'Faites le point sur les intentions posées à la dernière nouvelle lune.',
      'Célébrez au moins un progrès concret, même modeste.',
      'Identifiez une habitude, une tâche ou un engagement à laisser partir.',
      'Ménagez votre soirée : lumière douce, repas léger, coucher à heure régulière.',
    ],
  },
}

export const LUNE_EN = {
  belier: {
    nouvelle: {
      theme: 'Oser lancer ce qui attend',
      texte: [
        'La nouvelle lune en Bélier ouvre le zodiaque et porte l’élan du commencement à l’état pur. Le Soleil et la Lune réunis dans le premier signe de feu invitent à initier plutôt qu’à peaufiner. Symboliquement, c’est le moment de cesser d’attendre le moment parfait et de faire le premier pas, même imparfait, vers un projet qui vous tient à cœur.',
        'Les domaines mis en lumière touchent l’affirmation de soi, l’énergie physique, le courage et l’indépendance. L’ambiance est vive, parfois impatiente : vous aurez sans doute envie d’aller vite et de trancher. Canalisez cette fougue dans une intention nette et unique, plutôt que dans dix chantiers lancés à la fois. Le Bélier aime les débuts francs ; offrez-lui un objectif clair et un geste concret pour l’amorcer.',
      ],
      actions: [
        'Écrivez une intention en une phrase commençant par « Je lance ».',
        'Faites aujourd’hui la première action de ce projet, même en dix minutes.',
        'Bougez votre corps vingt minutes pour dépenser l’excès d’impatience.',
      ],
    },
    pleine: {
      theme: 'Trouver l’équilibre entre moi et nous',
      texte: [
        'La pleine lune en Bélier se lève quand le Soleil traverse la Balance. L’axe Bélier / Balance oppose l’élan personnel au besoin d’harmonie avec les autres. La Lune éclaire ici vos désirs propres, vos colères rentrées, ce que vous voulez vraiment, tandis que le Soleil rappelle la valeur du compromis et de la relation.',
        'Cette lunaison peut faire remonter une frustration : avez-vous trop cédé pour faire plaisir, ou au contraire foncé sans écouter ? La tradition y voit un moment pour rééquilibrer. Affirmer votre position avec franchise, sans brutalité, et reconnaître ce que vous devez aux autres. C’est aussi un bon moment pour relâcher une tension accumulée dans le corps, à travers l’effort physique ou la respiration. Vous pourrez ensuite revenir vers les autres plus léger, avec des demandes claires plutôt que des reproches.',
      ],
      actions: [
        'Exprimez calmement un besoin que vous taisez depuis des semaines.',
        'Listez les engagements pris pour plaire et retirez-en un.',
        'Pratiquez un sport intense puis cinq minutes de respiration lente.',
      ],
    },
  },
  taureau: {
    nouvelle: {
      theme: 'Planter des racines solides',
      texte: [
        'La nouvelle lune en Taureau marque un début lent mais durable. Dans ce signe de terre gouverné par Vénus, les intentions gagnent à être concrètes, tangibles, presque matérielles. On ne cherche pas l’éclat, on cherche ce qui tiendra dans le temps : une routine, un budget mieux pensé, un lieu de vie plus doux.',
        'Les thèmes associés sont la sécurité, les ressources, le rapport au corps et aux sens, la valeur que vous vous accordez. L’atmosphère est plus posée qu’à la lunaison précédente, propice à la patience. C’est un bon moment pour vous demander ce qui vous nourrit vraiment, au sens propre comme au figuré, et pour poser une intention qui respecte votre rythme naturel plutôt que celui qu’on vous impose. Mieux vaut une graine bien choisie et arrosée chaque jour que dix promesses vite oubliées.',
      ],
      actions: [
        'Définissez une petite habitude quotidienne à tenir pendant tout le cycle.',
        'Rangez et embellissez un coin de votre espace de travail.',
        'Savourez un repas sans écran, en prêtant attention aux goûts.',
      ],
    },
    pleine: {
      theme: 'Lâcher prise sur ce qui alourdit',
      texte: [
        'La pleine lune en Taureau survient quand le Soleil est en Scorpion. L’axe Taureau / Scorpion relie ce que l’on possède et ce que l’on partage, la stabilité et la transformation. La Lune en Taureau réclame du confort et de la sécurité, alors que le Soleil en Scorpion pousse à regarder ce qui doit mourir pour que la vie se renouvelle.',
        'Symboliquement, c’est une lunaison qui interroge votre attachement : aux objets, aux habitudes, à une situation connue même quand elle ne vous convient plus. Le moment se prête à un tri, matériel ou intérieur. Vous pourrez aussi célébrer ce que vous avez construit patiemment, et vous accorder un vrai plaisir simple. L’équilibre consiste à garder ce qui nourrit et à relâcher ce qui pèse.',
      ],
      actions: [
        'Triez un placard ou un dossier et donnez ce qui ne sert plus.',
        'Faites le point sur vos dépenses du mois, sans jugement.',
        'Offrez-vous une marche lente dans la nature, téléphone rangé.',
      ],
    },
  },
  gemeaux: {
    nouvelle: {
      theme: 'Ouvrir de nouvelles conversations',
      texte: [
        'La nouvelle lune en Gémeaux souffle un vent de curiosité. Dans ce signe d’air gouverné par Mercure, les intentions ont trait à l’apprentissage, aux échanges et aux idées. C’est le moment symbolique pour commencer une formation, reprendre contact avec quelqu’un ou lancer une conversation que vous repoussez.',
        'Les domaines concernés sont la communication, l’écriture, les déplacements courts, la fratrie et le voisinage. L’humeur est légère, vive, un peu dispersée parfois : l’esprit saute d’un sujet à l’autre avec plaisir. Plutôt que de lutter contre cette agilité, utilisez-la pour explorer plusieurs pistes, puis choisissez celle qui vous stimule le plus. Une intention formulée avec des mots précis aura ici une force particulière. Pensez à l’écrire, à la relire, et à la partager avec une personne de confiance pour lui donner corps.',
      ],
      actions: [
        'Inscrivez-vous à un cours ou choisissez un livre sur un sujet nouveau.',
        'Envoyez un message à une personne perdue de vue.',
        'Videz votre tête : notez toutes vos idées, puis entourez-en une seule.',
      ],
    },
    pleine: {
      theme: 'Relier les idées au sens',
      texte: [
        'La pleine lune en Gémeaux se produit quand le Soleil est en Sagittaire. L’axe Gémeaux / Sagittaire met face à face l’information et la sagesse, les détails et la vision d’ensemble. La Lune en Gémeaux multiplie les données, les messages, les avis, tandis que le Soleil en Sagittaire cherche ce que tout cela veut dire.',
        'Cette lunaison peut donner l’impression d’un trop-plein : notifications, discussions, projets entamés. La tradition y lit une invitation à faire le tri et à retrouver le fil conducteur. Quelles informations vous servent vraiment ? Quelles conversations méritent d’être menées jusqu’au bout ? C’est aussi un bon moment pour dire enfin une vérité restée en suspens, avec tact et clarté. Moins de bruit, plus de sens : voilà la direction que suggère ce ciel pour les jours qui suivent.',
      ],
      actions: [
        'Désabonnez-vous de trois newsletters ou fils qui vous dispersent.',
        'Terminez une conversation laissée en suspens, par écrit ou de vive voix.',
        'Résumez en trois lignes ce que vous avez appris ce mois-ci.',
      ],
    },
  },
  cancer: {
    nouvelle: {
      theme: 'Prendre soin de son nid',
      texte: [
        'La nouvelle lune en Cancer se déroule dans le signe que gouverne la Lune elle-même, ce qui lui donne une résonance particulière dans la tradition. Les intentions touchent au foyer, à la famille, aux racines et à la sécurité émotionnelle. C’est un commencement intime, tourné vers l’intérieur plutôt que vers la scène.',
        'L’ambiance est sensible, protectrice, parfois nostalgique. Vous pourriez ressentir le besoin de vous retirer un peu, de cuisiner, de retrouver des proches ou de rendre votre intérieur plus accueillant. Écoutez cette envie de cocon : elle n’est pas une fuite mais une manière de recharger vos réserves. Posez une intention qui concerne la façon dont vous prenez soin de vous et des personnes qui comptent. Un petit geste répété chaque soir comptera davantage qu’une grande résolution.',
      ],
      actions: [
        'Préparez un plat réconfortant et partagez-le avec un proche.',
        'Fixez un rituel du soir apaisant pour les quatre semaines à venir.',
        'Notez un besoin émotionnel que vous voulez mieux respecter.',
      ],
    },
    pleine: {
      theme: 'Concilier carrière et vie intime',
      texte: [
        'La pleine lune en Cancer brille quand le Soleil traverse le Capricorne, souvent au cœur de l’hiver. L’axe Cancer / Capricorne oppose le foyer et la carrière, la tendresse et la responsabilité, la vie privée et le rôle public. La Lune, très à l’aise dans ce signe, amplifie les émotions et les besoins de réconfort.',
        'Cette lunaison met en lumière l’équilibre entre ce que vous donnez au travail et ce que vous gardez pour les vôtres. Une fatigue ou une émotion peut surgir pour rappeler que la performance ne remplace pas la sécurité affective. La tradition invite à honorer ce que vous ressentez, à pardonner une vieille blessure familiale si c’est possible, et à poser une limite claire entre temps professionnel et temps personnel. Prenez soin de vous comme vous prendriez soin d’un proche.',
      ],
      actions: [
        'Fixez une heure après laquelle vous ne consultez plus vos mails pros.',
        'Appelez un membre de votre famille simplement pour prendre des nouvelles.',
        'Écrivez une émotion qui vous traverse, sans chercher à la corriger.',
      ],
    },
  },
  lion: {
    nouvelle: {
      theme: 'Rallumer sa flamme créative',
      texte: [
        'La nouvelle lune en Lion se déroule au cœur de l’été, dans le signe gouverné par le Soleil. Elle invite à initier ce qui vous rend vivant : un projet créatif, une prise de parole, un loisir laissé de côté. Symboliquement, c’est le moment d’oser briller sans attendre la permission de qui que ce soit.',
        'Les domaines concernés sont la créativité, le jeu, le plaisir, les enfants, l’amour et la confiance en soi. L’ambiance est chaleureuse et généreuse, avec une envie de reconnaissance qu’il est sain d’accueillir. Posez une intention qui parle de joie plutôt que de devoir. Ce que vous lancez sous ce ciel gagne à être fait avec le cœur, et à être montré, même à un petit public. Ce n’est pas de la vanité : c’est une façon de donner de la valeur à ce que vous aimez faire.',
      ],
      actions: [
        'Consacrez trente minutes à une activité créative sans objectif de résultat.',
        'Partagez publiquement un travail dont vous êtes fier.',
        'Notez trois qualités que vous aimez chez vous.',
      ],
    },
    pleine: {
      theme: 'Briller au service du collectif',
      texte: [
        'La pleine lune en Lion survient quand le Soleil est en Verseau, au milieu de l’hiver. L’axe Lion / Verseau confronte l’expression personnelle et l’appartenance au groupe, le cœur individuel et l’idéal partagé. La Lune en Lion réclame de l’attention et de la chaleur, le Soleil en Verseau rappelle que chacun n’est qu’une voix parmi d’autres.',
        'Cette lunaison peut révéler un besoin de reconnaissance resté insatisfait, ou au contraire une tendance à vous effacer dans le collectif. La tradition y voit un moment pour réconcilier les deux : mettre vos talents au service d’une cause, d’une équipe ou d’amis. C’est aussi un temps pour célébrer une réussite créative et remercier celles et ceux qui l’ont rendue possible. La générosité du Lion trouve alors son vrai sens lorsqu’elle se partage.',
      ],
      actions: [
        'Proposez votre aide sur un projet collectif qui vous inspire.',
        'Célébrez une réussite récente, même par un simple geste symbolique.',
        'Remerciez par écrit une personne qui vous a soutenu.',
      ],
    },
  },
  vierge: {
    nouvelle: {
      theme: 'Affiner ses routines du quotidien',
      texte: [
        'La nouvelle lune en Vierge arrive souvent avec la rentrée, et son symbolisme s’y prête bien. Dans ce signe de terre gouverné par Mercure, les intentions concernent l’organisation, la santé au quotidien, le travail bien fait et les petites améliorations qui changent tout. On ne cherche pas la révolution mais l’ajustement juste.',
        'L’ambiance est méthodique, attentive aux détails, parfois critique. Utilisez ce regard précis pour simplifier plutôt que pour vous juger. C’est un excellent moment pour revoir votre emploi du temps, clarifier vos priorités et installer des habitudes qui soutiennent votre énergie : sommeil, alimentation, mouvement, pauses. Une intention modeste mais tenue vaut ici mieux qu’un grand plan abandonné. Commencez par un seul domaine, observez les effets pendant quelques semaines, puis ajustez avec bienveillance plutôt qu’avec sévérité.',
      ],
      actions: [
        'Revoyez votre semaine type et supprimez une tâche inutile.',
        'Préparez une liste de courses équilibrée pour les jours à venir.',
        'Rangez votre bureau numérique : fichiers, onglets, notifications.',
      ],
    },
    pleine: {
      theme: 'Accepter l’imperfection',
      texte: [
        'La pleine lune en Vierge se lève quand le Soleil est en Poissons. L’axe Vierge / Poissons relie l’ordre et le flou, l’analyse et l’intuition, le service concret et la compassion sans limites. La Lune en Vierge veut tout contrôler et trier, le Soleil en Poissons rappelle qu’une part de la vie échappe à toute liste.',
        'Cette lunaison peut faire remonter du perfectionnisme ou une fatigue liée à trop de charge mentale. La tradition y lit une invitation à lâcher la recherche du sans-faute. Faites le bilan de vos routines : lesquelles vous servent, lesquelles sont devenues des contraintes ? Gardez l’essentiel, et laissez un peu d’espace à l’improvisation, au repos et à la rêverie. Ce qui est fait avec cœur et présence vaut souvent mieux que ce qui est fait parfaitement mais sans joie.',
      ],
      actions: [
        'Rayez de votre liste une tâche qui n’a plus de raison d’être.',
        'Accordez-vous une sieste ou une pause sans culpabilité.',
        'Terminez un travail en acceptant qu’il soit simplement « assez bien ».',
      ],
    },
  },
  balance: {
    nouvelle: {
      theme: 'Rééquilibrer ses relations',
      texte: [
        'La nouvelle lune en Balance ouvre un cycle placé sous le signe des relations et de l’harmonie. Gouvernée par Vénus, la Balance invite à initier un partenariat, à réparer un lien abîmé ou à repenser la manière dont vous coopérez avec les autres. Le commencement se fait ici à deux, ou du moins en tenant compte de l’autre.',
        'Les domaines concernés sont le couple, les associations, les contrats, l’esthétique et le sens de la justice. L’ambiance est diplomate, sensible à la beauté, parfois hésitante. Si un choix vous fait balancer depuis longtemps, ce ciel symbolise le moment de peser le pour et le contre, puis de trancher. Posez une intention qui équilibre ce que vous donnez et ce que vous recevez. Une relation juste commence souvent par une conversation sincère.',
      ],
      actions: [
        'Proposez un moment de qualité à une personne importante pour vous.',
        'Faites un tableau pour et contre sur une décision en attente.',
        'Ajoutez une touche de beauté à votre environnement : fleurs, musique, lumière.',
      ],
    },
    pleine: {
      theme: 'Écouter l’autre sans s’oublier',
      texte: [
        'La pleine lune en Balance éclaire le ciel quand le Soleil est en Bélier, au printemps. L’axe Balance / Bélier oppose le besoin de lien et le besoin d’autonomie. Ici, c’est la Lune qui porte la relation, tandis que le Soleil pousse à l’affirmation personnelle : la question devient comment rester soi tout en restant ensemble.',
        'Cette lunaison met souvent en lumière un déséquilibre dans une relation : quelqu’un donne trop, quelqu’un décide seul. La tradition invite à rétablir la justesse, par le dialogue plutôt que par le conflit. C’est aussi un moment pour récolter les fruits d’une collaboration, signer un accord mûri, ou au contraire reconnaître qu’un lien a fait son temps et le laisser s’alléger. La paix recherchée par la Balance passe parfois par une parole franche.',
      ],
      actions: [
        'Ayez une discussion honnête sur la répartition des tâches avec un proche.',
        'Remerciez un partenaire ou collègue pour une collaboration réussie.',
        'Notez une relation où vous vous oubliez et un premier ajustement possible.',
      ],
    },
  },
  scorpion: {
    nouvelle: {
      theme: 'Plonger vers l’essentiel',
      texte: [
        'La nouvelle lune en Scorpion se déroule à l’automne, quand la nature se dépouille. Dans ce signe d’eau associé à Pluton et Mars, les intentions ont une profondeur particulière : elles concernent la transformation, ce que l’on accepte de laisser mourir pour renaître. Ce commencement est discret, presque souterrain, mais puissant.',
        'Les thèmes mis en avant sont l’intimité, les ressources partagées, la confiance, les peurs et la capacité de régénération. L’ambiance est intense, introspective, parfois troublante. C’est un moment favorable pour regarder en face une situation que vous évitez, engager un travail sur vous-même ou assainir une question d’argent commun. Posez une intention sincère, quitte à la garder secrète. Ce qui germe dans l’ombre du Scorpion a souvent besoin de temps et de discrétion avant de se montrer au grand jour, et c’est très bien ainsi.',
      ],
      actions: [
        'Écrivez une peur qui vous freine, puis une petite action pour l’affronter.',
        'Faites le point sur un dossier financier partagé que vous repoussez.',
        'Prenez un bain chaud ou une douche lente comme rituel de renouveau.',
      ],
    },
    pleine: {
      theme: 'Transformer sans tout détruire',
      texte: [
        'La pleine lune en Scorpion se lève quand le Soleil est en Taureau, en plein printemps. L’axe Scorpion / Taureau confronte la stabilité et la métamorphose, ce que l’on possède et ce que l’on partage avec l’autre. La Lune en Scorpion fait affleurer ce qui était caché, pendant que le Soleil en Taureau réclame calme et sécurité.',
        'Cette lunaison est réputée intense dans la tradition : jalousies, secrets ou émotions enfouies peuvent remonter. Plutôt que de les fuir, accueillez-les comme des informations. C’est un temps pour lâcher une rancune, clore une histoire qui vous retient, ou transformer une vieille dépendance. Le Taureau rappelle de le faire avec douceur et en prenant soin de votre corps. Rien ne presse : une transformation profonde se fait par étapes, et chacune mérite d’être accueillie avec patience et respect pour vous-même.',
      ],
      actions: [
        'Écrivez une lettre à une personne ou situation, puis gardez-la ou brûlez-la.',
        'Supprimez une application ou habitude qui vous rend dépendant.',
        'Terminez la journée par un étirement lent et une tisane.',
      ],
    },
  },
  sagittaire: {
    nouvelle: {
      theme: 'Viser plus loin et plus large',
      texte: [
        'La nouvelle lune en Sagittaire ouvre un cycle d’expansion. Dans ce signe de feu gouverné par Jupiter, les intentions concernent l’horizon : voyages, études, quête de sens, projets ambitieux. Symboliquement, c’est le moment de tirer une flèche vers un but qui vous dépasse un peu et vous donne envie d’avancer.',
        'L’ambiance est optimiste, enthousiaste, parfois trop confiante. Les domaines mis en avant touchent la philosophie, les croyances, l’enseignement, l’étranger et la liberté. Profitez de cet élan pour formuler une intention qui donne du souffle à votre quotidien, puis découpez-la en étapes réalistes. Le Sagittaire aime l’aventure ; offrez-lui une destination, même intérieure, et un premier pas pour y aller. L’enthousiasme est un excellent carburant, à condition de garder les pieds sur terre et de vérifier régulièrement que la route choisie vous ressemble toujours.',
      ],
      actions: [
        'Écrivez un objectif à un an qui vous enthousiasme vraiment.',
        'Réservez du temps pour découvrir un lieu ou une culture nouvelle.',
        'Lisez vingt minutes sur un sujet qui élargit votre vision du monde.',
      ],
    },
    pleine: {
      theme: 'Vérifier ses croyances au réel',
      texte: [
        'La pleine lune en Sagittaire survient quand le Soleil est en Gémeaux, au début de l’été. L’axe Sagittaire / Gémeaux oppose la grande vision et le détail, la conviction et la curiosité. La Lune en Sagittaire veut croire, partir, s’enthousiasmer, tandis que le Soleil en Gémeaux pose des questions et vérifie les faits.',
        'Cette lunaison met en lumière vos certitudes : lesquelles vous portent, lesquelles vous enferment ? La tradition y voit un moment pour célébrer un apprentissage abouti, un voyage réalisé ou un projet qui a pris de l’ampleur. C’est aussi un bon moment pour lâcher un dogme personnel, une règle trop rigide, et rouvrir votre esprit à d’autres points de vue. La sagesse du Sagittaire grandit lorsqu’elle accepte d’être questionnée, et chaque échange sincère peut enrichir votre propre quête de sens.',
      ],
      actions: [
        'Notez une conviction forte et cherchez un avis contraire bien argumenté.',
        'Partagez avec quelqu’un une leçon apprise récemment.',
        'Sortez marcher dehors, idéalement sous le ciel dégagé du soir.',
      ],
    },
  },
  capricorne: {
    nouvelle: {
      theme: 'Bâtir un projet sur la durée',
      texte: [
        'La nouvelle lune en Capricorne arrive au seuil de l’hiver, souvent autour du changement d’année. Dans ce signe de terre gouverné par Saturne, les intentions sont structurées, ambitieuses et pensées pour durer. C’est le moment symbolique de poser les fondations d’un objectif professionnel ou d’un engagement de long terme.',
        'Les thèmes concernés sont la carrière, la réputation, les responsabilités, la discipline et la maturité. L’ambiance est sérieuse, concentrée, parfois austère. Ce ciel ne promet pas de résultats rapides, il récompense dans la tradition l’effort régulier. Formulez une intention précise, mesurable, et définissez la première marche de l’escalier. Pensez aussi à prévoir des temps de repos dans votre plan. Une ambition saine ne se construit pas au détriment de votre santé ni de vos liens, et le Capricorne le sait mieux que personne.',
      ],
      actions: [
        'Rédigez un objectif professionnel avec une échéance et une première étape.',
        'Bloquez dans votre agenda un créneau hebdomadaire dédié à ce projet.',
        'Prévoyez une vraie pause chaque jour, inscrite comme un rendez-vous.',
      ],
    },
    pleine: {
      theme: 'Récolter sans s’épuiser',
      texte: [
        'La pleine lune en Capricorne éclaire les nuits d’été, quand le Soleil traverse le Cancer. L’axe Capricorne / Cancer met en tension le devoir et le cœur, le statut social et le foyer. La Lune en Capricorne souligne vos ambitions et vos responsabilités, le Soleil en Cancer rappelle votre besoin de douceur et de soutien.',
        'Cette lunaison peut marquer l’aboutissement d’un effort de long terme ou révéler une lassitude face à trop d’obligations. La tradition y voit un moment pour reconnaître le chemin parcouru, puis pour délester ce qui relève de la contrainte inutile. Demandez-vous quelle responsabilité vous portez par habitude plutôt que par choix, et autorisez-vous à la déléguer ou à la poser. Récolter, c’est aussi savoir s’arrêter pour profiter de ce que l’on a bâti, entouré de ceux qui comptent pour vous.',
      ],
      actions: [
        'Listez trois résultats concrets obtenus depuis le début de l’année.',
        'Déléguez ou refusez une tâche qui ne relève pas de votre rôle.',
        'Passez une soirée tranquille chez vous, sans travail en attente.',
      ],
    },
  },
  verseau: {
    nouvelle: {
      theme: 'Innover et sortir du cadre',
      texte: [
        'La nouvelle lune en Verseau se déroule en plein hiver et porte un parfum de renouveau inattendu. Dans ce signe d’air associé à Uranus et Saturne, les intentions concernent l’originalité, la liberté et les projets collectifs. C’est le moment symbolique d’essayer une approche différente, voire de bousculer une routine devenue trop étroite.',
        'Les domaines mis en avant sont l’amitié, les réseaux, les idéaux, les technologies et l’avenir. L’ambiance est vive, intellectuelle, un peu détachée parfois. Profitez-en pour imaginer la version de votre vie qui vous ressemble davantage, sans chercher à plaire. Une intention qui sert aussi un groupe, une communauté ou une cause trouvera ici un écho particulier. N’ayez pas peur de paraître différent : c’est précisément ce que ce ciel encourage, à condition de rester relié aux personnes qui vous entourent.',
      ],
      actions: [
        'Testez une nouvelle méthode de travail pendant une semaine.',
        'Rejoignez un groupe ou une association alignée avec vos valeurs.',
        'Écrivez une idée un peu folle et un tout premier pas pour l’explorer.',
      ],
    },
    pleine: {
      theme: 'Accorder liberté et chaleur',
      texte: [
        'La pleine lune en Verseau se lève en plein été, quand le Soleil brille en Lion. L’axe Verseau / Lion oppose le collectif et l’individu, la raison et le cœur. La Lune en Verseau éclaire votre besoin de liberté et d’espace, tandis que le Soleil en Lion réclame chaleur, reconnaissance et expression personnelle.',
        'Cette lunaison peut faire émerger une envie de rupture, de changement soudain ou de prise de distance émotionnelle. La tradition y voit un moment pour célébrer vos amitiés et vos engagements collectifs, mais aussi pour lâcher une attente de validation. Pouvez-vous rester libre sans vous couper des autres, et généreux sans vous perdre ? C’est la question que pose ce ciel. Y répondre, même partiellement, peut vous aider à mieux vous situer au sein de vos cercles et à y trouver une place plus juste.',
      ],
      actions: [
        'Organisez un moment simple entre amis, sans enjeu particulier.',
        'Identifiez un projet où vous attendez trop d’approbation et avancez quand même.',
        'Débranchez une soirée entière des réseaux sociaux.',
      ],
    },
  },
  poissons: {
    nouvelle: {
      theme: 'Écouter son intuition',
      texte: [
        'La nouvelle lune en Poissons clôt symboliquement le tour du zodiaque, juste avant le printemps. Dans ce signe d’eau associé à Neptune et Jupiter, les intentions sont plus floues, plus intuitives, souvent liées aux rêves, à l’imaginaire ou à la spiritualité. Ce commencement se fait en douceur, presque en silence.',
        'Les thèmes concernés sont la sensibilité, la compassion, l’art, le repos et tout ce qui dépasse la logique. L’ambiance est poreuse, rêveuse, parfois fatiguée : votre énergie peut sembler plus basse qu’à l’accoutumée. Accueillez ce rythme plutôt que de le forcer. Une intention formulée après une marche, une méditation ou un moment de musique aura ici plus de justesse qu’un plan rigide. Laissez-vous le droit de ne pas tout savoir : le chemin se dessinera au fil du cycle, à mesure que vous avancerez.',
      ],
      actions: [
        'Tenez un carnet de rêves ou d’impressions au réveil pendant une semaine.',
        'Prévoyez une demi-journée sans rendez-vous pour récupérer.',
        'Écoutez un album entier les yeux fermés, sans rien faire d’autre.',
      ],
    },
    pleine: {
      theme: 'Remettre du concret dans le rêve',
      texte: [
        'La pleine lune en Poissons survient à la fin de l’été, quand le Soleil est en Vierge. L’axe Poissons / Vierge oppose l’imaginaire et la méthode, l’abandon et le contrôle. La Lune en Poissons amplifie la sensibilité, les émotions diffuses, l’empathie, pendant que le Soleil en Vierge invite à trier et à organiser.',
        'Cette lunaison peut donner l’impression de baigner dans un brouillard, ou d’absorber les humeurs de votre entourage. La tradition y voit un moment pour lâcher une illusion, une attente irréaliste ou un rôle de sauveur épuisant. Elle célèbre aussi la créativité et l’intuition. L’équilibre consiste à donner forme à vos rêves par des gestes simples, et à protéger votre énergie. Quelques limites claires, posées avec gentillesse, vous permettront de rester ouvert aux autres sans vous oublier en chemin.',
      ],
      actions: [
        'Transformez une rêverie récurrente en une étape concrète cette semaine.',
        'Refusez gentiment une demande qui vous vide de votre énergie.',
        'Consacrez une heure à une activité artistique, sans but de résultat.',
      ],
    },
  },
}

export const FAQ_LUNE = [
  {
    q: 'Quand est la prochaine pleine lune ?',
    a: 'Les dates exactes de la prochaine pleine lune et de la prochaine nouvelle lune sont indiquées dans le calendrier lunaire de cette page, avec le signe dans lequel chacune se produit. En moyenne, une pleine lune revient tous les 29,5 jours environ, soit une par mois, et parfois deux dans le même mois civil.',
  },
  {
    q: 'Quelle différence entre nouvelle lune et pleine lune ?',
    a: 'À la nouvelle lune, la Lune se trouve entre la Terre et le Soleil : elle est invisible et dans le même signe que le Soleil. À la pleine lune, c’est la Terre qui est au milieu : la Lune est entièrement éclairée et se trouve dans le signe opposé. La tradition associe la première aux intentions et aux débuts, la seconde aux bilans, aux aboutissements et au lâcher-prise.',
  },
  {
    q: 'Pourquoi la pleine lune porte un nom de signe ?',
    a: 'Au moment de la pleine lune, la Lune fait face au Soleil dans le ciel. Elle occupe donc le signe opposé à celui où se trouve le Soleil : quand le Soleil est en Bélier, la pleine lune tombe en Balance, et inversement. C’est ce signe que l’on retient pour nommer la lunaison et en lire le sens symbolique, toujours en lien avec l’axe formé avec le signe solaire.',
  },
  {
    q: 'Que faire pendant une nouvelle lune ?',
    a: 'La tradition invite à poser des intentions pour le cycle qui commence : les écrire, les formuler clairement, puis faire un premier pas concret dans les jours qui suivent. C’est aussi un bon moment pour ralentir, faire de la place dans son agenda et s’accorder un temps calme. Le signe de la nouvelle lune donne une couleur particulière aux domaines à privilégier.',
  },
  {
    q: 'La lune influence-t-elle le sommeil ?',
    a: 'Quelques études ont observé un sommeil un peu plus court ou plus léger autour de la pleine lune, mais d’autres n’ont trouvé aucun effet, et la question reste débattue sans preuve définitive. L’astrologie, elle, relève d’une tradition symbolique et non d’une démonstration scientifique. Si votre sommeil vous préoccupe, des horaires réguliers et une chambre sombre restent les repères les plus utiles, et un professionnel de santé est le bon interlocuteur.',
  },
]
