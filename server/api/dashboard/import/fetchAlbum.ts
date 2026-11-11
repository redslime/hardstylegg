import type {RichAlbum, RichTrack} from "~/types/content.ts";
import {createError} from "h3";
import {fetchAllPages, getSpotifyApi} from "#server/utils/spotify.ts";
import {getOrFetchArtistImages} from "#server/utils/content.ts";
import prisma from "~/lib/prisma.ts";
import type { SimplifiedTrack } from "@spotify/web-api-ts-sdk";
import {invalidateCacheKeys} from "#server/utils/cacheKeys.ts";

export default defineEventHandler(async (event) => {
    try {
        const {user} = await requireUserSession(event)

        if (!user.admin) return createError({
            statusCode: 403,
            statusMessage: 'Unauthorized'
        })

        const { albumId } = getQuery(event)
        if(!albumId) return createError({
            statusCode: 400,
            statusMessage: 'albumId required'
        })

        const album = await getSpotifyApi().albums.get(albumId as string)
        if(!album) return createError({
            statusCode: 404,
            statusMessage: 'Album not found'
        })

        const releaseDate = new Date(album.release_date)
        const coverArt = album.images[0]?.url?.replace("https://i.scdn.co/image/", "")
        const tracks = await fetchAllPages<SimplifiedTrack>(album.tracks)
        const artistIds = [...new Set([
            ...album.artists.map(a => a.id),
            ...tracks.flatMap(t => t.artists.map(a => a.id))])]
        const artistImages = await getOrFetchArtistImages(artistIds)

        // first upsert the tracks, then create the album
        await Promise.all(tracks.map(t => prisma.track.upsert({
            where: {
                sid: t.id
            },
            create: {
                sid: t.id,
                title: t.name,
                date: releaseDate,
                cover_art: coverArt,
                hidden: false,
                track_artist: {
                    create: t.artists.map((artist) => ({
                        artist: {
                            connectOrCreate: {
                                where: {
                                    id: artist.id
                                },
                                create: {
                                    id: artist.id,
                                    name: artist.name,
                                    image: artistImages[artist.id]
                                }
                            }
                        },
                    })),
                }
            },
            update: {
                sid: t.id,
                title: t.name,
                date: releaseDate,
                cover_art: coverArt,
                hidden: false,
                track_artist: {
                    deleteMany: {},
                    create: t.artists.map((artist) => ({
                        artist: {
                            connectOrCreate: {
                                where: {
                                    id: artist.id
                                },
                                create: {
                                    id: artist.id,
                                    name: artist.name,
                                    image: artistImages[artist.id]
                                }
                            }
                        },
                    })),
                }
            },
            include: {
                track_artist: {
                    include: {
                        artist: true,
                    },
                },
            }
        })))

        const rec = await prisma.album.upsert({
            where: {
                sid: album.id
            },
            create: {
                sid: album.id,
                title: album.name,
                date: releaseDate,
                cover_art: coverArt,
                hidden: false,
                album_artist: {
                    create: album.artists.map((artist) => ({
                        artist: {
                            connectOrCreate: {
                                where: {
                                    id: artist.id
                                },
                                create: {
                                    id: artist.id,
                                    name: artist.name,
                                    image: artistImages[artist.id]
                                }
                            }
                        },
                    })),
                },
                album_track: {
                    create: tracks.map((t, index) => ({
                        track_id: t.id,
                        index: index,
                    }))
                }
            },
            update: {
                sid: album.id,
                title: album.name,
                date: releaseDate,
                cover_art: coverArt,
                hidden: false,
                album_artist: {
                    deleteMany: {},
                    create: album.artists.map((artist) => ({
                        artist: {
                            connectOrCreate: {
                                where: {
                                    id: artist.id
                                },
                                create: {
                                    id: artist.id,
                                    name: artist.name,
                                    image: artistImages[artist.id]
                                }
                            }
                        },
                    })),
                },
                album_track: {
                    deleteMany: {},
                    create: tracks.map((t, index) => ({
                        track_id: t.id,
                        index: index,
                    }))
                }
            },
            include: {
                album_artist: {
                    include: {
                        artist: true
                    }
                },
                album_track: {
                    include: {
                        track: {
                            include: {
                                track_artist: {
                                    include: {
                                        artist: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        invalidateCacheKeys()

        return <RichAlbum>{
            sid: rec.sid,
            title: rec.title,
            date: rec.date,
            artists: rec.album_artist.map(a => a.artist),
            tracks: rec.album_track.map(t => t.index)
                .sort((n1, n2) => n1 - n2) // ensure the index order is kept
                .map(i => rec.album_track.find(t => t.index === i)!.track)
                .map(t => <RichTrack>{
                    sid: t.sid,
                    title: t.title,
                    date: t.date,
                    artists: t.track_artist.map(a => a.artist),
                    image: t.cover_art,
                    hidden: t.hidden
                }),
            image: rec.cover_art,
            hidden: rec.hidden
        }
    } catch (err: any) {
        // Convert to HTTP error
        const status = err?.statusCode ?? err?.status ?? 500
        const message = err?.message ?? 'Internal Server Error'
        console.error("fetchAlbum error: ", err)
        return createError({ statusCode: status, statusMessage: message })
    }
})