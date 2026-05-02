import type {InboxAlbum, InboxItem, InboxTrack} from "~/types/models";
import prisma from "~/lib/prisma";
import type {TransactionClient} from "~/generated/prisma/internal/prismaNamespace";
import {invalidateCacheKeys} from "~/server/utils/cacheKeys";

export default defineEventHandler(async (event) => {
    const items = await readBody<InboxItem[]>(event)
    const {user} = await requireUserSession(event)

    if (!user.admin) {
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden"
        })
    }

    for(const item of items) {
        const isAlbum = "tracks" in item

        await prisma.$transaction(async (tx) => {
            if(!isAlbum) {
                await upsertTrack(tx, item as InboxTrack)
            } else {
                await upsertAlbum(tx, item as InboxAlbum)
            }

            await tx.radar_inbox.delete({
                where: {
                    content_id: item.sid
                }
            })
        })

        invalidateCacheKeys()
    }
})

async function upsertAlbum(tx: TransactionClient, album: InboxAlbum) {
    for(const t of album.tracks) {
        await upsertTrack(tx, t);
    }

    await tx.album.upsert({
        where: { sid: album.sid },
        create: {
            sid: album.sid,
            title: album.title,
            date: album.date,
            cover_art: album.cover_art,
            hidden: album.hidden ?? false,
            album_artist: {
                create: album.artists.map(a => ({
                    artist: {
                        connect: { id: a.id }
                    }
                }))
            },
            album_track: {
                create: album.tracks.map((t, index) => ({
                    index,
                    track: {
                        connect: { sid: t.sid }
                    }
                }))
            }
        },
        update: {
            title: album.title,
            date: album.date,
            cover_art: album.cover_art,
            hidden: album.hidden ?? false,
            album_artist: {
                deleteMany: {},
                create: album.artists.map((artist) => ({
                    artist: {
                        connect: {id: artist.id}
                    }
                }))
            },
            album_track: {
                deleteMany: {},
                create: album.tracks.map((track, index) => ({
                    index,
                    track: {
                        connect: {sid: track.sid}
                    }
                }))
            }
        }
    })
}

async function upsertTrack(tx: TransactionClient, track: InboxTrack) {
    await tx.track.upsert({
        where: { sid: track.sid },
        create: {
            sid: track.sid,
            title: track.title,
            date: track.date,
            cover_art: track.cover_art,
            hidden: track.hidden ?? false,
            track_artist: {
                create: track.artists.map(a => ({
                    artist: {
                        connect: { id: a.id }
                    }
                }))
            }
        },
        update: {
            sid: track.sid,
            title: track.title,
            date: track.date,
            cover_art: track.cover_art,
            hidden: track.hidden ?? false,
            track_artist: {
                deleteMany: {},
                create: track.artists.map(a => ({
                    artist: {
                        connect: { id: a.id }
                    }
                }))
            }
        }
    })
}