// Génère, après `vite build`, les pages publiques lues par Google : les 12 signes et le calendrier lunaire.
// Ce sont de vraies pages HTML (sans JavaScript), servies par Firebase avant l'application.
// SEO_PREVIEW=1 : liens relatifs, pour un aperçu hors du site.

import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, posix, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { lunations } from './moon.mjs'
import { SIGNES } from '../../src/content/seo/signes.js'
import { FAQ_LUNE, LUNE_EN, PHASES } from '../../src/content/seo/lunes.js'
import { DEBUTS_SIGNES, FAQ_LUNE_AUJOURDHUI, FAQ_MON_SIGNE, PHASES_LUNE } from '../../src/content/seo/outils.js'
import { COMPAT as C1 } from '../../src/content/seo/compat-1.js'
import { COMPAT as C2 } from '../../src/content/seo/compat-2.js'
import { COMPAT as C3 } from '../../src/content/seo/compat-3.js'
import { COMPAT as C4 } from '../../src/content/seo/compat-4.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..')
const OUT = process.env.SEO_OUT ?? join(ROOT, 'dist')
const PREVIEW = process.env.SEO_PREVIEW === '1'
const SITE = 'https://lunaris-app.fr'
const TZ = 'Europe/Paris'
const YEARS = [2026, 2027, 2028]
const today = new Date()

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const plain = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
const SIGN = Object.fromEntries(SIGNES.map((s) => [s.slug, s]))
const COMPAT = [...C1, ...C2, ...C3, ...C4]
const ORDER = SIGNES.map((s) => s.slug)
// Adresse d'un duo, toujours dans l'ordre du zodiaque : /compatibilite/belier-scorpion/
const compatPath = (x, y) => {
  const [a, b] = ORDER.indexOf(x) <= ORDER.indexOf(y) ? [x, y] : [y, x]
  return `/compatibilite/${a}-${b}/`
}
const duo = (a, b) => (a === b ? `Deux ${SIGN[a].pluriel}` : `${SIGN[a].nom} et ${SIGN[b].nom}`)
// Pluriels pour « deux Lions », « deux Gémeaux »…
for (const s of SIGNES) s.pluriel = /[sx]$/.test(s.nom) ? s.nom : `${s.nom}s`

// ---------- Dates ----------

const fmt = (date, opts) => new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, ...opts }).format(date)
const dayMonthYear = (d) => fmt(d, { day: 'numeric', month: 'long', year: 'numeric' }).replace(/^1 /, '1er ')
const weekday = (d) => fmt(d, { weekday: 'long' })
const hourMinute = (d) => fmt(d, { hour: '2-digit', minute: '2-digit' }).replace(':', 'h')
const monthName = (d) => fmt(d, { month: 'long' })
const yearOf = (d) => Number(fmt(d, { year: 'numeric' }))

const events = lunations(new Date(Date.UTC(YEARS[0], 0, 1) - 3600000), new Date(Date.UTC(YEARS.at(-1), 11, 31, 23)))
  .filter((e) => YEARS.includes(yearOf(e.date)))
  .map((e) => ({ ...e, phase: PHASES[e.type], signe: SIGN[e.sign] }))

// Adresse de chaque lune : /calendrier-lunaire/pleine-lune-octobre-2026/ (avec le jour s'il y en a deux dans le mois).
const monthKey = (e) => `${e.type}-${monthName(e.date)}-${yearOf(e.date)}`
const perMonth = {}
for (const e of events) perMonth[monthKey(e)] = (perMonth[monthKey(e)] ?? 0) + 1
for (const e of events) {
  const day = perMonth[monthKey(e)] > 1 ? `${fmt(e.date, { day: 'numeric' })}-` : ''
  e.path = `/calendrier-lunaire/${e.type}-lune-${day}${plain(monthName(e.date))}-${yearOf(e.date)}/`
  e.label = `${e.phase.nom} du ${dayMonthYear(e.date)}`
}

// Page de toutes les nouvelles (ou pleines) lunes d'une année : /calendrier-lunaire/nouvelle-lune-2027/
const hubPath = (type, y) => `/calendrier-lunaire/${type}-lune-${y}/`
const plural = (nom) => nom.toLowerCase().replace(/^(\w+) lune$/, '$1s lunes')
const yearList = (ys) => (ys.length > 1 ? `${ys.slice(0, -1).join(', ')} et ${ys.at(-1)}` : `${ys[0]}`)

// ---------- Gabarit ----------

function href(from, to) {
  if (/^https?:/.test(to)) return to
  if (to === '/' || to.startsWith('/#')) return PREVIEW ? `${SITE}${to}` : to
  if (!PREVIEW) return to
  const [target, hash] = to.split('#')
  const rel = posix.relative(posix.dirname(`${from}index.html`), target.endsWith('/') ? `${target}index.html` : target)
  return (rel || 'index.html') + (hash ? `#${hash}` : '')
}

