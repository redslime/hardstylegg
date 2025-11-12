import {defineEventHandler, readBody} from "h3";
import type {Track} from "~/types/models";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
    const {user} = await requireUserSession(event)
    const track = await readBody<Track>(event)

    return await prisma.track.delete({
        where: {
            sid: track.sid
        }
    })
})