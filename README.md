# Mnemosine Flashcards

> Study less, retain more — powered by **FSRS-6**, the algorithm behind Anki.

## Motivation

I've been using **Anki** for years to study. When I went to download the iOS app from the App Store, I found it costs **$34.99**. The Android app is free. The desktop app is free. Just not iOS.

That felt wrong. So I built my own.

Mnemosine uses the same scheduling algorithm (FSRS-6) that Anki adopted in 2023, is fully open-source, and works across web and mobile. It started as a tool to prepare for my master's thesis defense and grew into a full-stack TypeScript learning project.

## Why FSRS-6?

FSRS-6 (Free Spaced Repetition Scheduler) schedules each card at the exact moment you're about to forget it. Compared to SM-2 (Anki's original algorithm), FSRS-6 delivers **20–30% fewer reviews for the same retention rate**.

The model tracks two variables per card:

- **Stability (S)** — days until recall probability drops to ~90%
- **Difficulty (D)** — how hard this card is for this learner, scale 1–10

```
R(t, S) = (1 + FACTOR × t/S)^DECAY     // Forgetting curve
```

The full algorithm is implemented in [`packages/core/src/fsrs.ts`](packages/core/src/fsrs.ts) — pure TypeScript, zero dependencies, fully tested.

## Structure

```
mnemosine-flashcards/
├── apps/
│   ├── web/       Next.js 16 — React frontend + API routes (backend included)
│   └── mobile/    Flutter — iOS/Android app (in progress)
└── packages/
    └── core/      Shared TypeScript — types + FSRS-6 algorithm
```

**Key insight:** `apps/web` is the full application. Next.js handles both the React UI and the Node.js backend in the same project — no separate server needed.

```
apps/web/src/
├── app/
│   ├── page.tsx              ← React page: deck list (/)
│   ├── study/[deckId]/
│   │   └── page.tsx          ← React page: study session (/study/:id)
│   └── api/
│       ├── decks/route.ts    ← Node.js: GET /api/decks, POST /api/decks
│       ├── reviews/route.ts  ← Node.js: POST /api/reviews
│       └── stats/route.ts    ← Node.js: GET /api/stats
├── components/               ← FlashCard, RatingButtons, ProgressBar
├── services/                 ← fetch wrappers (decks.ts, reviews.ts)
├── store/                    ← Zustand: study session state
└── hooks/                    ← useKeyboardShortcuts
```

## Tech Stack

| Layer    | Technology |
|----------|-----------|
| Web + API | Next.js 16, React 19, TypeScript, Tailwind CSS |
| State    | Zustand (local), TanStack Query (server state) |
| Mobile   | Flutter, Riverpod, Dio |
| Core     | Pure TypeScript — no framework, shared by web and mobile |
| Database | PostgreSQL via Prisma (TODO — currently in-memory) |

## Getting Started

```bash
# Clone
git clone https://github.com/apsferreira/mnemosine-flashcards.git
cd mnemosine-flashcards

# Install
cd apps/web && npm install

# Run
npm run dev   # http://localhost:3000
```

The app runs fully without a database — the API routes use in-memory storage for development.

### Mobile (Flutter)

```bash
cd apps/mobile
flutter pub get
flutter run
```

## How it works — the study loop

1. `GET /api/decks/:id/next` — returns the next card due for review
2. User sees the **front** of the card (question)
3. User reveals the **back** (answer) — keyboard: `Space`
4. User rates recall: `1` Again · `2` Hard · `3` Good · `4` Easy
5. `POST /api/reviews` — FSRS-6 computes new stability + next due date
6. Repeat until no cards remain

## FSRS-6 API

```typescript
import { schedule, previewIntervals } from '@mnemosine/core';

// Compute next state after rating Good (3)
const next = schedule(card, 3, new Date());
console.log(next.stability); // days until 90% forgetting
console.log(next.due);       // next review date

// Preview intervals for all ratings before committing
const preview = previewIntervals(card, new Date());
// → { 1: 0, 2: 1, 3: 4, 4: 12 }  (days per rating)
```

## Status

| | Status |
|---|---|
| `packages/core` | ✅ FSRS-6 fully ported to TypeScript |
| `apps/web` | ✅ Next.js app with working UI and API routes |
| Database | 🚧 In-memory — Prisma integration pending |
| `apps/mobile` | 🚧 Flutter scaffold — screens to be implemented |

## Connect to a real database

When you're ready to add persistence:

```bash
cd apps/web
npm install prisma @prisma/client
npx prisma init
```

Then replace the in-memory `store` arrays in `app/api/*/route.ts` with Prisma calls. The route signatures stay the same — only the data source changes.

## License

MIT
