import {PrismaClient} from '~/generated/prisma/client'
import {PrismaMariaDb} from "@prisma/adapter-mariadb";

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
const adapter = new PrismaMariaDb({
    host: DB_HOST,
    port: parseInt(DB_PORT ?? "3306"),
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
    connectTimeout: 5_000,
    idleTimeout: 300
})
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma