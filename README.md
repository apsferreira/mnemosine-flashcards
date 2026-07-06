# Mnemosine Flashcards

> Study less, retain more — powered by **FSRS-6**, the algorithm behind Anki.

## Motivation

I've been using **Anki** for years to study — it's the gold standard for spaced repetition. But when I went to download the iOS app from the App Store, I found it costs **$34.99**. The Android app is free. The desktop app is free. Just not iOS.

That felt wrong. So I built my own.

Mnemosine uses the same scheduling algorithm (FSRS-6) that Anki adopted in 2023, is fully open-source, and works across web, mobile, and eventually offline. It started as a tool to prepare for my master's thesis defense and grew into a learning project exploring TypeScript, React, NestJS, and Flutter.

## Why FSRS-6?

FSRS-6 (Free Spaced Repetition Scheduler) schedules each card at the exact moment you're about to forget it. Compared to the classic SM-2 algorithm (Anki's default until 2023), FSRS-6 delivers **20–30% fewer reviews for the same retention rate**.

The scheduling model is based on two variables per card:

- **Stability (S)** — number of days after which recall probability drops to ~90%
- **Difficulty (D)** — how hard this card is for this learner, 1–10

```
R(t, S) = (1 + FACTOR × t/S)^DECAY     // Forgetting curve
```

The full algorithm lives in [`packages/core/src/fsrs.ts`](packages/core/src/fsrs.ts) — pure TypeScript, zero dependencies.

## Monorepo Structure

```
mnemosine-flashcards/
├── apps/
│   ├── web/       React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
│   ├── api/       NestJS + TypeScript (PostgreSQL via TypeORM — in progress)
│   └── mobile/    Flutter (in progress)
└── packages/
    └── core/      Shared types + FSRS-6 algorithm (pure TypeScript)
```

## Tech Stack

| Layer    | Technology |
|----------|-----------|
| Web      | React 18, TypeScript, Vite, TailwindCSS, shadcn/ui, Zustand, TanStack Query |
| API      | NestJS, TypeScript, PostgreSQL, TypeORM, JWT auth |
| Mobile   | Flutter, Riverpod, Dio, Hive (offline) |
| Core     | Pure TypeScript — no framework, tree-shakeable |

## Getting Started

### Web (React)

```bash
cd apps/web
npm install
cp .env.example .env     # set VITE_API_URL
npm run dev              # http://localhost:3003
```

### API (NestJS)

```bash
cd apps/api
npm install
cp .env.example .env     # set DATABASE_URL, JWT_SECRET
npm run start:dev        # http://localhost:3004
```

> **Note:** The API modules have been scaffolded with `TODO` comments to guide implementation. Start with `DecksService` and connect TypeORM.

### Mobile (Flutter)

```bash
cd apps/mobile
flutter pub get
flutter run
```

## Learning Path

If you're using this project to learn the stack, follow this order:

1. **`packages/core/src/fsrs.ts`** — understand the pure algorithm with no framework noise
2. **`apps/api/src/fsrs/fsrs.service.ts`** — see how to wrap pure logic in a NestJS Injectable
3. **`apps/api/src/decks/decks.controller.ts`** — Guards, Pipes, Interceptors in practice
4. **`apps/api/src/reviews/reviews.service.ts`** — implement the core review flow (TODO)
5. **`apps/web/src/pages/study/`** — React state machine for the study session

## FSRS-6 Core API

```typescript
import { schedule, previewIntervals, retrievability } from '@mnemosine/core';

// Schedule a card after a Good (3) rating
const next = schedule(card, 3, new Date());
console.log(next.stability); // new stability in days
console.log(next.due);       // next review date

// Preview all intervals without committing
const preview = previewIntervals(card, new Date());
// { 1: 0, 2: 1, 3: 4, 4: 12 } → days per rating
```

## Status

| App     | Status |
|---------|--------|
| `core`  | ✅ Complete — FSRS-6 fully ported to TypeScript |
| `web`   | ✅ Working — connects to production API |
| `api`   | 🚧 Scaffolded — services need DB wiring (TypeORM) |
| `mobile`| 🚧 Scaffold only — screens to be implemented |

## License

MIT
