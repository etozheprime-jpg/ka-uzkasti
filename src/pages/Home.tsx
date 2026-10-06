import { useApp } from '../state/AppState'
import { navigate } from '../lib/route'
import { Roulette } from '../components/Roulette'
import { CategoryFilter } from '../components/CategoryFilter'
import { DailyPick } from '../components/DailyPick'
import { HistoryStrip } from '../components/History'
import { Ticker } from '../components/Ticker'

export function Home() {
  const { t } = useApp()
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:pt-10">
        <div className="grid gap-x-12 gap-y-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:grid-rows-[auto_1fr]">
          <div className="lg:col-start-1 lg:row-start-1 lg:pt-6">
            <p className="eyebrow flex items-center gap-2"><span className="size-2 rounded-full bg-forest" aria-hidden /> {t('hero.eyebrow')}</p>
            <h1 className="mt-3 text-[clamp(2.4rem,9.4vw,4.1rem)] font-black uppercase leading-[0.92]">{t('hero.title')}</h1>
            <p className="mt-4 max-w-md text-lg font-medium text-ink-soft">{t('hero.sub')}</p>
          </div>

          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <Roulette variant="home" />
          </div>

          <div className="grid content-start gap-5 lg:col-start-1 lg:row-start-2">
            <CategoryFilter scroll />
            <div className="grid gap-3 sm:grid-cols-[3fr_2fr]">
              <button
                type="button"
                onClick={() => navigate('/rulete?mode=surprise')}
                className="sticker bg-mustard p-4 text-left transition-transform hover:-translate-y-0.5"
              >
                <span className="font-display text-xl font-black uppercase leading-none">{t('mode.surprise')}</span>
                <span className="mt-1.5 block text-sm font-medium">{t('surprise.sub')}</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/rulete?mode=combo')}
                className="sticker bg-forest p-4 text-left text-paper transition-transform hover:-translate-y-0.5"
              >
                <span className="font-display text-xl font-black uppercase leading-none">{t('mode.combo')}</span>
                <span className="mt-1.5 block text-sm font-medium opacity-95">{t('combo.sub')}</span>
              </button>
            </div>
            <DailyPick />
          </div>
        </div>

        <div className="mt-10"><HistoryStrip /></div>
      </div>

      <div className="mt-12"><Ticker /></div>
    </>
  )
}
