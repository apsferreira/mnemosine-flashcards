# =============================================================================
# Mnemosine Flashcards — Next.js 16 (monorepo com npm workspaces)
#
# Estrutura do monorepo:
#   /                        ← raiz do workspace
#   ├── apps/web/            ← Next.js app
#   └── packages/core/       ← algoritmo FSRS-6 (TypeScript puro)
#
# Por que 3 estágios?
#   deps    → instala dependências (cache — muda raramente)
#   builder → compila o Next.js (muda a cada push)
#   runner  → imagem mínima de produção (sem devDependencies, sem fontes)
# =============================================================================

# ─── Stage 1: deps ────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copia só os package.json de todos os workspaces.
# Docker faz cache desta camada — só reinstala quando algum package.json mudar.
COPY package.json package-lock.json ./
COPY packages/core/package.json ./packages/core/
COPY apps/web/package.json ./apps/web/

RUN npm ci

# ─── Stage 2: builder ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Reutiliza node_modules do estágio anterior (já instalado e em cache)
COPY --from=deps /app/node_modules ./node_modules

# Copia o código fonte completo
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Compila o Next.js via script do workspace raiz
# output: 'standalone' gera apps/web/.next/standalone/
RUN npm run build:web

# ─── Stage 3: runner ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Usuário não-root por segurança (padrão OWASP)
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# standalone: servidor Node.js auto-contido (inclui packages/core compilado)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./

# Assets estáticos (CSS, JS chunks — servidos diretamente pelo Node.js)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Arquivos públicos (imagens, fontes, favicon)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

# Em monorepo, o server.js fica em apps/web/server.js dentro do standalone
CMD ["node", "apps/web/server.js"]
