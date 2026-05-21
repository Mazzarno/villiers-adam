FROM node:20-bookworm-slim AS builder

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WEB_URL

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WEB_URL=$NEXT_PUBLIC_WEB_URL

RUN corepack enable

WORKDIR /app

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @villiers-adam/admin build

FROM node:20-bookworm-slim AS runner

ENV NODE_ENV=production
ENV PORT=3002
ENV HOSTNAME=0.0.0.0

WORKDIR /app

COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder /app/apps/admin/public ./apps/admin/public

EXPOSE 3002

CMD ["node", "apps/admin/server.js"]

