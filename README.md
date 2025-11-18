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

# How to add a new game
### Game registration
1. Create a new container at `/models/gameModels.ts`. It essentially holds all the dynamic information about the game that is stored in the database, thus it should be very close to the table schema that you may have made already or not.
2. Register the game in `/shared/games.ts`, you will need a validator that should be placed in `/shared/gameValidators.ts`.
3. Create the client and server definitions in `/utils/game/impl/` and `/server/utils/game/impl/` respectively and implement its methods (to do this, you need to have made the components below first).

### Components
1. In `components/games/` create the frontend for the game itself.
2. In `components/dashboard/preview/` create the dashboard preview for the game.
3. In `pages/admin/game/` create the dashboard editor for the game.

### Database
1. Create a new table according to your container needs.
