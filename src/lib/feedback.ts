// Sound is synthesised with WebAudio (no audio files to download) and only starts after a user gesture.
let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  try {
    ctx ??= new (window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function blip(freq: number, dur: number, type: OscillatorType, gain: number, when = 0) {
  const c = audio()
  if (!c) return
  const t = c.currentTime + when
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  g.gain.setValueAtTime(gain, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(c.destination)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

export const sfx = {
  unlock: () => void audio(),
  tick: (speed = 1) => blip(520 + 380 * Math.min(speed, 1), 0.035, 'square', 0.035),
  win: () => [523, 659, 784, 1047].forEach((f, i) => blip(f, 0.22, 'triangle', 0.09, i * 0.09)),
  super: () => [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => blip(f, 0.3, 'triangle', 0.09, i * 0.07)),
  pop: () => blip(300, 0.12, 'sine', 0.08),
}

export function vibrate(pattern: number | number[]) {
  try {
    // browsers refuse vibration before the first tap/click; skip silently instead of logging errors
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return
    navigator.vibrate?.(pattern)
  } catch { /* unsupported */ }
}
