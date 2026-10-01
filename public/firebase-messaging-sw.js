// Service worker des notifications du matin (Firebase Cloud Messaging).
// La configuration web Firebase (publique) est passée dans l'adresse d'enregistrement par l'app.
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js')

const params = new URLSearchParams(self.location.search)
firebase.initializeApp({
  apiKey: params.get('apiKey'),
  projectId: params.get('projectId'),
  appId: params.get('appId'),
  messagingSenderId: params.get('messagingSenderId'),
})
// Affiche les notifications reçues quand l'app est fermée ; un clic ouvre le lien envoyé par le serveur.
firebase.messaging()