const LOGO =
  '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="#16141f"/><circle cx="16" cy="11" r="3.6" fill="none" stroke="#5b74e8" stroke-width="1.4"/><circle cx="16" cy="20.5" r="3.8" fill="#7d6be6"/></svg>'

const LEGAL = [
  ['mentions-legales', 'Mentions légales'],
  ['cgu', 'CGU'],
  ['cgv', 'CGV'],
  ['confidentialite', 'Confidentialité'],
  ['cookies', 'Cookies'],
]

function page({ path, title, description, crumbs, body, jsonLd = [], section }) {
  const h = (to) => esc(href(path, to))
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map(([name, to], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE}${to}` })),
  }
  const ld = [breadcrumb, ...jsonLd].map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n')
  const nav = (to, label, key) => `<a href="${h(to)}"${section === key ? ' aria-current="page"' : ''}>${label}</a>`
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${SITE}${path}">
<meta name="theme-color" content="#000000">
<link rel="icon" type="image/svg+xml" href="${h('/favicon.svg')}">
<link rel="apple-touch-icon" href="${h('/lunaris-apple-touch-icon.png')}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Lunaris">
<meta property="og:locale" content="fr_FR">
<meta property="og:url" content="${SITE}${path}">
<meta property="og:title" content="${esc(title.replace(/ \| Lunaris$/, ''))}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${SITE}/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="${h('/seo/style.css')}">
${ld}
</head>
<body>
<div class="wrap">
<header class="top">
<a class="brand" href="${h('/')}">${LOGO}Lunaris</a>
<nav class="main" aria-label="Rubriques">${nav('/signes/', 'Signes', 'signes')}${nav('/compatibilite/', 'Compatibilité', 'compat')}${nav('/calendrier-lunaire/', 'Calendrier<span class="long"> lunaire</span>', 'lune')}</nav>
</header>
<p class="crumbs">${crumbs.map(([name, to], i) => (i === crumbs.length - 1 ? esc(name) : `<a href="${h(to)}">${esc(name)}</a>`)).join(' › ')}</p>
<main>
${body(h)}
<aside class="cta">
<p class="t">Votre horoscope personnalisé, chaque matin.</p>
<p>Lunaris croise votre signe, la phase de la Lune et le climat astral du jour pour vous proposer un horoscope personnel et 3 actions concrètes. 5 questions, moins de 2 minutes.</p>
<a class="btn" href="${h('/')}">Recevoir mon horoscope personnalisé</a>
</aside>
</main>
<footer class="bottom">
<nav aria-label="Pages">${[...SIGNES.map((s) => [`/signes/${s.slug}/`, s.nom]), ['/compatibilite/', 'Compatibilité'], ['/calendrier-lunaire/', 'Calendrier lunaire'], ['/lune-aujourdhui/', 'Lune aujourd’hui'], ['/quel-est-mon-signe/', 'Quel est mon signe ?']].map(([to, l]) => `<a href="${h(to)}">${esc(l)}</a>`).join('')}</nav>
<nav aria-label="Informations légales">${LEGAL.map(([id, l]) => `<a href="${h(`/#${id}`)}">${l}</a>`).join('')}</nav>
<p>© ${today.getFullYear()} Lunaris</p>
</footer>
</div>
</body>
</html>
`
}

const paras = (list = []) => list.map((p) => `<p>${esc(p)}</p>`).join('\n')
const faqHtml = (faq) => faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n')
const faqLd = (faq) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
})
const upcoming = events.filter((e) => e.date >= today)

// ---------- Pages ----------

const pages = []

pages.push({
  path: '/signes/',
  section: 'signes',
  title: 'Les 12 signes du zodiaque : dates, éléments et personnalité | Lunaris',
  description:
    'Les 12 signes astrologiques avec leurs dates, leur élément et leur planète. Découvrez la personnalité, les forces et les conseils d’organisation de votre signe.',
  crumbs: [['Accueil', '/'], ['Signes du zodiaque', '/signes/']],
  body: (h) => `
<h1>Les 12 signes du zodiaque</h1>
<p class="lead">Votre signe solaire dépend de la position du Soleil le jour de votre naissance. Choisissez le vôtre pour découvrir sa personnalité, ses forces, sa façon de travailler et la manière dont il peut suivre les phases de la Lune.</p>
<div class="grid">
${SIGNES.map((s) => `<a class="card" href="${h(`/signes/${s.slug}/`)}"><span class="sym" aria-hidden="true">${s.symbole}\uFE0E</span><strong>${esc(s.nom)}</strong><span>${esc(s.dates)}</span><span>${esc(s.element)} · ${esc(s.planete)}</span></a>`).join('\n')}
</div>
<h2>Comment connaître son signe ?</h2>
<p>Repérez votre date de naissance dans les dates ci-dessus, ou utilisez le <a href="${h('/quel-est-mon-signe/')}">calcul du signe astrologique</a>. Si vous êtes né à la limite entre deux signes, le signe exact dépend de l’heure et du lieu de naissance : Lunaris fait ce calcul pour vous à partir de votre date de naissance.</p>
<h2>Les quatre éléments</h2>
<ul class="list">
<li><strong>Feu</strong> (Bélier, Lion, Sagittaire) : l’élan, l’enthousiasme, l’action.</li>
<li><strong>Terre</strong> (Taureau, Vierge, Capricorne) : le concret, la patience, la construction.</li>
<li><strong>Air</strong> (Gémeaux, Balance, Verseau) : les idées, l’échange, le lien.</li>
<li><strong>Eau</strong> (Cancer, Scorpion, Poissons) : l’émotion, l’intuition, la profondeur.</li>
</ul>`,
})

