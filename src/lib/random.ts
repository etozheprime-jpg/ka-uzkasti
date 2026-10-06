/** Uniform integer in [0, n) from the browser CSPRNG (falls back to Math.random). */
export function randInt(n: number): number {
  if (n <= 1) return 0
  try {
    const limit = Math.floor(0xffffffff / n) * n
    const buf = new Uint32Array(1)
    do crypto.getRandomValues(buf)
    while (buf[0] >= limit)
    return buf[0] % n
  } catch {
    return Math.floor(Math.random() * n)
  }
}

export const randFloat = () => randInt(1_000_000) / 1_000_000

export function pick<T>(arr: readonly T[]): T {
  return arr[randInt(arr.length)]
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
