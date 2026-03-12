import {defineEventHandler, readBody} from "h3";
import prisma from "~/lib/prisma";
import {invalidateCacheKeys} from "~/server/utils/cacheKeys";
import type {RichTrack} from "~/types/content";

export default defineEventHandler(async (event) => {
    const {user} = await requireUserSession(event)
    const track = await readBody<RichTrack>(event)

    invalidateCacheKeys()
    return await prisma.track.delete({
        where: {
            sid: track.sid
        }
    })
})