for (const s of SIGNES) {
  const path = `/signes/${s.slug}/`
  const next = ['nouvelle', 'pleine'].map((t) => upcoming.find((e) => e.sign === s.slug && e.type === t)).filter(Boolean)
  const i = SIGNES.indexOf(s)
  const prev = SIGNES[(i + 11) % 12]
  const after = SIGNES[(i + 1) % 12]
  pages.push({
    path,
    section: 'signes',
    title: s.titreSeo,
    description: s.description,
    crumbs: [['Accueil', '/'], ['Signes du zodiaque', '/signes/'], [s.nom, path]],
    jsonLd: [faqLd(s.faq)],
    body: (h) => `
<h1><span aria-hidden="true">${s.symbole}\uFE0E</span> ${esc(s.nom)}</h1>
<p class="lead">${esc(s.intro)}</p>
<dl class="facts">
<div><dt>Dates</dt><dd>${esc(s.dates)}</dd></div>
<div><dt>Élément</dt><dd>${esc(s.element)}</dd></div>
<div><dt>Mode</dt><dd>${esc(s.modalite)}</dd></div>
<div><dt>Planète</dt><dd>${esc(s.planete)}</dd></div>
</dl>
<p style="margin-top:14px">Mots-clés : ${s.motsCles.map(esc).join(', ')}</p>
${s.sections
  .map(
    (sec) => `<h2>${esc(sec.titre)}</h2>
${sec.liste ? `<ul class="list">${sec.liste.map((li) => `<li>${esc(li)}</li>`).join('')}</ul>` : ''}
${paras(sec.paragraphes)}`,
  )
  .join('\n')}
${
  next.length
    ? `<h2>Prochaines lunes en ${esc(s.nom)}</h2>
<ul class="list">${next.map((e) => `<li><a href="${h(e.path)}">${esc(e.label)}</a> à ${hourMinute(e.date)} (heure de Paris) : ${esc(LUNE_EN[s.slug][e.type].theme.toLowerCase())}</li>`).join('')}</ul>`
    : ''
}
<h2>Compatibilité ${esc(s.nom.match(/^[AEIOUÉ]/) ? `de l’${s.nom}` : s.du.replace(/^le /, 'du ').replace(/^les /, 'des ').replace(/^la /, 'de la '))} avec chaque signe</h2>
<p>${SIGNES.map((o) => `<a href="${h(compatPath(s.slug, o.slug))}">${esc(o.slug === s.slug ? `${s.nom} et ${s.nom}` : `${s.nom} et ${o.nom}`)}</a>`).join(' · ')}</p>
<h2>Questions fréquentes</h2>
${faqHtml(s.faq)}
<div class="pager"><a href="${h(`/signes/${prev.slug}/`)}">← ${esc(prev.nom)}</a><a href="${h(`/signes/${after.slug}/`)}">${esc(after.nom)} →</a></div>`,
  })
}

