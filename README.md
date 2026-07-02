# Үйрен — приложение для изучения казахского языка

## Что внутри
- Next.js (App Router) + TypeScript + Tailwind
- База данных: PostgreSQL через Prisma (Vercel Postgres)
- Хранение картинок: Vercel Blob
- Сессии: JWT в httpOnly cookie

## Как развернуть на Vercel

1. Залить этот проект в GitHub-репозиторий.
2. На vercel.com → New Project → выбрать репозиторий.
3. В разделе Storage добавить:
   - **Postgres** — после создания Vercel сам добавит переменные `POSTGRES_PRISMA_URL` и `POSTGRES_URL_NON_POOLING` в проект.
   - **Blob** — для хранения картинок (добавит свою переменную автоматически).
4. В Settings → Environment Variables добавить:
   - `SESSION_SECRET` — любая длинная случайная строка (можно сгенерировать командой `openssl rand -base64 32`).
   - `SEED_ADMIN_PASSWORD` — пароль для входа админа (необязательно, по умолчанию `admin123`).
5. Deploy.
6. После первого деплоя выполнить миграцию и сид базы. Самый простой способ — локально:
   ```
   npm install
   npx prisma db push   # создаёт таблицы по schema.prisma
   npx tsx prisma/seed.ts   # создаёт админа и базовые слова
   ```
   (Переменные окружения для локального запуска взять из Vercel: Settings → Environment Variables → Postgres, и положить в файл `.env`)

## Локальная разработка

Если хочешь работать без Postgres, проект поддерживает SQLite для локального запуска.

1. Создай файл `.env` в корне проекта.
2. Скопируй в него содержимое из `.env.example`.
3. Запусти:
   ```
   npm install
   npx prisma db push
   npx tsx prisma/seed.ts
   npm run dev
   ```

## Вход

- Админ: логин `admin`, пароль — тот, что указан в `SEED_ADMIN_PASSWORD` (по умолчанию `admin123`). Админ видит кнопку «Админ» в шапке → переход в `/admin`.
- Обычные пользователи (дети/родители) регистрируются на `/register`.

## Структура

- `/app/page.tsx` — список разделов с карточками
- `/app/learn/[sectionId]` — карточки внутри раздела (слово + перевод + озвучка)
- `/app/test` и `/app/test/[sectionId]` — тесты по разделу
- `/app/profile` — прогресс пользователя
- `/app/admin` — управление разделами и карточками (только для роли ADMIN)
- `/app/api/*` — все серверные роуты (auth, sections, cards, tests, progress, upload)

## Озвучка

Сейчас работает через встроенный в браузер Web Speech API (бесплатно, без сервера).
Казахское произношение браузеров неидеальное — для продакшена стоит заменить на
настоящие аудиозаписи (поле `gifUrl`/`imageUrl` в модели Card можно расширить полями
`audioRuUrl`/`audioKzUrl` и загружать через тот же `/api/upload`).
