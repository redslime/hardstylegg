# Hardstyle.gg

## Easy way (Docker)

1. Install Docker
2. Populate .env file with valid values (Discord secrets)
3. Execute following command in the root directory:


```shell
docker compose up -d
```

or to force a build of the Dockerimage

```shell
docker compose up -d --build
```
    "build": "nuxt build",
    "dev": "nuxt dev",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare",
    "generate-prisma": "npx prisma generate",
    "seed-prisma": "tsx prisma/seed.ts",
    "push-prisma": "npx prisma db push"
},
## Hard way

1. Populate .env file with valid values (Discord secrets)
2. Install dependencies
```shell
   npm install
```
3. Generate prisma files
```shell
npm run generate-prisma
```
4. Generate nuxt files
```shell
npm run generate
```
5. Setup MySQL server and edit server string in .env

6. Push Prisma migrations
```shell
npm run push-prisma
```
7. Seed database
```shell
npm run seed-prisma
```
8. Run server
```shell
npm run dev
```