const nextEvent = upcoming[0]
pages.push({
  path: '/calendrier-lunaire/',
  section: 'lune',
  title: `Calendrier lunaire ${yearList(YEARS)} : pleines et nouvelles lunes | Lunaris`,
  description: `Toutes les dates et heures des pleines lunes et nouvelles lunes de ${yearList(YEARS)} (heure de Paris), le signe où elles tombent et comment en profiter.`,
  crumbs: [['Accueil', '/'], ['Calendrier lunaire', '/calendrier-lunaire/']],
  jsonLd: [faqLd(FAQ_LUNE)],
  body: (h) => `
<h1>Calendrier lunaire ${yearList(YEARS)}</h1>
<p class="lead">Les dates et heures exactes (heure de Paris) de chaque nouvelle lune et pleine lune, le signe du zodiaque dans lequel elle se forme, et des idées concrètes pour en tirer parti.</p>
<p>Et ce soir ? Voir la <a href="${h('/lune-aujourdhui/')}">phase de la Lune aujourd’hui</a>.</p>
${nextEvent ? `<p>Prochaine lune : <a href="${h(nextEvent.path)}">${esc(nextEvent.label)} en ${esc(nextEvent.signe.nom)}</a>, à ${hourMinute(nextEvent.date)}.</p>` : ''}
${YEARS.map(
  (y) => `<h2>Pleines et nouvelles lunes ${y}</h2>
<p>Voir seulement les <a href="${h(hubPath('nouvelle', y))}">nouvelles lunes ${y}</a> ou les <a href="${h(hubPath('pleine', y))}">pleines lunes ${y}</a>.</p>
<table>
<thead><tr><th>Date</th><th>Heure</th><th>Signe</th></tr></thead>
<tbody>
${events
  .filter((e) => yearOf(e.date) === y)
  .map(
    (e) =>
      `<tr data-t="${e.date.getTime()}"><td><span class="phase-dot dot-${e.type}" aria-hidden="true"></span><a href="${h(e.path)}">${esc(e.phase.nom)}</a> · ${esc(fmt(e.date, { weekday: 'short', day: 'numeric', month: 'short' }))}</td><td>${hourMinute(e.date)}</td><td>${esc(e.signe.nom)}</td></tr>`,
  )
  .join('\n')}
</tbody>
</table>`,
).join('\n')}
<h2>${esc(PHASES.nouvelle.nom)}</h2>
<p>${esc(PHASES.nouvelle.intro)}</p>
<h2>${esc(PHASES.pleine.nom)}</h2>
<p>${esc(PHASES.pleine.intro)}</p>
<h2>Questions fréquentes</h2>
${faqHtml(FAQ_LUNE)}
<script>
// Grise les lunes passées et signale la prochaine (le tableau reste complet sans JavaScript).
(function(){var now=Date.now(),done=false;document.querySelectorAll('tr[data-t]').forEach(function(r){if(+r.dataset.t<now){r.className='past'}else if(!done){done=true;r.className='next';r.cells[0].insertAdjacentHTML('beforeend','<span class="badge">Prochaine</span>')}})})()
</script>`,
})

events.forEach((e, i) => {
  const s = e.signe
  const txt = LUNE_EN[e.sign][e.type]
  const prev = events[i - 1]
  const next = events[i + 1]
  const title = `${e.phase.nom} en ${s.nom} ${monthName(e.date)} ${yearOf(e.date)} : date, heure et sens | Lunaris`
  pages.push({
    path: e.path,
    section: 'lune',
    title,
    description: `${e.phase.nom} le ${weekday(e.date)} ${dayMonthYear(e.date)} à ${hourMinute(e.date)} (heure de Paris), en ${s.nom}. Ce qu’elle symbolise et 3 actions concrètes pour en profiter.`,
    crumbs: [['Accueil', '/'], ['Calendrier lunaire', '/calendrier-lunaire/'], [e.label, e.path]],
    body: (h) => `
<h1>${esc(e.label)} en ${esc(s.nom)}</h1>
<p class="lead">${esc(txt.theme)}.</p>
<dl class="facts">
<div><dt>Date</dt><dd>${esc(weekday(e.date))} ${esc(dayMonthYear(e.date))}</dd></div>
<div><dt>Heure (Paris)</dt><dd>${hourMinute(e.date)}</dd></div>
<div><dt>Signe</dt><dd><a href="${h(`/signes/${s.slug}/`)}">${s.symbole}\uFE0E ${esc(s.nom)}</a></dd></div>
<div><dt>Phase</dt><dd>${esc(e.phase.nom)}</dd></div>
</dl>
<h2>Ce que symbolise cette ${esc(e.phase.nom.toLowerCase())} en ${esc(s.nom)}</h2>
${paras(txt.texte)}
<h2>3 actions concrètes autour du ${esc(dayMonthYear(e.date))}</h2>
<ol class="actions">${txt.actions.map((a) => `<li>${esc(a)}</li>`).join('')}</ol>
<h2>${e.type === 'pleine' ? 'La pleine lune' : 'La nouvelle lune'}, c’est quoi ?</h2>
<p>${esc(e.phase.intro)}</p>
<ul class="list">${e.phase.conseils.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
<div class="pager">${prev ? `<a href="${h(prev.path)}">← ${esc(prev.label)}</a>` : '<span></span>'}${next ? `<a href="${h(next.path)}">${esc(next.label)} →</a>` : '<span></span>'}</div>
<p style="margin-top:20px"><a href="${h(hubPath(e.type, yearOf(e.date)))}">Toutes les ${esc(plural(e.phase.nom))} ${yearOf(e.date)}</a> · <a href="${h('/calendrier-lunaire/')}">Tout le calendrier lunaire</a></p>`,
  })
})

