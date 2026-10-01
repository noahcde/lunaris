import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import BottomNav from './components/BottomNav'
import Paywall from './components/Paywall'
import ProfileSheet from './components/ProfileSheet'
import Home from './pages/Home'
import CalendarPage from './pages/CalendarPage'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Quiz from './pages/Quiz'
import Onboarding from './pages/Onboarding'
import { addDays } from './lib/astro'
import { bestStreak, currentStreak, dayKey } from './lib/streak'
import { getBackend } from './lib/backend'
import { loadQuiz, saveQuiz } from './lib/quiz'
import Logo from './components/Logo'

const PAGES = ['accueil', 'calendrier']

const TASK_COUNT = 3

// Retour depuis Stripe (paiement ou espace abonnement) : ?abonnement=… dans l'adresse.
const returningFromStripe = () => new URLSearchParams(window.location.search).has('abonnement')

const pageFromHash = () => {
  const hash = window.location.hash.replace('#', '')
  return PAGES.includes(hash) ? hash : 'accueil'
}

function Splash() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Logo size="lg" className="animate-pulse" />
    </div>
  )
}

export default function App() {
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])
  const todayKey = dayKey(today)

  const [backend, setBackend] = useState(null)
  const [user, setUser] = useState(undefined) // undefined = en cours, null = déconnecté
  const [data, setData] = useState(null) // document du compte : profil, série, tâches du jour
  const [editingProfile, setEditingProfile] = useState(false)
  const [entry, setEntry] = useState('landing') // avant connexion : landing | quiz | login
  const [quiz, setQuiz] = useState(loadQuiz) // réponses du questionnaire, en attente de connexion
  const [sheetOpen, setSheetOpen] = useState(false)

  const [page, setPage] = useState(pageFromHash)
  const [selectedDate, setSelectedDate] = useState(() => addDays(today, 1))
  const [daily, setDaily] = useState({ status: 'idle' }) // horoscope et tâches générés par l'IA
  const [billing, setBilling] = useState(null) // état de l'abonnement Stripe
  const [paywallOpen, setPaywallOpen] = useState(false)
  const stripeReturn = useRef(returningFromStripe())

  // Connexion : on écoute l'état d'authentification puis on charge le document du compte.
  useEffect(() => {
    let unsubscribe = () => {}
    let cancelled = false
    getBackend().then((b) => {
      if (cancelled) return
      setBackend(b)
      unsubscribe = b.onAuthChange(async (u) => {
        setData(null)
        setUser(u)
        if (u) setData((await b.loadUserData(u.uid).catch(() => null)) ?? {})
      })
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  // Horoscope et tâches du jour : générés une fois par jour côté serveur, puis relus depuis le cache.
  // Sans abonnement, le serveur ne renvoie rien et l'app affiche des textes floutés.
  const profileReady = Boolean(user && data?.birthDate)
  const loadDaily = useCallback(async () => {
    setDaily({ status: 'loading' })
    try {
      const result = await backend.getDaily(todayKey)
      setDaily(result.locked ? { status: 'locked' } : { status: 'ready', ...result })
    } catch {
      setDaily({ status: 'error' })
    }
  }, [backend, todayKey])

  // Relit l'abonnement puis le contenu du jour. refresh force la lecture chez Stripe (retour de paiement).
  const refreshAccess = useCallback(
    async (refresh = false) => {
      try {
        setBilling(await backend.getBilling(refresh))
      } catch {
        // Abonnement illisible : getDaily tranchera côté serveur.
      }
      await loadDaily()
    },
    [backend, loadDaily],
  )

  useEffect(() => {
    if (!profileReady) {
      setDaily({ status: 'idle' })
      setBilling(null)
      return
    }
    const refresh = stripeReturn.current
    if (refresh) {
      stripeReturn.current = false
      try {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.hash}`)
      } catch {
        // Adresse non modifiable dans certains environnements intégrés.
      }
    }
    refreshAccess(refresh)
  }, [profileReady, user?.uid, refreshAccess])

  // L'URL (#accueil, #calendrier) suit la page affichée, et le bouton retour fonctionne.
  useEffect(() => {
    const onHashChange = () => setPage(pageFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const save = useCallback(
    (partial) => {
      setData((prev) => ({ ...prev, ...partial }))
      backend?.saveUserData(user.uid, partial).catch(() => {
        // Échec réseau : l'état local reste à jour, la prochaine action ré-enregistrera.
      })
    },
    [backend, user],
  )

  const doneIds = data?.today?.date === todayKey ? data.today.doneIds : []
  const tasks = (daily.tasks ?? []).map((t, i) => ({ ...t, id: i + 1, done: doneIds.includes(i + 1) }))
  const history = data?.completedDays ?? []

  const streak = useMemo(() => {
    const set = new Set(history)
    return {
      completed: set,
      current: currentStreak(set, today),
      best: bestStreak(set),
      remaining: TASK_COUNT - doneIds.length,
    }
  }, [history, doneIds.length, today])

  // Cocher une tâche enregistre l'état du jour, et ajoute ou retire aujourd'hui de la série.
  const toggleTask = (id) => {
    const nextIds = doneIds.includes(id) ? doneIds.filter((x) => x !== id) : [...doneIds, id]
    const allDone = nextIds.length === TASK_COUNT
    const withoutToday = history.filter((k) => k !== todayKey)
    save({
      today: { date: todayKey, doneIds: nextIds },
      completedDays: allDone ? [...withoutToday, todayKey] : withoutToday,
    })
  }

  const navigate = (next) => {
    if (next !== page) {
      setPage(next)
      try {
        window.history.pushState(null, '', `#${next}`)
      } catch {
        // Certains environnements intégrés refusent l'historique : la navigation reste en mémoire.
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openCalendar = (date) => {
    setSelectedDate(date)
    navigate('calendrier')
  }

  // Le questionnaire rempli avant la connexion est enregistré sur le compte avec le profil.
  const saveProfile = async (profile) => {
    const { birthDate: _birthDate, ...answers } = quiz ?? {}
    const full = quiz && !data.quiz ? { ...profile, quiz: answers } : profile
    await backend.saveUserData(user.uid, full)
    setData((prev) => ({ ...prev, ...full }))
    setEditingProfile(false)
    if (quiz) {
      saveQuiz(null)
      setQuiz(null)
    }
  }

  const completeQuiz = (answers) => {
    saveQuiz(answers)
    setQuiz(answers)
    setEntry('login')
    window.scrollTo({ top: 0 })
  }

  // Paiement : redirection vers Stripe. Dans la démo, l'essai démarre directement (pas d'adresse renvoyée).
  const subscribe = async (plan) => {
    const url = await backend.startCheckout(plan)
    if (url) {
      window.location.assign(url)
      return
    }
    setPaywallOpen(false)
    await refreshAccess(true)
  }

  const manageBilling = async () => {
    const url = await backend.openBillingPortal().catch(() => null)
    if (url) {
      window.location.assign(url)
      return
    }
    setSheetOpen(false)
    await refreshAccess(true)
  }

  const openPaywall = () => {
    setSheetOpen(false)
    setPaywallOpen(true)
  }

  const signOut = async () => {
    setSheetOpen(false)
    setEntry('landing')
    await backend.signOut()
  }

  const shell = (children, wide = false) => (
    <div className="min-h-screen bg-black font-sans text-zinc-400">
      <div className={`mx-auto w-full px-5 ${wide ? 'max-w-md lg:max-w-6xl lg:px-10' : 'max-w-md'}`}>{children}</div>
    </div>
  )

  if (!backend || user === undefined || (user && !data)) return shell(<Splash />)
  if (!user) {
    const demo = backend.mode === 'demo'
    if (entry === 'quiz') return shell(<Quiz initial={quiz} onBack={() => setEntry('landing')} onComplete={completeQuiz} />)
    if (entry === 'login')
      return shell(
        <Login onSignIn={backend.signInWithGoogle} demo={demo} fromQuiz={Boolean(quiz)} onBack={() => setEntry('landing')} />,
      )
    return shell(
      <Landing
        demo={demo}
        onStart={() => {
          setEntry('quiz')
          window.scrollTo({ top: 0 })
        }}
        onSignIn={() => setEntry('login')}
      />,
      true,
    )
  }

  const profile = {
    firstName: data.firstName ?? user.givenName,
    lastName: data.lastName ?? user.familyName,
    birthDate: data.birthDate ?? quiz?.birthDate,
    birthTime: data.birthTime,
    birthTimeUnknown: data.birthTimeUnknown,
  }

  const locked = daily.status === 'locked' || billing?.active === false
  const trialAvailable = !billing?.trialUsed

  if (!data.birthDate || editingProfile) {
    return shell(
      <Onboarding
        key={editingProfile ? 'edit' : 'new'}
        initial={profile}
        onSubmit={saveProfile}
        onCancel={editingProfile ? () => setEditingProfile(false) : null}
      />,
    )
  }

  return (
    <div className="min-h-screen bg-black font-sans text-zinc-400">
      <main key={page} className="mx-auto flex w-full max-w-md animate-page-in flex-col gap-7 px-5 pb-32 lg:max-w-5xl lg:px-10">
        {page === 'accueil' ? (
          <Home
            today={today}
            user={user}
            profile={profile}
            onOpenProfile={() => setSheetOpen(true)}
            daily={daily}
            onRetryDaily={loadDaily}
            tasks={tasks}
            onToggleTask={toggleTask}
            streak={streak}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onOpenCalendar={openCalendar}
            locked={locked}
            trialAvailable={trialAvailable}
            onUnlock={openPaywall}
          />
        ) : (
          <CalendarPage today={today} selectedDate={selectedDate} onSelectDate={setSelectedDate} locked={locked} />
        )}
      </main>
      <BottomNav active={page} onNavigate={navigate} />
      <ProfileSheet
        open={sheetOpen}
        user={user}
        profile={profile}
        streak={streak}
        billing={billing}
        demo={backend.mode === 'demo'}
        onClose={() => setSheetOpen(false)}
        onEdit={() => {
          setSheetOpen(false)
          setEditingProfile(true)
        }}
        onSubscribe={openPaywall}
        onManageBilling={manageBilling}
        onSignOut={signOut}
        onResetDemo={() => {
          setSheetOpen(false)
          setEntry('landing')
          backend.resetDemo()
        }}
      />
      <Paywall
        open={paywallOpen}
        trialAvailable={trialAvailable}
        onClose={() => setPaywallOpen(false)}
        onSubscribe={subscribe}
      />
    </div>
  )
}
