import { createContext, useContext, useState } from 'react'
import { translations } from '../i18n'

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState('en')
  const toggle = () => setLang(l => (l === 'en' ? 'es' : 'en'))

  return (
    <LangContext.Provider value={{ lang, toggle, tr: translations[lang] }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