// Une page par type de lune et par année, pour les recherches « nouvelle lune 2027 », « pleine lune 2026 »…
for (const y of YEARS) {
  for (const type of ['nouvelle', 'pleine']) {
    const ph = PHASES[type]
    const list = events.filter((e) => e.type === type && yearOf(e.date) === y)
    const nom = ph.nom.toLowerCase()
    const noms = plural(ph.nom)
    const other = type === 'nouvelle' ? 'pleine' : 'nouvelle'
    const months = {}
    for (const e of list) (months[monthName(e.date)] ??= []).push(e)
    const doubles = Object.entries(months).filter(([, l]) => l.length > 1)
    const faq = [
      {
        q: `Combien y a-t-il de ${noms} en ${y} ?`,
        a: `On compte ${list.length} ${noms} en ${y}, de la première le ${dayMonthYear(list[0].date)} en ${list[0].signe.nom} à la dernière le ${dayMonthYear(list.at(-1).date)} en ${list.at(-1).signe.nom}.${doubles.length ? ` ${doubles.map(([m]) => (/^[aeiou]/.test(m) ? `Le mois d’${m}` : `Le mois de ${m}`)).join(' et ')} en compte deux.` : ''}`,
      },
      ...list.map((e) => ({
        q: `Quand est la ${nom} de ${monthName(e.date)} ${y}${months[monthName(e.date)].length > 1 ? ` (${fmt(e.date, { day: 'numeric' })})` : ''} ?`,
        a: `La ${nom} a lieu le ${weekday(e.date)} ${dayMonthYear(e.date)} à ${hourMinute(e.date)} (heure de Paris), en ${e.signe.nom}. ${LUNE_EN[e.sign][type].theme}.`,
      })),
    ]
    pages.push({
      path: hubPath(type, y),
      section: 'lune',
      title: `${ph.nom} ${y} : toutes les dates, heures et signes | Lunaris`,
      description: `Les ${list.length} ${noms} de ${y} : date, heure exacte (Paris) et signe de chacune, de ${monthName(list[0].date)} à ${monthName(list.at(-1).date)}, avec leur sens et des idées pour en profiter.`,
      crumbs: [['Accueil', '/'], ['Calendrier lunaire', '/calendrier-lunaire/'], [`${ph.nom} ${y}`, hubPath(type, y)]],
      jsonLd: [faqLd(faq)],
      body: (h) => `
<h1>${esc(ph.nom)} ${y} : toutes les dates</h1>
<p class="lead">Les ${list.length} ${esc(noms)} de ${y}, avec la date, l’heure exacte (heure de Paris) et le signe du zodiaque où chacune se forme. Cliquez sur une date pour lire son sens et 3 actions concrètes.</p>
<table>
<thead><tr><th>Date</th><th>Heure</th><th>Signe</th></tr></thead>
<tbody>
${list
  .map(
    (e) =>
      `<tr data-t="${e.date.getTime()}"><td><span class="phase-dot dot-${type}" aria-hidden="true"></span><a href="${h(e.path)}">${esc(fmt(e.date, { weekday: 'long', day: 'numeric', month: 'long' }))}</a></td><td>${hourMinute(e.date)}</td><td><a href="${h(`/signes/${e.signe.slug}/`)}">${esc(e.signe.nom)}</a></td></tr>`,
  )
  .join('\n')}
</tbody>
</table>
<h2>Le thème de chaque ${esc(nom)} ${y}</h2>
<ul class="list">${list.map((e) => `<li><a href="${h(e.path)}">${esc(ph.nom)} en ${esc(e.signe.nom)} (${esc(monthName(e.date))})</a> : ${esc(LUNE_EN[e.sign][type].theme.toLowerCase())}.</li>`).join('')}</ul>
<h2>La ${esc(nom)}, c’est quoi ?</h2>
<p>${esc(ph.intro)}</p>
<ul class="list">${ph.conseils.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
<h2>Questions fréquentes</h2>
${faqHtml(faq)}
<p style="margin-top:20px">Voir aussi : ${[
  [hubPath(other, y), `${PHASES[other].nom} ${y}`],
  ...YEARS.filter((o) => o !== y).map((o) => [hubPath(type, o), `${ph.nom} ${o}`]),
  ['/calendrier-lunaire/', 'tout le calendrier lunaire'],
]
  .map(([to, l]) => `<a href="${h(to)}">${esc(l)}</a>`)
  .join(' · ')}</p>
<script>
(function(){var now=Date.now(),done=false;document.querySelectorAll('tr[data-t]').forEach(function(r){if(+r.dataset.t<now){r.className='past'}else if(!done){done=true;r.className='next';r.cells[0].insertAdjacentHTML('beforeend','<span class="badge">Prochaine</span>')}})})()
</script>`,
    })
  }
}

