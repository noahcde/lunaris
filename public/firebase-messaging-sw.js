// Service worker des notifications du matin (Firebase Cloud Messaging).
// On affiche nous-mêmes chaque notification reçue, que l'app soit ouverte ou fermée :
// sur iPhone, une notification reçue sans être affichée peut faire couper l'abonnement par Safari.

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('push', (event) => {
  let payload = {}
  try {
    payload = event.data?.json() ?? {}
  } catch {
    // Contenu illisible : on affiche quand même un rappel générique.
  }
  const n = payload.notification ?? {}
  const link = payload.fcmOptions?.link ?? n.click_action ?? '/#accueil'
  // L'heure de réception est notée : l'app s'en sert pour repérer une notification envoyée mais jamais reçue.
  const received = caches
    .open('lunaris-push')
    .then((cache) => cache.put('/derniere-notification', new Response(String(Date.now()))))
    .catch(() => {})
  event.waitUntil(
    Promise.all([
      self.registration.showNotification(n.title ?? 'Lunaris', {
        body: n.body ?? 'Votre horoscope du jour est prêt ✨',
        icon: n.icon ?? '/lunaris-192.png',
        badge: '/lunaris-192.png',
        tag: 'lunaris-matin',
        data: { link },
      }),
      received,
    ]),
  )
})

// Un toucher sur la notification ouvre Lunaris (ou ramène l'onglet déjà ouvert au premier plan).
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = new URL(event.notification.data?.link ?? '/#accueil', self.location.origin).href
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const open = windows.find((w) => new URL(w.url).origin === self.location.origin)
      if (open) return open.focus().then((w) => w?.navigate?.(target)).catch(() => {})
      return self.clients.openWindow(target)
    }),
  )
})
