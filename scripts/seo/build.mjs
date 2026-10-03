// Génère, après `vite build`, les pages publiques lues par Google : les 12 signes et le calendrier lunaire.
// Ce sont de vraies pages HTML (sans JavaScript), servies par Firebase avant l'application.
// SEO_PREVIEW=1 : liens relatifs, pour un aperçu hors du site.

import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, posix, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { lunations } from './moon.mjs'
import { SIGNES } from '../../src/content/seo/signes.js'
import { FAQ_LUNE, LUNE_EN, PHASES } from '../../src/content/seo/lunes.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..')
const OUT = process.env.SEO_OUT ?? join(ROOT, 'dist')
const PREVIEW = process.env.SEO_PREVIEW === '1'
const SITE = 'https://lunaris-app.fr'
const TZ = 'Europe/Paris'
const YEARS = [2026, 2027]
const today = new Date()

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const plain = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
const SIGN = Object.fromEntries(SIGNES.map((s) => [s.slug, s]))

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

// ---------- Gabarit ----------

function href(from, to) {
  if (/^https?:/.test(to)) return to
  if (to === '/' || to.startsWith('/#')) return PREVIEW ? `${SITE}${to}` : to
  if (!PREVIEW) return to
  const rel = posix.relative(posix.dirname(`${from}index.html`), to.endsWith('/') ? `${to}index.html` : to)
  return rel || 'index.html'
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
<nav class="main" aria-label="Rubriques">${nav('/signes/', 'Signes', 'signes')}${nav('/calendrier-lunaire/', 'Calendrier lunaire', 'lune')}</nav>
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
<nav aria-label="Pages">${[...SIGNES.map((s) => [`/signes/${s.slug}/`, s.nom]), ['/calendrier-lunaire/', 'Calendrier lunaire']].map(([to, l]) => `<a href="${h(to)}">${esc(l)}</a>`).join('')}</nav>
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
${SIGNES.map((s) => `<a class="card" href="${h(`/signes/${s.slug}/`)}"><span class="sym" aria-hidden="true">${s.symbole}</span><strong>${esc(s.nom)}</strong><span>${esc(s.dates)}</span><span>${esc(s.element)} · ${esc(s.planete)}</span></a>`).join('\n')}
</div>
<h2>Comment connaître son signe ?</h2>
<p>Repérez votre date de naissance dans les dates ci-dessus. Si vous êtes né à la limite entre deux signes, le signe exact dépend de l’heure et du lieu de naissance : Lunaris fait ce calcul pour vous à partir de votre date de naissance.</p>
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
<h1><span aria-hidden="true">${s.symbole}</span> ${esc(s.nom)}</h1>
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
<h2>Questions fréquentes</h2>
${faqHtml(s.faq)}
<div class="pager"><a href="${h(`/signes/${prev.slug}/`)}">← ${esc(prev.nom)}</a><a href="${h(`/signes/${after.slug}/`)}">${esc(after.nom)} →</a></div>`,
  })
}

const nextEvent = upcoming[0]
pages.push({
  path: '/calendrier-lunaire/',
  section: 'lune',
  title: `Calendrier lunaire ${YEARS.join(' et ')} : pleines et nouvelles lunes | Lunaris`,
  description: `Toutes les dates et heures des pleines lunes et nouvelles lunes de ${YEARS.join(' et ')} (heure de Paris), le signe où elles tombent et comment en profiter.`,
  crumbs: [['Accueil', '/'], ['Calendrier lunaire', '/calendrier-lunaire/']],
  jsonLd: [faqLd(FAQ_LUNE)],
  body: (h) => `
<h1>Calendrier lunaire ${YEARS.join(' et ')}</h1>
<p class="lead">Les dates et heures exactes (heure de Paris) de chaque nouvelle lune et pleine lune, le signe du zodiaque dans lequel elle se forme, et des idées concrètes pour en tirer parti.</p>
${nextEvent ? `<p>Prochaine lune : <a href="${h(nextEvent.path)}">${esc(nextEvent.label)} en ${esc(nextEvent.signe.nom)}</a>, à ${hourMinute(nextEvent.date)}.</p>` : ''}
${YEARS.map(
  (y) => `<h2>Pleines et nouvelles lunes ${y}</h2>
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
  const title = `${e.phase.nom} ${monthName(e.date)} ${yearOf(e.date)} en ${s.nom} : date, heure et sens | Lunaris`
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
<div><dt>Signe</dt><dd><a href="${h(`/signes/${s.slug}/`)}">${s.symbole} ${esc(s.nom)}</a></dd></div>
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
<p style="margin-top:20px"><a href="${h('/calendrier-lunaire/')}">Voir tout le calendrier lunaire</a></p>`,
  })
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