pages.push({
  path: '/compatibilite/',
  section: 'compat',
  title: 'Compatibilité astrologique : les 78 duos de signes | Lunaris',
  description:
    'Compatibilité amoureuse, amicale et professionnelle entre les 12 signes du zodiaque : forces, points de friction et conseils concrets pour chaque duo.',
  crumbs: [['Accueil', '/'], ['Compatibilité', '/compatibilite/']],
  body: (h) => `
<h1>Compatibilité entre les signes</h1>
<p class="lead">Comment deux signes s’accordent en amour, en amitié et au travail, selon la tradition astrologique. Choisissez votre signe, puis celui de l’autre personne.</p>
${SIGNES.map(
  (s) => `<h2 id="${s.slug}"><span aria-hidden="true">${s.symbole}\uFE0E</span> ${esc(s.nom)} avec…</h2>
<p>${SIGNES.map((o) => `<a href="${h(compatPath(s.slug, o.slug))}">${esc(o.nom)}</a>`).join(' · ')}</p>`,
).join('\n')}
<h2>Comment lire une compatibilité ?</h2>
<p>L’astrologie compare d’abord les éléments : deux signes du même élément se comprennent vite, le Feu s’accorde avec l’Air et la Terre avec l’Eau. Les signes opposés s’attirent fort mais doivent apprendre à composer. Aucune combinaison n’est interdite : une compatibilité décrit des tendances, et la relation dépend surtout de la façon dont chacun s’en sert.</p>`,
})

for (const c of COMPAT) {
  const A = SIGN[c.a]
  const B = SIGN[c.b]
  const path = compatPath(c.a, c.b)
  const name = duo(c.a, c.b)
  pages.push({
    path,
    section: 'compat',
    title: c.titreSeo,
    description: c.description,
    crumbs: [['Accueil', '/'], ['Compatibilité', '/compatibilite/'], [name, path]],
    jsonLd: [faqLd(c.faq)],
    body: (h) => `
<h1><span aria-hidden="true">${A.slug === B.slug ? `${A.symbole}\uFE0E` : `${A.symbole}\uFE0E ${B.symbole}\uFE0E`}</span> ${esc(name)} : compatibilité</h1>
<p class="lead">${esc(c.resume)}</p>
<dl class="facts">
<div><dt>Affinité</dt><dd>${esc(c.affinite)}</dd></div>
<div><dt>Éléments</dt><dd>${esc(A.element === B.element ? A.element : `${A.element} et ${B.element}`)}</dd></div>
<div><dt>Modes</dt><dd>${esc(A.modalite === B.modalite ? A.modalite : `${A.modalite} et ${B.modalite.toLowerCase()}`)}</dd></div>
<div><dt>Planètes</dt><dd>${esc(A.slug === B.slug ? A.planete : `${A.planete}, ${B.planete}`)}</dd></div>
</dl>
${c.sections.map((sec) => `<h2>${esc(sec.titre)}</h2>\n${paras(sec.paragraphes)}`).join('\n')}
<h2>3 conseils pour ce duo</h2>
<ol class="actions">${c.conseils.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
<h2>Questions fréquentes</h2>
${faqHtml(c.faq)}
<h2>En savoir plus</h2>
<p><a href="${h(`/signes/${A.slug}/`)}">Le signe ${esc(A.nom)}</a>${A.slug === B.slug ? '' : ` · <a href="${h(`/signes/${B.slug}/`)}">Le signe ${esc(B.nom)}</a>`} · <a href="${h(`/compatibilite/#${A.slug}`)}">${esc(A.nom)} avec les autres signes</a></p>`,
  })
}


// ---------- Outils : Lune aujourd'hui, quel est mon signe ----------

// Phase du jour calculée dans le navigateur à partir des dates exactes des lunes (le HTML montre l'état au jour de la génération).
const LUNES_JS = JSON.stringify(events.map((e) => [e.date.getTime(), e.type === 'pleine' ? 1 : 0, e.path, e.signe.nom, `${weekday(e.date)} ${dayMonthYear(e.date)} à ${hourMinute(e.date)}`]))
function phaseAt(t) {
  const prev = events.filter((e) => e.type === 'nouvelle' && e.date.getTime() <= t).at(-1)
  const next = events.find((e) => e.type === 'nouvelle' && e.date.getTime() > t)
  const f = (t - prev.date) / (next.date - prev.date)
  return { f, age: (t - prev.date) / 86400000, lit: Math.round(((1 - Math.cos(2 * Math.PI * f)) / 2) * 100), i: Math.round(f * 8) % 8 }
}
function moonPath(f, r = 60) {
  const rx = Math.abs(Math.cos(2 * Math.PI * f)) * r
  return f < 0.5
    ? `M0,${-r}A${r},${r} 0 0 1 0,${r}A${rx},${r} 0 0 ${f < 0.25 ? 0 : 1} 0,${-r}Z`
    : `M0,${-r}A${r},${r} 0 0 0 0,${r}A${rx},${r} 0 0 ${f < 0.75 ? 0 : 1} 0,${-r}Z`
}
const nowPhase = phaseAt(today.getTime())
const nextOf = (type) => upcoming.find((e) => e.type === type)

