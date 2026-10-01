# Aligned.

Application web mobile-first (React + Tailwind CSS + lucide-react, bundlée avec Vite).

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # sortie dans dist/
```

## Structure

- `src/App.jsx` : connexion, navigation (#accueil / #calendrier) et état du compte.
- `src/pages/Login.jsx` : connexion avec Google.
- `src/pages/Onboarding.jsx` : prénom, nom, date et heure de naissance (aussi utilisé pour modifier le profil).
- `src/pages/Home.jsx` et `src/pages/CalendarPage.jsx` : les deux pages de l'app.
- `src/components/ProfileSheet.jsx` : profil, modification, déconnexion (ouvert via l'avatar).
- `src/lib/backend/` : `firebase.js` (vrai compte) ou `demo.js` (connexion simulée, données dans le navigateur).
- `functions/` : Cloud Function `getDaily` qui génère l'horoscope et les 3 tâches du jour avec OpenAI (la clé API reste côté serveur).
- `src/lib/astro.js` et `src/lib/streak.js` : phase lunaire, jours fastes, signe solaire, calcul de la série.

## Activer la vraie connexion Google (Firebase)

Sans configuration, l'app tourne en **mode démo**. Pour de vrais comptes :

1. Créez un projet sur https://console.firebase.google.com et ajoutez une **application Web**.
2. *Authentication > Sign-in method* : activez **Google**. Dans *Settings > Authorized domains*, ajoutez le domaine où l'app sera hébergée.
3. *Firestore Database* : créez la base, puis collez le contenu de `firestore.rules` dans l'onglet *Règles* (chaque utilisateur ne lit et n'écrit que son propre document).
4. Copiez `.env.example` en `.env.local` et remplissez les 4 valeurs de la config de l'application Web.
5. Relancez `npm run dev`.

Données enregistrées par compte, dans `users/{uid}` : `firstName`, `lastName`, `birthDate`, `birthTime`, `birthTimeUnknown`, `completedDays` (jours où les 3 tâches ont été faites) et `today` (tâches cochées du jour).

## Activer l'IA (horoscope et tâches générés par OpenAI)

La clé API OpenAI ne doit jamais être dans l'app (elle serait visible par tous les utilisateurs). Elle vit dans un secret Firebase, lu uniquement par la Cloud Function `functions/index.js`. Le guide pas à pas détaillé est ici : https://claude.ai/artifact/8FrqpRsaVqt1BGasz1dAgE

1. Le projet Firebase doit être en formule **Blaze** (obligatoire pour les Cloud Functions et les appels sortants).
2. Créez sur platform.openai.com un projet « Aligned » avec un budget mensuel, et une clé dans ce projet.
3. `npx firebase-tools@latest login`, puis `npx firebase-tools@latest use --add`.
4. Enregistrez la clé (saisie masquée) : `npx firebase-tools@latest functions:secrets:set OPENAI_API_KEY`
5. `npm install`, `npm install --prefix functions`, `npm run build`, puis `npx firebase-tools@latest deploy`.

Fonctionnement : à la première ouverture de la journée, la fonction lit le profil (signe solaire, heure de naissance), la phase lunaire et le statut du jour, demande au modèle OpenAI un horoscope et 3 tâches au format JSON validé, puis met le résultat en cache dans `users/{uid}/daily/{date}`. Il y a donc au plus un appel à l'IA par utilisateur et par jour. Le texte du prompt est dans `functions/daily.js`.

Le modèle est `gpt-5.4-mini` par défaut. Pour en changer sans modifier le code, créez `functions/.env` avec une ligne `OPENAI_MODEL=nom-du-modele`, puis redéployez.
