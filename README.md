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
This doesn't represent the order in which files should be created as they are very interlinked but rather serves as an overview:

### Game registration
1. Create a new container at `/types/gameModels.ts`. It essentially holds all the dynamic information about the game that is stored in the database, thus it should be very close to the table schema that you may have made already.
2. Register the game in `/shared/games.ts`, you will need a validator that should be placed in `/shared/gameValidators.ts`.
3. Create the client and server definitions in `/utils/game/impl/` and `/server/utils/game/impl/` respectively and implement its methods (to do this, you need to have made the components below first).

### Components
1. In `components/games/` create a new folder for your game.
2. Implement all relevant components in this folder, see existing ones for reference.

### Database
1. Create a new table according to your container needs.