pages.push({
  path: '/lune-aujourdhui/',
  section: 'lune',
  title: 'Phase de la Lune aujourd’hui : quelle lune ce soir ? | Lunaris',
  description: 'La phase de la Lune aujourd’hui et ce soir : croissante ou décroissante, pourcentage éclairé, âge de la Lune, prochaine pleine lune et nouvelle lune (heure de Paris).',
  crumbs: [['Accueil', '/'], ['Calendrier lunaire', '/calendrier-lunaire/'], ['Lune aujourd’hui', '/lune-aujourdhui/']],
  jsonLd: [faqLd(FAQ_LUNE_AUJOURDHUI)],
  body: (h) => `
<h1>Phase de la Lune aujourd’hui</h1>
<p class="lead">La Lune du jour en un coup d’œil : sa phase, la part de sa surface éclairée et les dates des prochaines pleine et nouvelle lunes, à l’heure de Paris.</p>
<div class="moon-now">
<svg viewBox="-64 -64 128 128" width="128" height="128" role="img" aria-label="Aspect de la Lune aujourd’hui"><circle r="60" fill="#18181b"/><path id="lune-path" d="${moonPath(nowPhase.f)}" fill="#e4e4e7"/></svg>
<div>
<p class="moon-date" id="lune-date">${esc(weekday(today))} ${esc(dayMonthYear(today))}</p>
<p class="moon-name" id="lune-nom">${esc(PHASES_LUNE[nowPhase.i].nom)}</p>
<p id="lune-info">Éclairée à ${nowPhase.lit} % · ${nowPhase.f < 0.5 ? 'croissante' : 'décroissante'} · âge : ${nowPhase.age.toFixed(1).replace('.', ',')} jours</p>
</div>
</div>
<dl class="facts">
<div><dt>Prochaine pleine lune</dt><dd id="lune-pleine">${nextOf('pleine') ? `<a href="${h(nextOf('pleine').path)}">${esc(`${weekday(nextOf('pleine').date)} ${dayMonthYear(nextOf('pleine').date)}`)}</a>` : '—'}</dd></div>
<div><dt>Prochaine nouvelle lune</dt><dd id="lune-nouvelle">${nextOf('nouvelle') ? `<a href="${h(nextOf('nouvelle').path)}">${esc(`${weekday(nextOf('nouvelle').date)} ${dayMonthYear(nextOf('nouvelle').date)}`)}</a>` : '—'}</dd></div>
</dl>
<h2 id="lune-titre-phase">${esc(PHASES_LUNE[nowPhase.i].nom)} : ce que dit cette phase</h2>
<p id="lune-texte">${esc(PHASES_LUNE[nowPhase.i].texte)}</p>
<h2>Les 8 phases de la Lune</h2>
${PHASES_LUNE.map((ph, i) => `<h3><svg viewBox="-64 -64 128 128" width="18" height="18" aria-hidden="true" style="vertical-align:-3px;margin-right:8px"><circle r="60" fill="#27272a"/><path d="${moonPath(i / 8 + (i === 0 ? 0.001 : 0))}" fill="#e4e4e7"/></svg>${esc(ph.nom)}</h3>\n<p>${esc(ph.texte)}</p>`).join('\n')}
<h2>Questions fréquentes</h2>
${faqHtml(FAQ_LUNE_AUJOURDHUI)}
<p style="margin-top:20px"><a href="${h('/calendrier-lunaire/')}">Voir toutes les dates dans le calendrier lunaire</a></p>
<script>
(function(){
var L=${LUNES_JS},P=${JSON.stringify(PHASES_LUNE)},now=Date.now(),prev=null,next=null,nf=null,nn=null;
L.forEach(function(e){if(e[1]===0){if(e[0]<=now)prev=e;else if(!next)next=e}if(e[0]>now){if(e[1]===1&&!nf)nf=e;if(e[1]===0&&!nn)nn=e}});
if(!prev||!next)return;
var f=(now-prev[0])/(next[0]-prev[0]),i=Math.round(f*8)%8,r=60,rx=Math.abs(Math.cos(2*Math.PI*f))*r;
var d=f<0.5?'M0,-60A60,60 0 0 1 0,60A'+rx+',60 0 0 '+(f<0.25?0:1)+' 0,-60Z':'M0,-60A60,60 0 0 0 0,60A'+rx+',60 0 0 '+(f<0.75?0:1)+' 0,-60Z';
var $=function(id){return document.getElementById(id)};
$('lune-path').setAttribute('d',d);
$('lune-date').textContent=new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Paris'}).format(new Date(now)).replace(/^./,c=>c.toUpperCase());
$('lune-nom').textContent=P[i].nom;$('lune-titre-phase').textContent=P[i].nom+' : ce que dit cette phase';$('lune-texte').textContent=P[i].texte;
$('lune-info').textContent='Éclairée à '+Math.round((1-Math.cos(2*Math.PI*f))/2*100)+' % · '+(f<0.5?'croissante':'décroissante')+' · âge : '+((now-prev[0])/864e5).toFixed(1).replace('.',',')+' jours';
function link(e,id){if(!e)return;var a=document.createElement('a');a.href=e[2];a.textContent=e[4].replace(/ à .*/,'');var dd=$(id);dd.textContent='';dd.appendChild(a)}
link(nf,'lune-pleine');link(nn,'lune-nouvelle');
})()
</script>`,
})

