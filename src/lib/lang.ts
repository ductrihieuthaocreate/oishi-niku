import { cookies } from 'next/headers'
import type { Lang } from './lang-dict'
export type { Lang } from './lang-dict'
export { dict } from './lang-dict'
export type { Dict } from './lang-dict'

export async function getLang(): Promise<Lang> {
  const cookieStore = await cookies()
  const lang = cookieStore.get('lang')?.value
  return lang === 'en' ? lang : 'ja'
}
