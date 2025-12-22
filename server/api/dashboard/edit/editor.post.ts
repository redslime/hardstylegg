import {defineEventHandler, readBody} from "h3";
import type {Editor} from "~/types/models";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
    const {user} = await requireUserSession(event)
    const editor = await readBody<Editor>(event)

    if(user.admin) {
        return await prisma.user.create({
            data: {
                discord_id: editor.discord_id,
                name: editor.name,
                admin: editor.admin
            }
        })
    } else {
        return createError({
            statusCode: 403,
            statusMessage: "Forbidden"
        })
    }
})