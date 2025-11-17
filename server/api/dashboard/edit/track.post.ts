import {defineEventHandler, readBody} from "h3";
import type {Track} from "~/types/models";
import prisma from "~/lib/prisma";
import {invalidateCacheKeys} from "~/server/utils/cacheKeys";

export default defineEventHandler(async (event) => {
    const {user} = await requireUserSession(event)
    const track = await readBody<Track>(event)

    invalidateCacheKeys()
    return await prisma.track.update({
        where: {
            sid: track.sid
        },
        data: {
            title: track.title,
            artists: track.artists,
            year: track.year
        }
    })
})