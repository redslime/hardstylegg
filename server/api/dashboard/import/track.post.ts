import {readBody} from "h3";
import prisma from "~/lib/prisma";
import {invalidateCacheKeys} from "~/server/utils/cacheKeys";
import type {RichTrack} from "~/types/content";

export default defineEventHandler(async (event) => {
    const {user} = await requireUserSession(event)

    // todo remodel to also get linked artists and link those too

    if (user.admin) {
        const track = await readBody<RichTrack>(event)

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