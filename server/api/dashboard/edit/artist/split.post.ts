import {defineEventHandler, readBody} from "h3";
import {RichArtist} from "~/types/content";
import {invalidateCacheKeys} from "~/server/utils/cacheKeys";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event): Promise<RichArtist[]> => {
    const {user} = await requireUserSession(event)
    const { from, to1, to2 } = await readBody<{ from: RichArtist, to1: RichArtist, to2: RichArtist }>(event)

    if (!user.admin) {
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden"
        })
    }

    if (from.id === to1.id || from.id === to2.id || to1.id === to2.id) {
        throw createError({
            statusCode: 400,
            statusMessage: "All selected artists must be unique."
        })
    }

    invalidateCacheKeys()

    await prisma.$transaction(async (tx) => {
        if (from.id === to1.id || from.id === to2.id || to1.id === to2.id) {
            throw createError({
                statusCode: 400,
                statusMessage: "Artists in split operation must all be different"
            })
        }

        const artists = await prisma.artist.findMany({
            where: {
                id: {
                    in: [from.id, to1.id, to2.id]
                }
            },
            select: {
                id: true
            }
        })

        if (artists.length !== 3) {
            throw createError({
                statusCode: 404,
                statusMessage: "One or more artists do not exist"
            })
        }

        const trackLinks = await tx.track_artist.findMany({
            where: {
                artist_id: from.id
            },
            select: {
                track_id: true
            }
        })

        const albumLinks = await tx.album_artist.findMany({
            where: {
                artist_id: from.id
            },
            select: {
                album_id: true
            }
        })

        if (trackLinks.length > 0) {
            await tx.track_artist.createMany({
                data: trackLinks.map(link => ({
                    track_id: link.track_id,
                    artist_id: to1.id
                })),
                skipDuplicates: true
            })

            await tx.track_artist.createMany({
                data: trackLinks.map(link => ({
                    track_id: link.track_id,
                    artist_id: to2.id
                })),
                skipDuplicates: true
            })

            await tx.track_artist.deleteMany({
                where: {
                    artist_id: from.id
                }
            })
        }

        if (albumLinks.length > 0) {
            await tx.album_artist.createMany({
                data: albumLinks.map(link => ({
                    album_id: link.album_id,
                    artist_id: to1.id
                })),
                skipDuplicates: true
            })

            await tx.album_artist.createMany({
                data: albumLinks.map(link => ({
                    album_id: link.album_id,
                    artist_id: to2.id
                })),
                skipDuplicates: true
            })

            await tx.album_artist.deleteMany({
                where: {
                    artist_id: from.id
                }
            })
        }

        await tx.artist.delete({
            where: {
                id: from.id
            }
        })
    }, {
        timeout: 15 * 1000
        })

    return [to1, to2]
})