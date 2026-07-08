# Mnemosine — Backlog Guiado

> Formato: cada task tem o OBJETIVO, os ARQUIVOS envolvidos, e a SEQUÊNCIA de passos.
> Você implementa. Eu guio se travar.

---

## Como o projeto funciona (mapa mental)

```
URL /                    → apps/web/src/app/page.tsx          (React)
URL /study/[deckId]      → apps/web/src/app/study/[deckId]/page.tsx (React)

React chama             → apps/web/src/services/decks.ts      (fetch wrapper)
Fetch bate em           → apps/web/src/app/api/decks/route.ts (Node.js)
API lê/escreve em       → apps/web/src/lib/store.ts           (memória hoje)

Tipos compartilhados    → packages/core/src/types.ts
Algoritmo FSRS          → packages/core/src/fsrs.ts
```

---

## EPIC 0 — Foundation

### F-1 — Seed data em inglês
**Objetivo:** trocar o conteúdo dos cards de seed para inglês (para a entrevista)

**Arquivo:** `apps/web/src/lib/store.ts`

**O que fazer:**
1. Abra o arquivo
2. Encontre o array `cards`
3. Troque `front` e `back` de cada card para inglês
4. Mantenha a estrutura — só mude o texto

**Exemplo de card atual:**
```ts
front: 'O que é o algoritmo FSRS-6?',
back: 'Free Spaced Repetition Scheduler v6...',
```

**Como deve ficar:**
```ts
front: 'What is the FSRS-6 algorithm?',
back: 'Free Spaced Repetition Scheduler v6. Tracks two variables per card — Stability (S) and Difficulty (D) — to compute the ideal review interval.',
```

**Critério de done:** rodar o projeto e ver os cards em inglês na sessão de estudo.

---

### F-2 — Criar cards via UI
**Objetivo:** poder adicionar cards novos a um deck existente

**Por que importa:** hoje os decks existem mas estão "vazios" para o usuário — os cards são hardcoded. Sem isso, o projeto não tem uso real.

**Arquivos que você vai criar/modificar:**

| Arquivo | O que fazer |
|---------|-------------|
| `apps/web/src/app/api/decks/[deckId]/cards/route.ts` | Criar — rota GET e POST |
| `apps/web/src/services/cards.ts` | Criar — funções listCards, createCard |
| `apps/web/src/app/decks/[deckId]/page.tsx` | Criar — página de gerenciamento |
| `apps/web/src/app/page.tsx` | Modificar — adicionar botão "Manage" em cada deck |

**Sequência:**

**Passo 1 — Rota de API**
Crie `apps/web/src/app/api/decks/[deckId]/cards/route.ts`

Modelo mental: é o mesmo padrão de `app/api/decks/route.ts`, mas filtrando por deckId.
```
GET  /api/decks/deck-1/cards → retorna todos os cards do deck-1
POST /api/decks/deck-1/cards → cria um card novo no deck-1
```

O `[deckId]` na pasta captura o valor da URL — o mesmo conceito de rotas dinâmicas.

**Passo 2 — Service**
Crie `apps/web/src/services/cards.ts`

Modelo mental: igual `services/decks.ts`, mas para cards.
```ts
export const listCards = (deckId: string) => api.get(...)
export const createCard = (deckId: string, body: {...}) => api.post(...)
```

**Passo 3 — Página de gerenciamento**
Crie `apps/web/src/app/decks/[deckId]/page.tsx`

Essa página usa:
- `useParams()` para pegar o deckId da URL
- `useQuery` para listar os cards do deck
- `useState` para controlar o modal de "Add card"
- `useMutation` para criar o card

**Passo 4 — Ligar a home**
Em `apps/web/src/app/page.tsx`, adicione botão "Manage" em cada deck:
```tsx
<button onClick={() => router.push(`/decks/${deck.id}`)}>
  Manage
</button>
```

**Critério de done:** criar um deck, clicar em Manage, adicionar um card, clicar em Study, o card novo aparecer na sessão.

---

### F-3 — Editar e deletar cards
**Objetivo:** completar o CRUD de cards

