import {readBody} from "h3";
import type {Track} from "~/types/models";
import prisma from "~/lib/prisma";
import {invalidateCacheKeys} from "~/server/utils/cacheKeys";

export default defineEventHandler(async (event) => {
    const {user} = await requireUserSession(event)

    if (user.admin) {
        const track = await readBody<Track>(event)

        console.log("received track:")
        console.log(track)

        await prisma.track.upsert({
            where: {
                sid: track.sid
            },
            update: track,
            create: track
        })

        invalidateCacheKeys()
        console.log(user.name, "imported track:", track.title)
        return true
    } else {
        return createError({
            statusCode: 403,
            statusMessage: "Forbidden"
        })
    }
})