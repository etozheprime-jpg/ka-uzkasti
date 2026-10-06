import { useCallback, useEffect, useState } from 'react'

const PREFIX = 'uzkask.v1.'

export function readStore<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(PREFIX + key)
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeStore<T>(key: string, value: T) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* private mode / quota: the app keeps working in memory */
  }
}

export function clearStore() {
  try {
    Object.keys(localStorage).filter((k) => k.startsWith(PREFIX)).forEach((k) => localStorage.removeItem(k))
  } catch { /* ignore */ }
}

export function usePersisted<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readStore(key, fallback))
  useEffect(() => writeStore(key, value), [key, value])
  const reset = useCallback(() => setValue(fallback), [fallback])
  return [value, setValue, reset] as const
}
