import { lt, type Dict } from './lt'
import { en } from './en'
import { ru } from './ru'

export type Lang = 'lt' | 'en' | 'ru'
export type Key = keyof Dict

export const LANGS: { id: Lang; label: string; short: string; locale: string }[] = [
  { id: 'lt', label: 'Lietuvių', short: 'LT', locale: 'lt-LT' },
  { id: 'en', label: 'English', short: 'EN', locale: 'en-GB' },
  { id: 'ru', label: 'Русский', short: 'RU', locale: 'ru-RU' },
]

const DICTS: Record<Lang, Dict> = { lt, en, ru }

export function translate(lang: Lang, key: Key, params?: Record<string, string | number>): string {
  let s = DICTS[lang][key] ?? lt[key] ?? key
  if (params) for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, String(v))
  return s
}
