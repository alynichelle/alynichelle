import { useEffect, useState } from 'react'
import './App.css'
import Affirmations from './components/Affirmations'
import Journal from './components/Journal'
import Breathe from './components/Breathe'
import SoundMixer from './components/SoundMixer'
import './styles/themes.css'

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('lilac-theme') || 'lavender')

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-lavender')
    document.body.classList.add(`theme-${theme}`)
    localStorage.setItem('lilac-theme', theme)
  }, [theme])

  return (
    <div className={`app theme-${theme}`}>
      <header className="hero container">
        <div>
          <p className="eyebrow">Lilac Passion Project</p>
          <h1>Personal sanctuary</h1>
          <p className="lede">
            Daily mood check-ins, shimmering themes, and a calming space to collect your thoughts. This scaffold keeps data
            on-device so you can wire up Supabase whenever you are ready.
          </p>
        </div>
        <label className="control-panel" aria-label="Theme toggle">
          <span className="hint">Choose theme</span>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="lavender">Lavender Chrome</option>
          </select>
        </label>
      </header>

      <section className="status-grid container">
        <div className="status-chip">🌱 Affirmations rotator</div>
        <div className="status-chip">📝 Journal autosaves locally</div>
        <div className="status-chip">🌗 Theme toggle (Light/Dark/Lavender‑Chrome)</div>
        <div className="status-chip">🌬️ Breathe + ambient sound stubs</div>
      </section>

      <main className="grid container">
        <section className="card">
          <Breathe />
        </section>
        <section className="card">
          <SoundMixer />
        </section>
        <section className="card">
          <Affirmations />
        </section>
        <section className="card wide">
          <Journal />
        </section>
      </main>

      <footer className="container small">made with ❤️ by me</footer>
    </div>
  )
}

export default App
