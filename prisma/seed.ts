import { PrismaClient } from '../generated/prisma/client'
const prisma = new PrismaClient()

const seedUsers = [{discordId: "327550189529202688", name:"Kurza"}]

async function main() {
    for (let user of seedUsers) {
        await prisma.user.upsert({
            where: { discord_id: user.discordId},
            update: {},
            create: {
                discord_id: user.discordId,
                admin: true,
                name: user.name
            }
        })
    }
}
main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })