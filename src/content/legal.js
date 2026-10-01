// Pages légales de Lunaris : mentions légales, CGU, CGV, confidentialité, cookies.
// Les informations sur l'éditeur sont à compléter ci-dessous : tant qu'un champ est vide,
// la page affiche « [à compléter : …] » en couleur pour qu'on le repère.

export const EDITEUR = {
  nom: '', // nom et prénom, ou dénomination de la société
  statut: '', // ex. « Entrepreneur individuel (micro-entreprise) » ou « SAS au capital de 1 000 € »
  adresse: '', // adresse postale du siège ou du domicile professionnel
  siret: '', // numéro SIRET (ou RCS pour une société)
  tva: 'TVA non applicable, article 293 B du Code général des impôts', // à remplacer par le n° de TVA si assujetti
  directeur: '', // directeur de la publication (en général la même personne que « nom »)
  email: 'contact@lunaris-app.fr',
  mediateur: '', // nom, adresse et site du médiateur de la consommation choisi
}

export const UPDATED = '1er octobre 2026'
export const SITE = 'lunaris-app.fr'

// {nom}, {statut}… sont remplacés par les champs EDITEUR (voir LegalPage).
export const DOCS = [
  {
    id: 'mentions-legales',
    short: 'Mentions légales',
    title: 'Mentions légales',
    sections: [
      {
        title: 'Éditeur',
        body: [
          'Le site et l’application Lunaris ({site}) sont édités par {nom}, {statut}.',
          'Adresse : {adresse}. SIRET : {siret}. {tva}.',
          'Contact : {email}.',
          'Directeur de la publication : {directeur}.',
        ],
      },
      {
        title: 'Hébergement',
        body: [
          'Le site est hébergé par Firebase Hosting, service de Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, États-Unis.',
        ],
      },
      {
        title: 'Propriété intellectuelle',
        body: [
          'Le nom Lunaris, le logo, les textes, le design et le code du site sont protégés. Toute reproduction sans autorisation écrite de l’éditeur est interdite.',
        ],
      },
      {
        title: 'Données personnelles et cookies',
        body: [
          'Le traitement de vos données est décrit dans la politique de confidentialité, et les traceurs utilisés dans la page Cookies.',
        ],
      },
    ],
  },
  {
    id: 'cgu',
    short: 'CGU',
    title: 'Conditions générales d’utilisation',
    sections: [
      {
        title: 'Objet',
        body: [
          'Les présentes conditions encadrent l’utilisation de Lunaris, application qui propose un horoscope personnalisé, des tâches quotidiennes et un calendrier lunaire. En créant un compte, vous les acceptez.',
        ],
      },
      {
        title: 'Nature du service',
        body: [
          'Lunaris relève du divertissement et du développement personnel. Les contenus astrologiques ne constituent ni une prédiction certaine, ni un conseil médical, psychologique, juridique ou financier. Ne prenez aucune décision importante sur leur seul fondement.',
          'L’horoscope et les tâches du jour sont rédigés automatiquement par une intelligence artificielle à partir de votre profil. Ils peuvent contenir des imprécisions.',
        ],
      },
      {
        title: 'Compte',
        body: [
          'La connexion se fait avec un compte Google. Vous êtes responsable de l’accès à ce compte et des informations que vous renseignez (prénom, date et heure de naissance, réponses au questionnaire).',
          'Le service est réservé aux personnes âgées d’au moins 15 ans. L’abonnement payant est réservé aux personnes majeures ou aux mineurs autorisés par leur représentant légal.',
        ],
      },
      {
        title: 'Utilisation',
        body: [
          'Vous vous engagez à utiliser Lunaris pour un usage personnel et à ne pas tenter de perturber le service, d’en extraire le contenu de façon automatisée ou d’en contourner l’accès payant.',
          'L’éditeur peut suspendre un compte en cas de manquement grave à ces règles, après vous en avoir informé sauf urgence.',
        ],
      },
      {
        title: 'Disponibilité',
        body: [
          'L’éditeur fait ses meilleurs efforts pour que Lunaris soit accessible en continu, sans pouvoir le garantir : maintenance, panne d’un prestataire ou de votre connexion peuvent l’interrompre.',
        ],
      },
      {
        title: 'Suppression du compte',
        body: [
          'Vous pouvez demander la suppression de votre compte et de vos données à tout moment en écrivant à {email}. Pensez à résilier d’abord votre abonnement s’il est en cours.',
        ],
      },
      {
        title: 'Modification et droit applicable',
        body: [
          'Ces conditions peuvent évoluer ; la version en vigueur est celle publiée sur cette page. Elles sont soumises au droit français.',
        ],
      },
    ],
  },
  {
    id: 'cgv',
    short: 'CGV',
    title: 'Conditions générales de vente',
    sections: [
      {
        title: 'Vendeur et champ d’application',
        body: [
          'Les présentes conditions s’appliquent à l’abonnement Lunaris Premium vendu par {nom}, {statut}, {adresse}, SIRET {siret}, à des consommateurs. Elles complètent les conditions générales d’utilisation.',
        ],
      },
      {
        title: 'Offre',
        body: [
          'Lunaris Premium donne accès à l’horoscope personnalisé du jour, aux trois tâches quotidiennes et au détail de chaque jour du calendrier.',
          {
            list: [
              'Formule mensuelle : 6,99 € par mois.',
              'Formule annuelle : 49,99 € par an.',
            ],
          },
          'Les prix sont indiqués en euros, toutes taxes comprises. {tva}.',
        ],
      },
      {
        title: 'Essai gratuit',
        body: [
          'Un essai gratuit de 2 jours est proposé une seule fois par compte. Une carte bancaire est demandée au départ, mais rien n’est débité pendant l’essai.',
          'Sans résiliation avant la fin de l’essai, l’abonnement choisi démarre automatiquement et le premier paiement est prélevé.',
        ],
      },
      {
        title: 'Commande et paiement',
        body: [
          'La commande est passée depuis l’application, après acceptation des présentes conditions. Le paiement est traité par Stripe ; l’éditeur n’a jamais accès à vos données bancaires complètes.',
          'L’abonnement est payable d’avance et se renouvelle automatiquement à chaque échéance (mois ou année) jusqu’à résiliation.',
        ],
      },
      {
        title: 'Résiliation',
        body: [
          'Vous pouvez résilier à tout moment, en quelques clics, depuis votre profil : bouton « Gérer ou résilier mon abonnement ». La résiliation prend effet à la fin de la période en cours, déjà payée, pendant laquelle l’accès est conservé. Aucun remboursement au prorata n’est dû, sauf disposition légale contraire.',
        ],
      },
      {
        title: 'Droit de rétractation',
        body: [
          'Vous disposez en principe d’un délai de 14 jours à compter de la souscription pour vous rétracter (article L221-18 du Code de la consommation).',
          'Le contenu de Lunaris étant fourni immédiatement, vous demandez lors de la commande que l’accès commence tout de suite et reconnaissez perdre votre droit de rétractation dès cet accès (article L221-28, 13°). Vous restez libre de résilier à tout moment pendant l’essai gratuit, sans aucun frais.',
        ],
      },
      {
        title: 'Garanties et responsabilité',
        body: [
          'Vous bénéficiez de la garantie légale de conformité applicable aux contenus et services numériques (articles L224-25-12 et suivants du Code de la consommation). En cas de défaut, écrivez à {email}.',
          'La responsabilité de l’éditeur ne saurait être engagée pour les décisions que vous prenez à partir des contenus astrologiques, qui relèvent du divertissement.',
        ],
      },
      {
        title: 'Réclamations et médiation',
        body: [
          'Pour toute réclamation, écrivez d’abord à {email}. En l’absence de solution, vous pouvez recourir gratuitement au médiateur de la consommation : {mediateur}.',
          'Vous pouvez aussi utiliser la plateforme européenne de règlement en ligne des litiges : https://ec.europa.eu/consumers/odr.',
        ],
      },
      {
        title: 'Droit applicable',
        body: ['Les présentes conditions sont soumises au droit français.'],
      },
    ],
  },
  {
    id: 'confidentialite',
    short: 'Confidentialité',
    title: 'Politique de confidentialité',
    sections: [
      {
        title: 'Responsable du traitement',
        body: ['{nom}, {adresse}. Pour toute question sur vos données : {email}.'],
      },
      {
        title: 'Données collectées',
        body: [
          {
            list: [
              'Compte Google : nom, prénom, adresse e-mail, photo de profil et identifiant de compte.',
              'Profil : prénom, nom, date et heure de naissance.',
              'Questionnaire : vos priorités, la période que vous traversez, vos attentes, le temps disponible et vos réponses libres.',
              'Utilisation : tâches cochées, jours accomplis et série.',
              'Abonnement : formule, statut et dates, identifiant client Stripe. Les données de carte sont gérées par Stripe seul.',
              'Notifications, si vous les activez : heure choisie, fuseau horaire et identifiant technique de votre appareil.',
            ],
          },
        ],
      },
      {
        title: 'Finalités et bases légales',
        body: [
          {
            list: [
              'Fournir le service (compte, horoscope, tâches, calendrier, série) : exécution du contrat.',
              'Gérer l’abonnement et la facturation : exécution du contrat et obligations légales comptables.',
              'Envoyer la notification du matin : votre consentement, retirable à tout moment depuis le profil.',
              'Assurer la sécurité et le bon fonctionnement du service : intérêt légitime.',
            ],
          },
          'Vos données ne sont ni vendues, ni utilisées pour de la publicité.',
        ],
      },
      {
        title: 'Intelligence artificielle',
        body: [
          'Pour rédiger votre horoscope du jour, votre prénom, votre signe, votre heure de naissance et vos réponses au questionnaire sont transmis à OpenAI via son API. Selon ses conditions, OpenAI n’utilise pas ces données pour entraîner ses modèles. Votre nom de famille et votre e-mail ne lui sont pas transmis.',
        ],
      },
      {
        title: 'Destinataires et sous-traitants',
        body: [
          {
            list: [
              'Google (Firebase) : connexion, base de données, hébergement, serveurs et notifications.',
              'Stripe : paiement et gestion de l’abonnement.',
              'OpenAI : rédaction de l’horoscope et des tâches.',
            ],
          },
          'Certains de ces prestataires peuvent traiter des données hors de l’Union européenne, notamment aux États-Unis. Ces transferts sont encadrés par le cadre de protection des données UE–États-Unis ou par les clauses contractuelles types de la Commission européenne.',
        ],
      },
      {
        title: 'Durée de conservation',
        body: [
          'Vos données sont conservées tant que votre compte existe, puis supprimées dans un délai de 30 jours après votre demande de suppression. Les pièces comptables liées aux paiements sont conservées 10 ans, comme l’exige la loi.',
        ],
      },
      {
        title: 'Vos droits',
        body: [
          'Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation, d’opposition et de portabilité de vos données, ainsi que du droit de définir des directives sur leur sort après votre décès. Écrivez à {email} ; une réponse vous est apportée sous un mois.',
          'Vous pouvez aussi introduire une réclamation auprès de la CNIL (www.cnil.fr).',
        ],
      },
    ],
  },
  {
    id: 'cookies',
    short: 'Cookies',
    title: 'Cookies et traceurs',
    sections: [
      {
        title: 'Ce que Lunaris utilise',
        body: [
          'Lunaris n’utilise aucun cookie publicitaire ni outil de mesure d’audience. Seuls des traceurs strictement nécessaires au fonctionnement sont déposés sur votre appareil :',
          {
            list: [
              'Session de connexion (Firebase Authentication), pour rester connecté.',
              'Réponses au questionnaire, gardées dans votre navigateur le temps de vous connecter.',
              'Service de notifications (service worker), uniquement si vous activez la notification du matin.',
            ],
          },
          'Ces traceurs sont exemptés de consentement, conformément aux recommandations de la CNIL : c’est pourquoi aucun bandeau ne vous est présenté.',
        ],
      },
      {
        title: 'Services tiers',
        body: [
          'Lors de la connexion avec Google ou du paiement, vous êtes dirigé vers les pages de Google ou de Stripe, qui appliquent leurs propres règles en matière de cookies.',
        ],
      },
      {
        title: 'Supprimer ces données',
        body: [
          'Vous pouvez effacer à tout moment les données du site depuis les réglages de votre navigateur. Vous serez alors déconnecté.',
        ],
      },
    ],
  },
]

export const DOC_IDS = DOCS.map((d) => d.id)
