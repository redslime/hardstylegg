# Build Stage 1

FROM node:22-alpine AS build
WORKDIR /app

# Copy package.json and your lockfile, here we add pnpm-lock.yaml for illustration
COPY package.json package-lock.json ./

# Install dependencies
RUN npm i

# Copy the entire project
COPY . ./

RUN npm run generate-prisma

run npm run generate

# Change the port and host
ENV PORT=80
ENV HOST=0.0.0.0

EXPOSE 80

CMD ["sh", "-c", "npm run push-prisma && npm run seed-prisma && npm run dev"]
