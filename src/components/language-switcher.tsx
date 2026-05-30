'use client'

import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/lang-context'
import type { Lang } from '@/lib/lang-dict'

const LANGS: { code: Lang; label: string }[] = [
  { code: 'ja', label: 'VI' },
  { code: 'en', label: 'EN' },
]

export function LanguageSwitcher() {
  const router = useRouter()
  const { lang } = useLang()

  const switchLang = (newLang: Lang) => {
    document.cookie = `lang=${newLang}; path=/; max-age=31536000; SameSite=Lax`
    router.refresh()
  }

  return (
    <div className="flex items-center gap-0.5">
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => switchLang(code)}
          className={`text-[11px] font-bold px-2 py-1 rounded-full transition-colors leading-none ${
            lang === code
              ? 'bg-foreground text-background'
              : 'text-foreground/50 hover:text-foreground'
          }`}
          aria-label={`Switch to ${label}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
