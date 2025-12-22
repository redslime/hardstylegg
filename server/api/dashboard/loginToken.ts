import prisma from "~/lib/prisma";
import {registerSeedIntent} from "~/server/utils/loginTokenManager";

export default defineEventHandler(async (event) => {
    const users = await prisma.user.findMany()

    if(users.length === 0) {
        await registerSeedIntent()
        return true
    }

    return false
})