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

# How to add a new game
### Client - game
1. Write the game frontend at `components/games/`. See existing components for reference.
2. Any dynamic information from the outside is passed in a container via props. Add the model to `models/gameModels.ts`.
3. Register the game on the client side in `utils/games.ts`

### Client - dashboard
1. Every game needs a validator for the creating and editing process on the dashboard. Add it to `utils/dashboardValidators.ts`.
2. In `util/dashboard.ts` add a cache and getter for the game containers. See existing ones for reference.
3. Add the preview component at `components/dashboard/preview/`.
4. Add the dashboard component at `pages/admin/game/`.
5. Register the dashboard editor at `server/api/dashboard/index.ts`
6. Register the game in `DashboardSelectGame.vue`
7. Register the game in `DashboardGamePreview.vue`

### Database
1. Create a new table according to your container needs.

### Server
1. In `server/api/dashboard/` create an endpoint that responds with all existing instances. This is used for the getter you created in step 2 of client - dashboard above.
2. In `server/api/dashboard/edit/` create a POST endpoint that updates an instance in the database.
3. In `server/utils/games.ts` add the game to the switch statement and add a getInstance method that maps the database instance to the game container.
4. In `deleteInstance.post.ts` add a delete handler.
5. In `server/api/og.ts` add the svg path of the icon. If the game uses detailed embed results, add a handler here too.