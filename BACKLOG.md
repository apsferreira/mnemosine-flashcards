# Mnemosine — Backlog Guiado

> Formato: cada task tem o OBJETIVO, os ARQUIVOS envolvidos, e a SEQUÊNCIA de passos.
> **Você implementa. Eu guio se travar.**

---

## Como o projeto funciona (mapa mental)

```
URL /                       → apps/web/src/app/page.tsx                    (React)
URL /decks/[deckId]         → apps/web/src/app/decks/[deckId]/page.tsx     (React)
URL /study/[deckId]         → apps/web/src/app/study/[deckId]/page.tsx     (React)

React chama                 → apps/web/src/services/decks.ts               (fetch wrapper)
                            → apps/web/src/services/cards.ts               (fetch wrapper)
Fetch bate em               → apps/web/src/app/api/decks/route.ts          (Node.js)
                            → apps/web/src/app/api/decks/[deckId]/route.ts
                            → apps/web/src/app/api/decks/[deckId]/cards/route.ts
API lê/escreve em           → apps/web/src/lib/store.ts                    (memória hoje)

Tipos compartilhados        → packages/core/src/types.ts
Algoritmo FSRS              → packages/core/src/fsrs.ts
```

---

## EPIC 0 — Foundation ✅ CONCLUÍDO

### F-1 — Seed data em inglês ✅
**Arquivo:** `apps/web/src/lib/store.ts`
Cards e decks traduzidos para inglês.

### F-2 — Criar cards via UI ✅
**Arquivos criados:**
- `apps/web/src/app/api/decks/[deckId]/cards/route.ts` — GET + POST
- `apps/web/src/services/cards.ts` — listCards, createCard
- `apps/web/src/app/decks/[deckId]/page.tsx` — página de gerenciamento
- `apps/web/src/app/page.tsx` — botão "Manage" adicionado em cada deck

**Fluxo:** Home → Manage → lista cards do deck → "+ Add card" → modal com front/back → POST cria card → lista atualiza

---

## EPIC 1 — CRUD completo de cards

### F-3 — Editar e deletar cards
**Objetivo:** poder corrigir erros nos cards e remover cards desnecessários.

**Arquivos a criar/modificar:**

| Arquivo | O que fazer |
|---------|-------------|
| `apps/web/src/app/api/decks/[deckId]/cards/[cardId]/route.ts` | Criar — PATCH e DELETE |
| `apps/web/src/services/cards.ts` | Modificar — adicionar `updateCard`, `deleteCard` |
| `apps/web/src/app/decks/[deckId]/page.tsx` | Modificar — botões Edit e Delete em cada card |

**Sequência:**

**Passo 1 — Rota de API**

Crie `apps/web/src/app/api/decks/[deckId]/cards/[cardId]/route.ts`.

Modelo mental: idêntico a `api/decks/[deckId]/route.ts` — só troca `decks` por `cards`:
```ts
// PATCH /api/decks/:deckId/cards/:cardId
export async function PATCH(req, { params }) {
  const { cardId } = await params
  const body = await req.json()  // { front?, back? }
  // encontra card pelo id, atualiza campos, retorna { card }
}

// DELETE /api/decks/:deckId/cards/:cardId
export async function DELETE(_, { params }) {
  const { cardId } = await params
  // remove card do array, retorna 204
}
```

**Passo 2 — Service**

Em `apps/web/src/services/cards.ts`, adicione:
```ts
export const updateCard = (deckId: string, cardId: string, body: { front?: string; back?: string }) =>
  api.patch<{ card: Card }>(`/decks/${deckId}/cards/${cardId}`, body).then((r) => r.card)

export const deleteCard = (deckId: string, cardId: string) =>
  api.delete(`/decks/${deckId}/cards/${cardId}`)
```

**Passo 3 — UI**

Em `apps/web/src/app/decks/[deckId]/page.tsx`, replique o padrão do `page.tsx` da home:
- `useState<Card | null>` para `editingCard`
- `useState<string | null>` para `deletingCardId`
- `useMutation` para updateMut e deleteMut
- Modal de edição com textarea front + back
- Modal de confirmação de delete
- Botões Edit e Delete em cada card na lista

**Critério de done:** abrir um deck, editar o front de um card, salvar, ver a mudança na lista. Deletar um card, ver sumir da lista.

---

## EPIC 2 — Subjects (organização multi-assunto)

### S-1 — Tipo Subject
**Arquivo:** `packages/core/src/types.ts`

Adicione:
```ts
export interface Subject {
  id: string
  name: string
  description: string
  createdAt: string
}
```