**Arquivos:**
- `apps/web/src/app/api/decks/[deckId]/cards/[cardId]/route.ts` — PATCH e DELETE
- `apps/web/src/services/cards.ts` — adicionar `updateCard`, `deleteCard`
- `apps/web/src/app/decks/[deckId]/page.tsx` — botões Edit e Delete em cada card

**Padrão:** idêntico ao que você fez com decks em `page.tsx`. Reutilize o Modal.

---

## EPIC 1 — Subjects (organização multi-assunto)

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

**Por que em `packages/core`?** Porque Subject é uma entidade de domínio — precisa ser conhecida pelo web app e pelo mobile.

---

### S-2 — Rotas de API para Subject
**Arquivos a criar:**
- `apps/web/src/app/api/subjects/route.ts` — GET e POST
- `apps/web/src/app/api/subjects/[subjectId]/route.ts` — PATCH e DELETE

**Padrão:** igual ao que existe em `api/decks/`.

Adicione em `lib/store.ts`:
```ts
export const subjects: Subject[] = [
  { id: 'subject-1', name: 'Master Thesis', description: 'OGUM framework, VANTs, simulation', createdAt: ... },
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

Essa página é o que a home é hoje — lista os decks — mas filtrada por `subjectId`.

Usa `useParams()` para pegar o `subjectId`. Busca `GET /api/subjects/[subjectId]/decks`.

---

### S-5 — Filtrar decks por Subject na API
**Arquivo:** `apps/web/src/app/api/subjects/[subjectId]/decks/route.ts`

```ts
const decksBySubject = decks.filter(d => d.subjectId === subjectId)
```

---

## EPIC 2 — Banco de dados real

### DB-1 — Prisma setup
```bash
cd apps/web
npm install prisma @prisma/client
npx prisma init
```

Isso cria `prisma/schema.prisma`. Você vai definir Subject, Deck, Card como models.

### DB-2 — Schema
```prisma
model Subject {
  id          String   @id @default(cuid())
  name        String
  description String   @default("")
  createdAt   DateTime @default(now())
  decks       Deck[]
}

model Deck {
  id          String   @id @default(cuid())
  name        String
  description String   @default("")
  subject     Subject  @relation(fields: [subjectId], references: [id])
  subjectId   String
  createdAt   DateTime @default(now())
  cards       Card[]
}

model Card {
  id          String   @id @default(cuid())
  front       String
  back        String
  state       Int      @default(0)
  stability   Float?
  difficulty  Float?
  due         DateTime @default(now())
  lastReview  DateTime?
  lapses      Int      @default(0)
  reps        Int      @default(0)
  deck        Deck     @relation(fields: [deckId], references: [id])
  deckId      String
}
```

### DB-3 — Substituir lib/store.ts por Prisma
Cada rota de API troca:
```ts
// antes
const deck = decks.find(d => d.id === id)

// depois
const deck = await prisma.deck.findUnique({ where: { id } })
```

As rotas em si não mudam — só de onde vêm os dados.

### DB-4 — Docker Compose para dev
Arquivo `docker-compose.yml` na raiz com Postgres. Você sobe com `docker compose up -d`.

---

## EPIC 3 — Deploy

### D-1 — Dockerfile
Next.js tem suporte oficial a Docker com `output: 'standalone'` no `next.config.ts`.

### D-2 — K8s manifest
Deployment + Service + Ingress no K3s existente.
Ingress aponta `flashcards.antoniopedro.com.br` para o Service.

### D-3 — DNS + SSL
Subdomínio no seu DNS provider apontando para o IP do cluster.
cert-manager já configurado no cluster cuida do SSL automaticamente.

---

## Ordem recomendada

```
F-1 → F-2 → F-3   (você tem um CRUD completo, pode mostrar na entrevista)
S-1 → S-2 → S-3 → S-4 → S-5   (organização real por assunto)
DB-1 → DB-2 → DB-3 → DB-4   (dados persistem)
D-1 → D-2 → D-3   (online em flashcards.antoniopedro.com.br)
```
