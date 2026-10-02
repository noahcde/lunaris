import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// Polices hébergées avec le site (et non chez Google Fonts) : aucune donnée envoyée à un tiers.
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import '@fontsource/inter/latin-800.css'
import '@fontsource/newsreader/latin-500.css'
import './index.css'
import CookieBanner from './components/CookieBanner'
import { startAnalyticsIfAllowed } from './lib/consent'

startAnalyticsIfAllowed()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <CookieBanner />
  </React.StrictMode>,
)
