# Dockerfile for the dev environment
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm i
COPY . ./

RUN npm run generate-prisma
run npm run generate

ENV PORT=80
ENV HOST=0.0.0.0
EXPOSE 80

CMD ["sh", "-c", "npm run push-prisma && npm run seed-prisma && npm run dev"]
