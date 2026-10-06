import { Roulette } from '../components/Roulette'
import { useApp } from '../state/AppState'

export function RoulettePage() {
  const { t } = useApp()
  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 sm:pt-10">
      <h1 className="mb-6 text-[clamp(2rem,7vw,3.5rem)] font-black uppercase">{t('nav.roulette')}</h1>
      <Roulette variant="full" />
    </div>
  )
}
