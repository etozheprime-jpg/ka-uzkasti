# Ką užkąsti? — Maisto ruletė

Колесо вкусняшек с **реальными товарами, которые продаются в Литве**: крутишь, получаешь конкретный товар с ценой и ссылкой на магазин. Без регистрации, всё хранится в `localStorage`.

React 19 · TypeScript · Vite · Tailwind v4 · motion · Lucide · canvas-confetti. Языки: LT (по умолчанию), EN, RU.

```bash
npm install
npm run dev      # разработка
npm run build    # прод-сборка в dist/ (Vercel / Netlify: SPA-rewrite уже настроен)
```

## Откуда данные (ничего не выдумано)

| Что | Источник | Как |
|---|---|---|
| Название, цена, ссылка на товар | публичная выдача **Barbora** (онлайн-магазин группы Maxima), снимок **2026-10-07** | `scripts/barbora-snapshot.txt` (165 позиций). Все 164 проверенные ссылки `https://barbora.lt/produktai/<slug>` отвечают 200 |
| Фото, Nutri-Score | **Open Food Facts** (ODbL / CC BY-SA) | `scripts/fetch-off.mjs / fetch-off-brands.mjs`, подбор по бренду + граммовке + варианту. Нет надёжного совпадения — фото нет, показывается плашка с брендом |
| Цены на полке | **Open Prices** (Литва) | выгружаются, но совпадений с каталогом почти нет (в основном 2025 г.), поэтому в UI не выводятся как основная цена |

Правила честности:
* Цена всегда помечена датой снимка, это **не живые данные**.
* «Подтверждено» только там, где товар реально видели (сейчас Barbora). Для Maxima, Rimi, IKI, Lidl, Norfa показывается **«Gali būti prieinama»** и ссылка на поиск там, где формат поиска проверен (Rimi, Lidl). Остальные без ссылок.
* Рейтингов нет: надёжного источника не нашлось.

## Обновление каталога

```bash
npm run data:off     # OFF: товары Литвы + картинки по брендам (≈15 мин, лимит OFF 10 запросов/мин)
npm run data:build   # собирает src/data/products.json и public/data/products.json
```

Снимок Barbora обновляется вручную (`scripts/barbora-snapshot.txt`). Для продакшена вместо этого лучше официальный фид / партнёрская программа магазинов — архитектура готова: данные грузятся из `public/data/products.json`, при недоступности — встроенная копия.

## Структура

```
src/
  components/  Wheel, WheelSegment, SpinButton, ResultModal, ProductCard, ProductGrid,
               CategoryFilter (+Mood), BudgetFilter, StoreFilter, Favorites, History,
               ComboGenerator, SurpriseMode, DailyPick, LanguageSwitcher, Navigation, Header, Footer
  pages/       Home, RoulettePage, FavoritesPage (+история), ProductsPage, SettingsPage
  i18n/        lt.ts (источник ключей), en.ts, ru.ts — отсутствующий ключ ломает сборку
  lib/         products (данные/фильтры), pick (логика колеса/комбо), random (crypto), stores, feedback (звук/вибрация)
  state/       AppState (язык, избранное, история, настройки, пасхалки)
scripts/       сбор и сборка данных, генерация og.png
```

## Под монетизацию (не включено в MVP)

`Product.stores[].url` — единая точка для affiliate-ссылок (`src/lib/stores.ts → primaryBuyLink / storeLink`). Спонсируемые товары — флаг в данных + метка «Reklama» в `ProductCard`. Брендированные рулетки — свой `Filters`/пул в `buildWheel`.

## Перед деплоем

В `index.html` `og:image` указан относительно; на проде замени на абсолютный URL домена и добавь `<link rel="canonical">`.
