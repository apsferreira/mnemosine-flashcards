# Roteiro — Mnemosine Flashcards

> Passo a passo do zero à produção. Cada etapa tem critério de done.

---

## Fase 0 — Projeto rodando local (HOJE)

### 0.1 — Subir o shared-infra (banco local)
```bash
cd ~/Projects/shared-infra
docker compose up -d
```
Verifica: `docker ps` → deve aparecer `shared-postgres` rodando.

O banco `mnemosine` é criado automaticamente pelo `init-scripts/01-create-databases.sql`.

### 0.2 — Rodar o projeto
```bash
cd ~/Projects/mnemosine-flashcards
npm run dev:web
```
Abre: http://localhost:3000

Verifica: página carrega, decks aparecem, consegue criar e deletar decks.

---

## Fase 1 — Estudar os fundamentos (HOJE antes das 17h)

```bash
cd ~/Projects/ts-interview-prep

# Array methods
npx tsx src/06-array-methods.ts

# TypeScript types, interfaces, generics
npx tsx src/07-typescript-types.ts

# Reduce aprofundado
npx tsx src/08-reduce-deep.ts
```

Para cada arquivo: rode, leia o output, implemente os TODOs.

---

## Fase 2 — CI/CD e deploy (ESTA SEMANA — pós entrevista)

### 2.1 — Criar banco em produção

SSH no servidor e criar o banco manualmente (o init-script só roda quando o container é criado do zero):
```bash
ssh ubuntu@192.168.30.121
docker exec shared-postgres psql -U postgres -c "CREATE DATABASE mnemosine;"
```

### 2.2 — Criar o Secret no cluster K8s
```bash
# Na sua máquina, com kubectl configurado para o cluster
kubectl create namespace mnemosine --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic mnemosine-secret \
  --namespace mnemosine \
  --from-literal=database-url="postgresql://postgres:SENHA_REAL@192.168.30.121:5432/mnemosine"
```

Substitua `SENHA_REAL` pela senha do postgres no servidor.

### 2.3 — Registrar o app no ArgoCD
```bash
# Aplica o manifest de aplicação do ArgoCD
kubectl apply -f k8s/argocd-app.yaml
```

Depois disso, o ArgoCD passa a monitorar o repositório.
Qualquer push na `main` → CI atualiza `k8s/deployment.yaml` → ArgoCD detecta → deploy automático.

### 2.4 — Configurar DNS no Cloudflare

No painel do Cloudflare, adicionar registro:
```
Type:  CNAME
Name:  flashcards
Value: antoniopedro.com.br (ou o IP do cluster)
```

### 2.5 — Fazer o primeiro push e verificar o deploy

```bash
cd ~/Projects/mnemosine-flashcards
git add -A
git commit -m "feat: add CI/CD, Dockerfile, K8s manifests"
git push origin main
```

Acompanhar: https://github.com/apsferreira/mnemosine-flashcards/actions

Quando o CI terminar, verificar: https://flashcards.antoniopedro.com.br

---

## Fase 3 — CRUD completo de cards (SEMANA 1)

### F-1: Seed em inglês
**Arquivo:** `apps/web/src/lib/store.ts`
Trocar o `front` e `back` de cada card para inglês.

### F-2: UI para criar cards
Criar (nessa ordem):
1. `apps/web/src/app/api/decks/[deckId]/cards/route.ts` — GET + POST
2. `apps/web/src/services/cards.ts` — listCards, createCard
3. `apps/web/src/app/decks/[deckId]/page.tsx` — página de gerenciamento
4. `apps/web/src/app/page.tsx` — adicionar botão "Manage" em cada deck

### F-3: Editar e deletar cards
Criar:
1. `apps/web/src/app/api/decks/[deckId]/cards/[cardId]/route.ts` — PATCH + DELETE
2. Adicionar updateCard, deleteCard em `services/cards.ts`
3. Botões Edit + Delete na página F-2

---

## Fase 4 — Banco de dados real com Prisma (SEMANA 2)

### DB-1: Migração inicial

Com o shared-infra rodando (docker compose up -d) e DATABASE_URL em .env.local:
```bash
cd apps/web
npx prisma migrate dev --name init
```

Isso cria `prisma/migrations/` com o SQL e aplica no banco local.
Verifica: `npx prisma studio` → abre UI em http://localhost:5555

### DB-2: Substituir in-memory store por Prisma

Criar `apps/web/src/lib/prisma.ts`:
```ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export default prisma
```

Cada rota de API troca:
```ts
// antes (memória)
const deck = decks.find(d => d.id === id)

// depois (Prisma)
const deck = await prisma.deck.findUnique({ where: { id } })
```

A interface das rotas (GET /api/decks, POST /api/decks) não muda.
Apenas a fonte de dados muda.

### DB-3: Seed script com dados reais
Criar `apps/web/prisma/seed.ts` com seus decks reais:
- Subject: "Master's Thesis" (OGUM, VANTs, simulation)
- Subject: "English" (vocabulary, phrasal verbs, grammar)
- Subject: "TypeScript" (tipos, generics, utility types)

Rodar com:
```bash
npx prisma db seed
```

### DB-4: Deploy da migração em produção
```bash
# No servidor ou via CI
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

---

## Fase 5 — Subjects (organização multi-assunto) (SEMANA 3)

Seguir as stories S-1 a S-5 do BACKLOG.md.

Resumo:
- Home vira lista de Subjects
- `/subjects/[subjectId]` lista os decks do subject
- Deck tem `subjectId` (já no schema Prisma)

---

## Fase 6 — Qualidade (SEMANA 4+)

- Testes com Vitest (unit) e Playwright (e2e)
- Error boundaries no React
- Loading states mais ricos
- Otimização de bundle (next/dynamic para componentes pesados)

---

## Estado atual dos arquivos CI/CD

```
mnemosine-flashcards/
├── Dockerfile                     ✅ criado
├── .dockerignore                  ✅ criado
├── apps/web/
│   ├── next.config.ts             ✅ output: standalone adicionado
│   ├── .env.local                 ✅ criado (não commitado)
│   └── prisma/
│       └── schema.prisma          ✅ criado
├── .github/
│   └── workflows/
│       └── ci-cd.yml              ✅ criado
└── k8s/
    ├── namespace.yaml             ✅ criado
    ├── deployment.yaml            ✅ criado
    ├── service.yaml               ✅ criado
    ├── ingressroute.yaml          ✅ criado
    ├── argocd-app.yaml            ✅ criado
    └── secret-template.yaml       ✅ criado (não aplicar — é template)
```

## Ações manuais que precisam ser feitas UMA VEZ no cluster

```bash
# 1. Criar o banco em produção
ssh ubuntu@192.168.30.121
docker exec shared-postgres psql -U postgres -c "CREATE DATABASE mnemosine;"

# 2. Criar o Secret K8s
kubectl create secret generic mnemosine-secret \
  --namespace mnemosine \
  --from-literal=database-url="postgresql://postgres:SENHA@192.168.30.121:5432/mnemosine"

# 3. Registrar no ArgoCD
kubectl apply -f k8s/argocd-app.yaml

# 4. DNS no Cloudflare: CNAME flashcards → antoniopedro.com.br
```

Depois dessas 4 ações: cada `git push origin main` deploya automaticamente.
