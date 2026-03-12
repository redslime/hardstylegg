import {defineEventHandler, readBody} from "h3";
import {RichArtist} from "~/types/content";
import {invalidateCacheKeys} from "~/server/utils/cacheKeys";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event): Promise<RichArtist> => {
    const {user} = await requireUserSession(event)
    const { from, to } = await readBody<{ from: RichArtist, to: RichArtist}>(event)

    if (!user.admin) {
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden"
        })
    }

    if (from.id === to.id) {
        throw createError({
            statusCode: 400,
            statusMessage: "Source and target artist must be different"
        })
    }

    invalidateCacheKeys()

    await prisma.$transaction(async (tx) => {
        const overlappingTrackLinks = await tx.track_artist.findMany({
            where: {
                artist_id: from.id,
                track: {
                    track_artist: {
                        some: {
                            artist_id: to.id
                        }
                    }
                }
            },
            select: {
                track_id: true
            }
        })

        if (overlappingTrackLinks.length > 0) {
            await tx.track_artist.deleteMany({
                where: {
                    artist_id: from.id,
                    track_id: {
                        in: overlappingTrackLinks.map(link => link.track_id)
                    }
                }
            })
        }

        await tx.track_artist.updateMany({
            where: {
                artist_id: from.id
            },
            data: {
                artist_id: to.id
            }
        })

        const overlappingAlbumLinks = await tx.album_artist.findMany({
            where: {
                artist_id: from.id,
                album: {
                    album_artist: {
                        some: {
                            artist_id: to.id
                        }
                    }
                }
            },
            select: {
                album_id: true
            }
        })

        if (overlappingAlbumLinks.length > 0) {
            await tx.album_artist.deleteMany({
                where: {
                    artist_id: from.id,
                    album_id: {
                        in: overlappingAlbumLinks.map(link => link.album_id)
                    }
                }
            })
        }

        await tx.album_artist.updateMany({
            where: {
                artist_id: from.id
            },
            data: {
                artist_id: to.id
            }
        })

        await tx.artist.delete({
            where: {
                id: from.id
            }
        })
    })

    return to
})