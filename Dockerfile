FROM node:25-alpine AS base

FROM base AS builder
RUN apk add --no-cache gcompat
WORKDIR /app
COPY package.json npm-shrinkwrap.json ./
RUN npm ci

COPY src ./src
COPY quotes ./quotes
COPY public ./public

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

COPY --from=builder --chown=hono:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=hono:nodejs /app/src /app/src
COPY --from=builder --chown=hono:nodejs /app/quotes /app/quotes
COPY --from=builder --chown=hono:nodejs /app/public /app/public
COPY --from=builder --chown=hono:nodejs /app/package.json /app/package.json

USER hono
EXPOSE 3000
CMD ["npm", "run", "start"]