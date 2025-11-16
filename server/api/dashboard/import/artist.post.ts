import {readBody} from "h3";
import type {Track} from "~/types/models";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
    const {user} = await requireUserSession(event)

    if (user.admin) {
        const { albums, tracks } = await readBody<{ albums: Track[], tracks: Track[] }>(event)

        await prisma.$transaction(
            albums.map(album => prisma.album.upsert({
                where: { sid: album.sid },
                update: {
                    artists: album.artists,
                    title: album.title,
                    year: album.year
                },
                create: album
            }))
        )

        await prisma.$transaction(
            tracks.map(track => prisma.track.upsert({
                where: { sid: track.sid },
                update: {
                    artists: track.artists,
                    title: track.title,
                    year: track.year
                },
                create: track
            }))
        )

        console.log(user.name, "imported:", albums.length, "albums,", tracks.length, "tracks")
        return true
    } else {
        return createError({
            statusCode: 403,
            statusMessage: "Forbidden"
        })
    }
})