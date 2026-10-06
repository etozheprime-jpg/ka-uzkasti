import { Trash2 } from 'lucide-react'
import { useApp } from '../state/AppState'
import { BY_ID } from '../lib/products'
import { hrefFor, navigate } from '../lib/route'
import { ProductImage } from './ProductImage'

export function HistoryStrip() {
  const { history, t, showResult } = useApp()
  const items = history.map((h) => BY_ID.get(h.id)).filter((p) => !!p).slice(0, 8)
  if (!items.length) return null
  return (
    <section aria-labelledby="hist-title">
      <div className="flex items-end justify-between gap-3">
        <h2 id="hist-title" className="text-xl">{t('history.title')}</h2>
        <a href={hrefFor('/istorija')} className="text-sm font-bold underline underline-offset-4" onClick={(e) => { e.preventDefault(); navigate('/istorija') }}>{t('history.more')}</a>
      </div>
      <ul className="hscroll mt-3">
        {items.map((p, i) => (
          <li key={`${p!.id}-${i}`}>
            <button type="button" onClick={() => showResult({ product: p!, kind: 'view' })} className="sticker-flat flex w-44 items-center gap-2 p-1.5 pr-3 text-left">
              <ProductImage product={p!} className="size-12 shrink-0 rounded-xl border-2 border-ink" />
              <span className="min-w-0 text-xs font-bold leading-tight"><span className="eyebrow block !text-[0.62rem]">{p!.brand}</span><span className="line-clamp-2">{p!.name}</span></span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function HistoryList() {
  const { history, clearHistory, t, locale, showResult } = useApp()
  const rows = history.map((h) => ({ h, p: BY_ID.get(h.id) })).filter((r) => r.p)
  if (!rows.length) {
    return (
      <div className="sticker-flat grid place-items-center gap-3 p-8 text-center">
        <span className="text-5xl" aria-hidden>📜</span>
        <p className="font-bold">{t('history.empty')}</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/rulete')}>{t('favorites.emptyCta')}</button>
      </div>
    )
  }
  return (
    <div className="grid gap-3">
      <ul className="grid gap-2">
        {rows.map(({ h, p }, i) => (
          <li key={`${h.id}-${h.at}-${i}`}>
            <button type="button" onClick={() => showResult({ product: p!, kind: 'view' })} className="sticker-flat flex w-full items-center gap-3 p-2 pr-4 text-left transition-colors hover:bg-paper-2">
              <ProductImage product={p!} className="size-14 shrink-0 rounded-xl border-2 border-ink" />
              <span className="min-w-0 flex-1">
                <span className="eyebrow block">{p!.brand}</span>
                <span className="line-clamp-1 font-bold">{p!.name}</span>
              </span>
              <time className="shrink-0 text-xs text-ink-soft" dateTime={new Date(h.at).toISOString()}>
                {new Date(h.at).toLocaleString(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </time>
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="btn btn-ghost justify-self-start" onClick={clearHistory}>
        <Trash2 className="size-4" aria-hidden /> {t('history.clear')}
      </button>
    </div>
  )
}
