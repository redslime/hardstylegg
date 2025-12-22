# Hardstyle.gg

To get started, create your own ``.env`` file based on ``.env.example``.
There are two ways to run the project:
1. Using the Docker Compose setup
2. Setting up a database and running the server manually

## 3rd party prerequisites
1. **Discord app**: Authentication to access the dashboard is handled by Discord OAuth2. For this, you will need an application on the [Discord Developer Portal](https://discord.com/developers/applications).
    Insert the client ID and secret in the `.env` file.
2. **Spotify app (optional)**: To enable fetching of artists and tracks, create a Spotify app on the [Spotify Developer Portal](https://developer.spotify.com/dashboard). 
    Insert the client ID and secret in the `.env` file.

## Docker Setup

This project uses a modular Docker Compose setup based on file inheritance. This allows us to keep a clean base configuration while easily switching between development, IDE-only, and production environments.

### Environment Switching via `.env`

The active configuration is controlled by the `COMPOSE_FILE` variable in your `.env` file. Docker Compose reads this variable and merges the specified files in order.

#### 1. **Local IDE Development** (default & recommended):
  - Runs only the MySQL database in Docker and exposes port `3306`. This allows you to run Nuxt locally on your host machine while connecting to the Dockerized database.
  - Use the script `npm run dev-ide` in this environment to ensure Prisma functions properly.
  - Includes Prisma studio at `http://localhost:5555`.
  - **Note:** You will need to change `DATABASE_URL` in `.env` to point to `localhost:3306` instead of `db:3306`.
    ```dotenv
    COMPOSE_FILE=docker-compose.yml:docker-compose.dev-ide.yml
    ```
   

#### 2. **Local Full Development**:
  - Runs both the database and the Nuxt application within Docker.
  - Includes optional Hot Module Replacement (HMR) and automatic Prisma migrations.
  - Includes Prisma studio at `http://localhost:5555`.
  - To turn on HMR, edit ``docker-compose.dev.yml``.
   ```dotenv
   COMPOSE_FILE=docker-compose.yml:docker-compose.dev.yml
   ```

#### 3. **Production**:
   - Used for deployment. It uses the `Dockerfile` to create a minimized production build and applies migrations via `prisma migrate deploy`.

   ```dotenv
   COMPOSE_FILE=docker-compose.yml:docker-compose.prod.yml
   ```

### Usage

Once you have set the desired `COMPOSE_FILE` in your `.env` file, you can use standard Docker commands without any additional flags:

#### Start the environment
```bash
docker compose up -d
```

#### Stop the environment
```bash
docker compose down
```

## Manual setup

1. Populate .env file with valid values
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

6. Deploy Prisma migrations
```shell
npm run migrate-prisma
```
7. Seed database
```shell
npm run seed-prisma
```
8. Run server
```shell
npm run dev
```

## Starting hardstyle.gg for the first time
- You first want to create your own account to use the dashboard. Go to `/admin` and follow the instructions.
- You may want to adjust the base date from which day ids are calculated at `/server/utils/schedule.ts`.

## First steps on the dashboard
- Populate the track/album database at `/admin/import/tracks` and `/admin/import/albums`.
- Add editors to help you out at `/admin/editors`.
- Create games instances! The first game in every category (with `id=1`) are example games that can't be edited or deleted.
- Schedule these created game instances at `/admin/schedule`.

## How to develop a new game
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
