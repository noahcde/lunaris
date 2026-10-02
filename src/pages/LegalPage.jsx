import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import Logo from '../components/Logo'
import { cx } from '../lib/astro'
import { DOCS, EDITEUR, SITE, UPDATED } from '../content/legal'
import { analyticsAvailable, resetConsent } from '../lib/consent'

const LABELS = {
  nom: 'nom ou société',
  statut: 'statut juridique',
  adresse: 'adresse',
  siret: 'SIRET',
  directeur: 'directeur de la publication',
  mediateur: 'médiateur de la consommation',
}

// Remplace {nom}, {email}… par les informations de l'éditeur ; un champ vide reste visible en couleur.
function fill(text) {
  return text.split(/(\{\w+\})/).map((part, i) => {
    const key = part.match(/^\{(\w+)\}$/)?.[1]
    if (!key) return part
    if (key === 'site') return SITE
    const value = EDITEUR[key]
    if (value) return value
    return (
      <span key={i} className="rounded bg-amber-500/15 px-1 text-amber-300">
        [à compléter : {LABELS[key] ?? key}]
      </span>
    )
  })
}

function Block({ item }) {
  if (typeof item === 'string') return <p className="text-sm leading-relaxed text-zinc-400">{fill(item)}</p>
  return (
    <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-zinc-400 marker:text-zinc-600">
      {item.list.map((li, i) => (
        <li key={i}>{fill(li)}</li>
      ))}
    </ul>
  )
}

export function LegalLinks({ className }) {
  return (
    <nav aria-label="Informations légales" className={cx('flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs text-zinc-600', className)}>
      {DOCS.map((d) => (
        <a key={d.id} href={`#${d.id}`} className="transition-colors duration-300 hover:text-zinc-300">
          {d.short}
        </a>
      ))}
      {analyticsAvailable && (
        <button type="button" onClick={resetConsent} className="transition-colors duration-300 hover:text-zinc-300">
          Gérer les cookies
        </button>
      )}
    </nav>
  )
}

export default function LegalPage({ docId, onClose }) {
  const doc = DOCS.find((d) => d.id === docId) ?? DOCS[0]

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [doc.id])

  return (
    <div className="animate-page-in pb-16 pt-6 lg:mx-auto lg:max-w-3xl lg:pt-10">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-lg py-1 text-sm text-zinc-400 transition-colors duration-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>
        <Logo size="sm" />
      </div>

      <nav aria-label="Documents" className="-mx-5 mt-6 flex gap-1.5 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
        {DOCS.map((d) => (
          <a
            key={d.id}
            href={`#${d.id}`}
            aria-current={d.id === doc.id ? 'page' : undefined}
            onClick={(e) => {
              // Changer d'onglet ne s'empile pas dans l'historique : « Retour » ramène à l'app.
              e.preventDefault()
              window.location.replace(`#${d.id}`)
            }}
            className={cx(
              'shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-300 ease-in-out',
              d.id === doc.id ? 'border-zinc-800 bg-zinc-900 text-white' : 'border-zinc-900 text-zinc-500 hover:text-zinc-300',
            )}
          >
            {d.short}
          </a>
        ))}
      </nav>

      <h1 className="mt-6 text-2xl font-bold tracking-tight text-white">{doc.title}</h1>
      <p className="mt-1 text-xs text-zinc-500">Dernière mise à jour : {UPDATED}</p>

      <div className="mt-6 flex flex-col gap-6">
        {doc.sections.map((s) => (
          <section key={s.title} className="flex flex-col gap-2.5">
            <h2 className="text-[15px] font-semibold text-white">{s.title}</h2>
            {s.body.map((item, i) => (
              <Block key={i} item={item} />
            ))}
          </section>
        ))}
      </div>

      {doc.id === 'cookies' && analyticsAvailable && (
        <button
          type="button"
          onClick={resetConsent}
          className="mt-8 rounded-xl border border-zinc-800 px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 ease-in-out hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          Modifier mon choix sur les cookies
        </button>
      )}
    </div>
  )
}
