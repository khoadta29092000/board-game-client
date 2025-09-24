# syntax=docker/dockerfile:1
FROM --platform=linux/amd64 node:20.13.0-alpine AS base
WORKDIR /usr/src/app

# Install build tools & enable corepack (Yarn)
RUN apk add --no-cache g++ make python3 py3-pip \
 && corepack enable

# Install all dependencies (dev + prod) into a temp folder
FROM base AS install-deps
WORKDIR /temp/dev
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Install only production dependencies into a separate temp folder
FROM base AS install-prod
WORKDIR /temp/prod
COPY package.json yarn.lock ./
ENV NODE_ENV=production
RUN yarn install --production --frozen-lockfile

# Copy dev deps for build, then build the project
FROM base AS build
WORKDIR /usr/src/app
COPY --from=install-deps /temp/dev/node_modules ./node_modules
COPY . .
RUN yarn build

# Final image: only prod deps + built output
FROM base AS release
WORKDIR /usr/src/app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 --ingroup nodejs nextjs

# Prod deps
COPY --from=install-prod /temp/prod/node_modules ./node_modules

# Static assets & locales
COPY --from=build /usr/src/app/public ./public
# COPY --from=build --chown=nextjs:nodejs /usr/src/app/locales ./

# Next.js standalone build
RUN mkdir .next && chown nextjs:nodejs .next
COPY --from=build --chown=nextjs:nodejs /usr/src/app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /usr/src/app/.next/static ./.next/static

# Copy necessary JSON/JS/TS files
COPY --from=build --chown=nextjs:nodejs /usr/src/app/*.json /usr/src/app/*.js /usr/src/app/*.ts ./

USER nextjs
EXPOSE 3000/tcp

ENTRYPOINT ["node", "server.js"]
