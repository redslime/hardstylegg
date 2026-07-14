# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated/prisma/*.node ./generated/prisma/

# install prisma to run migrations later
RUN npm install prisma --omit=dev

ENV HOST=0.0.0.0
ENV PORT=80
EXPOSE 80

CMD ["node", ".output/server/index.mjs"]