E adicione `subjectId: string` no `Deck`.

**Por que em `packages/core`?** Subject é uma entidade de domínio — precisa ser conhecida pelo web app e pelo mobile.

---

### S-2 — Rotas de API para Subject
**Arquivos a criar:**
- `apps/web/src/app/api/subjects/route.ts` — GET e POST
- `apps/web/src/app/api/subjects/[subjectId]/route.ts` — PATCH e DELETE

Padrão: igual ao que existe em `api/decks/`.

Em `lib/store.ts`, adicione:
```ts
export const subjects: Subject[] = [
  { id: 'subject-1', name: 'Master Thesis', description: 'OGUM framework, UAVs, simulation', createdAt: ... },
  { id: 'subject-2', name: 'English', description: 'Vocabulary, phrasal verbs, grammar', createdAt: ... },
]
```

---

### S-3 — Home vira lista de Subjects
**Arquivo:** `apps/web/src/app/page.tsx`

A home atual lista decks. Vai passar a listar Subjects.
Cada Subject tem botão "Open" que navega para `/subjects/[subjectId]`.
O formulário de criar Subject vai no lugar do de criar Deck.

---

### S-4 — Página de Subject
**Arquivo a criar:** `apps/web/src/app/subjects/[subjectId]/page.tsx`

Lista os decks de um Subject. Usa `useParams()` para o `subjectId`. Busca `GET /api/subjects/[subjectId]/decks`.

---

### S-5 — Filtrar decks por Subject na API
**Arquivo:** `apps/web/src/app/api/subjects/[subjectId]/decks/route.ts`

```ts
const decksBySubject = decks.filter(d => d.subjectId === subjectId)
```

---

## EPIC 3 — Banco de dados real

> Pré-requisito: K8s já tem `mnemosine-secret` com DATABASE_URL apontando para
> `postgresql://postgres:***@192.168.30.121:5432/mnemosine` ✅

### DB-1 — Rodar migrate local
```bash
cd apps/web
npx prisma migrate dev --name init
```

O schema já existe em `apps/web/prisma/schema.prisma` (Subject → Deck → Card com campos FSRS-6).
Requer `shared-infra` rodando com banco `mnemosine` acessível.

### DB-2 — Substituir store.ts por Prisma
Cada rota de API troca o array em memória por uma chamada Prisma:
```ts
// antes
const deck = decks.find(d => d.id === id)

// depois
const deck = await prisma.deck.findUnique({ where: { id } })
```

As rotas em si não mudam de assinatura — só de onde vêm os dados.

**Arquivos a modificar:** todas as rotas em `apps/web/src/app/api/`.

### DB-3 — Adicionar Prisma Client ao projeto
```bash
cd apps/web
npm install @prisma/client
```

Criar `apps/web/src/lib/db.ts`:
```ts
import { PrismaClient } from '@prisma/client'
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## EPIC 4 — Deploy ✅ EM ANDAMENTO

### D-1 — Dockerfile ✅
Multi-stage build com Node 22 + Next.js standalone + `outputFileTracingRoot` para monorepo.

### D-2 — CI/CD ✅
`.github/workflows/ci-cd.yml`: push main → build → push GHCR → atualiza tag em `k8s/deployment.yaml` → ArgoCD sync automático.

> **Status atual:** CI com falhas sendo corrigidas (build issue monorepo + standalone).

### D-3 — K8s manifests ✅
`k8s/`: namespace, deployment, service, IngressRoute (`flashcards.antoniopedro.com.br`), ArgoCD app.

### D-4 — Cloudflare Tunnel + DNS ✅
- Rota `flashcards.antoniopedro.com.br` adicionada no tunnel (VM 501, 192.168.40.10)
- CNAME DNS criado: `flashcards.antoniopedro.com.br → acca3f04-...cfargotunnel.com`
- Secret K8s `mnemosine-secret` criado no namespace `mnemosine`
- App ArgoCD `mnemosine-flashcards` registrado

### D-5 — Corrigir CI e verificar deploy ⏳ EM ANDAMENTO
O CI está falhando no build do Docker por problema de monorepo standalone.
Quando o CI ficar verde, o ArgoCD detecta e faz deploy automaticamente.

---

## Ordem recomendada

```
F-3 (você implementa)          → CRUD completo de cards
S-1 → S-5 (você implementa)   → organização por Subject
DB-1 → DB-3 (você implementa) → dados persistem entre restarts
D-5 (aguardando CI verde)      → app online em flashcards.antoniopedro.com.br
```
