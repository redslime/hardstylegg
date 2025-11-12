import {defineEventHandler, readBody} from "h3";
import type {Track} from "~/types/models";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
    const {user} = await requireUserSession(event)
    const album = await readBody<Track>(event)

    return await prisma.album.delete({
        where: {
            sid: album.sid
        }
    })
})