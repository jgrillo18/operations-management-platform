import { useState } from 'react'
import { LangProvider, useLang } from './context/LangContext'
import Dashboard from './pages/Dashboard'
import Requests from './pages/Requests'
import AuditLog from './pages/AuditLog'

const TAB_KEYS = ['dashboard', 'requests', 'auditLog']

function Shell() {
  const { tr, toggle } = useLang()
  const [tab, setTab] = useState('dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-800 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚙️</span>
            <div>
              <h1 className="text-lg font-bold leading-tight">{tr.appTitle}</h1>
              <p className="text-blue-200 text-xs">{tr.appSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <nav className="flex gap-1">
              {TAB_KEYS.map(key => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`px-4 py-2 rounded text-sm font-medium transition ${
                    tab === key
                      ? 'bg-white text-blue-800'
                      : 'text-blue-100 hover:bg-blue-700'
                  }`}
                >
                  {tr.nav[key]}
                </button>
              ))}
            </nav>

            {/* Language toggle */}
            <button
              onClick={toggle}
              title="Switch language / Cambiar idioma"
              className="ml-3 px-3 py-1.5 rounded border border-blue-400 text-blue-100 text-xs font-bold hover:bg-blue-700 transition"
            >
              🌐 {tr.langBtn}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'requests'  && <Requests />}
        {tab === 'auditLog'  && <AuditLog />}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <LangProvider>
      <Shell />
    </LangProvider>
  )
}
