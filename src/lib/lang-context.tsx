'use client'

import { createContext, useContext } from 'react'
import type { Lang, Dict } from './lang'
import { dict } from './lang'

const LangContext = createContext<Lang>('ja')

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>
}

export function useLang(): { lang: Lang; t: Dict } {
  const lang = useContext(LangContext)
  return { lang, t: dict[lang] as Dict }
}
