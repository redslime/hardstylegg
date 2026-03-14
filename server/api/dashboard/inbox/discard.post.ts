import type {InboxItem} from "~/types/models";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
    const item = await readBody<InboxItem>(event)
    const {user} = await requireUserSession(event)

    if (!user.admin) {
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden"
        })
    }

    console.log("user", user.name, "deleting inbox entry:", item)

    await prisma.radar_inbox.delete({
        where: {
            content_id: item.sid
        }
    })
})