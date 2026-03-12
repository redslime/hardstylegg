import {defineEventHandler, readBody} from "h3";
import prisma from "~/lib/prisma";
import {invalidateCacheKeys} from "~/server/utils/cacheKeys";
import {RichAlbum} from "~/types/content";

export default defineEventHandler(async (event) => {
    const {user} = await requireUserSession(event)
    const album = await readBody<RichAlbum>(event)

    invalidateCacheKeys()
    return await prisma.album.delete({
        where: {
            sid: album.sid
        }
    })
})