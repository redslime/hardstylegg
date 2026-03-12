import {defineEventHandler, readBody} from "h3";
import prisma from "~/lib/prisma";
import {invalidateCacheKeys} from "~/server/utils/cacheKeys";
import {RichArtist} from "~/types/content";

export default defineEventHandler(async (event) => {
    const {user} = await requireUserSession(event)
    const artist = await readBody<RichArtist>(event).then(RichArtist.mapJson)

    if(!user.admin) {
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden"
        })
    }

    invalidateCacheKeys()
    return await prisma.artist.upsert({
        where: {
            id: artist.id
        },
        create: {
            id: artist.id,
            name: artist.name,
            image: artist.image
        },
        update: {
            name: artist.name,
            image: artist.image
        }
    })
})