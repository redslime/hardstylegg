import {defineEventHandler, readBody} from "h3";
import type {Track} from "~/types/models";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
    const {user} = await requireUserSession(event)
    const track = await readBody<Track>(event)

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