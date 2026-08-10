import "dotenv/config";
import {defineConfig} from "prisma/config";

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

const DATABASE_URL = `mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

export default defineConfig({
    schema: "prisma/schema.prisma",
    datasource: {
        url: DATABASE_URL
    },
    migrations: {
        path: "prisma/migrations"
    }
});