// Signe du jour/mois donné : le dernier signe dont la date de début est passée dans l'année.
const ZODIAC_JS = JSON.stringify(SIGNES.map((s) => ({ slug: s.slug, nom: s.nom, dates: s.dates, debut: DEBUTS_SIGNES[s.slug] })))
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
pages.push({
  path: '/quel-est-mon-signe/',
  section: 'signes',
  title: 'Quel est mon signe astrologique ? Calcul avec ma date de naissance | Lunaris',
  description: 'Trouvez votre signe astrologique en entrant votre jour et votre mois de naissance. Les dates des 12 signes du zodiaque, le cas des naissances entre deux signes et la différence avec l’ascendant.',
  crumbs: [['Accueil', '/'], ['Signes du zodiaque', '/signes/'], ['Quel est mon signe ?', '/quel-est-mon-signe/']],
  jsonLd: [faqLd(FAQ_MON_SIGNE)],
  body: (h) => `
<h1>Quel est mon signe astrologique ?</h1>
<p class="lead">Entrez votre jour et votre mois de naissance pour connaître votre signe du zodiaque, puis découvrez sa personnalité, ses forces et ses compatibilités.</p>
<form class="calc" id="signe-form">
<label>Jour<select id="signe-jour">${Array.from({ length: 31 }, (_, i) => `<option>${i + 1}</option>`).join('')}</select></label>
<label>Mois<select id="signe-mois">${MOIS.map((m, i) => `<option value="${i + 1}">${m}</option>`).join('')}</select></label>
<button class="btn" type="submit">Trouver mon signe</button>
</form>
<p class="calc-result" id="signe-resultat" aria-live="polite"></p>
<h2>Les dates des 12 signes</h2>
<div class="grid">
${SIGNES.map((s) => `<a class="card" href="${h(`/signes/${s.slug}/`)}"><span class="sym" aria-hidden="true">${s.symbole}︎</span><strong>${esc(s.nom)}</strong><span>${esc(s.dates)}</span></a>`).join('\n')}
</div>
<h2>Questions fréquentes</h2>
${faqHtml(FAQ_MON_SIGNE)}
<script>
(function(){
var Z=${ZODIAC_JS},base=${JSON.stringify(h('/signes/'))};
document.getElementById('signe-form').addEventListener('submit',function(ev){
ev.preventDefault();
var j=+document.getElementById('signe-jour').value,m=+document.getElementById('signe-mois').value,k=m*100+j,best=null;
Z.forEach(function(s){var d=s.debut[0]*100+s.debut[1];if(d<=k&&(!best||d>best.d))best={s:s,d:d}});
if(!best)Z.forEach(function(s){var d=s.debut[0]*100+s.debut[1];if(!best||d>best.d)best={s:s,d:d}});
var s=best.s,out=document.getElementById('signe-resultat'),a=document.createElement('a');
a.href=base.replace(/index\.html$/,'')+s.slug+'/'+(base.slice(-10)==='index.html'?'index.html':'');a.textContent='Découvrir le signe '+s.nom+' →';
var cusp=(s.debut[0]===m&&s.debut[1]===j)||Z.some(function(o){var dd=new Date(2001,o.debut[0]-1,o.debut[1]-1);return dd.getMonth()+1===m&&dd.getDate()===j});
out.textContent='';var b=document.createElement('strong');b.textContent='Votre signe : '+s.nom;out.appendChild(b);
out.appendChild(document.createTextNode(' ('+s.dates+'). '+(cusp?'Vous êtes né à la limite entre deux signes : selon votre année et votre heure de naissance, le signe voisin est possible. ':'')));out.appendChild(a);
});
})()
</script>`,
})

// ---------- Écriture ----------

for (const p of pages) {
  const file = join(OUT, p.path, 'index.html')
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, page(p))
}

const fonts = join(OUT, 'seo/fonts')
mkdirSync(fonts, { recursive: true })
copyFileSync(join(ROOT, 'scripts/seo/style.css'), join(OUT, 'seo/style.css'))
for (const [from, to] of [
  ['@fontsource/inter/files/inter-latin-400-normal.woff2', 'inter-400.woff2'],
  ['@fontsource/inter/files/inter-latin-600-normal.woff2', 'inter-600.woff2'],
  ['@fontsource/inter/files/inter-latin-700-normal.woff2', 'inter-700.woff2'],
  ['@fontsource/newsreader/files/newsreader-latin-500-normal.woff2', 'newsreader-500.woff2'],
]) {
  copyFileSync(join(ROOT, 'node_modules', from), join(fonts, to))
}

const lastmod = today.toISOString().slice(0, 10)
const urls = ['/', ...pages.map((p) => p.path)]
writeFileSync(
  join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n')}
</urlset>
`,
)

console.log(`SEO : ${pages.length} pages générées dans ${relative(ROOT, OUT) || '.'}`)
