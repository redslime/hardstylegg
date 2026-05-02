import {createError, defineEventHandler, getQuery} from 'h3'
import {getSpotifyApi, requestWithRetry} from "~/server/utils/spotify";
import type {Artist, SimplifiedAlbum, SimplifiedArtist, SimplifiedTrack} from "@spotify/web-api-ts-sdk";
import prisma from "~/lib/prisma";
import type {InboxAlbum, InboxArtist, InboxTrack} from "~/types/models";
import {invalidateCacheKeys} from "~/server/utils/cacheKeys";
import {RichArtist} from "~/types/content";

function mapAlbum(album: SimplifiedAlbum, tracks: SimplifiedTrack[]): InboxAlbum {
    return <InboxAlbum>{
        sid: album.id,
        title: album.name,
        artists: album.artists.map(a => mapArtist(a)),
        tracks: tracks.map(t => mapTrack(t, album)),
        date: new Date(album.release_date),
        cover_art: album.images[0]?.url?.replace("https://i.scdn.co/image/", ""),
        hidden: false
    }
}

function mapTrack(track: SimplifiedTrack, album: SimplifiedAlbum): InboxTrack {
    return <InboxTrack>{
        sid: track.id,
        title: track.name,
        artists: track.artists.map(a => mapArtist(a)),
        date: new Date(album.release_date),
        cover_art: album.images[0]?.url?.replace("https://i.scdn.co/image/", ""),
        hidden: false
    }
}

function mapArtist(artist: Artist | SimplifiedArtist): InboxArtist {
    return <InboxArtist>{
        id: artist.id,
        name: artist.name
    }
}

export default defineEventHandler(async (event) => {
    try {
        const { user } = await requireUserSession(event)

        if (!user.admin) return createError({
            statusCode: 403,
            statusMessage: 'Unauthorized'
        })

        const { artistId } = getQuery(event)
        if (!artistId) {
            return createError({ statusCode: 400, statusMessage: 'artistId required' })
        }

        const albums: InboxAlbum[] = []
        const tracks: InboxTrack[] = []

        let total = 1 // cause the while to run at least once
        let collected = 0
        let offset = 0

        while(collected < total) {
            const data = await requestWithRetry(() => getSpotifyApi().artists.albums(artistId as string, "album,single", undefined, 50, offset))
            total = data.total

            for (const item of data.items) {
                const childItems = await requestWithRetry(() => getSpotifyApi().albums.tracks(item.id))

                if(item.album_type === "album") {
                    albums.push(mapAlbum(item, childItems.items))
                }

                tracks.push(...childItems.items.map(track => mapTrack(track, item)))
            }

            collected += data.items.length
            offset += data.items.length
        }

        tracks.sort((a, b) => b.date.getTime() - a.date.getTime())

        // insert artist
        const artist = await getSpotifyApi().artists.get(artistId as string)
        await prisma.artist.upsert({
            where: { id: artist.id },
            create: {
                id: artist.id,
                name: artist.name,
                image: artist.images[0]?.url?.replace("https://i.scdn.co/image/", "")
            },
            update: {
                name: artist.name,
                image: artist.images[0]?.url?.replace("https://i.scdn.co/image/", "")
            }
        })
        invalidateCacheKeys()

        // Push to inbox
        await prisma.radar_inbox.createMany({
            data: albums.map(album => {
                return {
                    content_id: album.sid,
                    added_on: new Date(1970, 1, 1),
                    album: true,
                    data: JSON.stringify(album)
                }
            }),
            skipDuplicates: true
        })

        await prisma.radar_inbox.createMany({
            data: tracks.map(track => {
                return {
                    content_id: track.sid,
                    added_on: new Date(1970, 1, 1),
                    album: false,
                    data: JSON.stringify(track)
                }
            }),
            skipDuplicates: true
        })

        return <RichArtist>{
            id: artist.id,
            name: artist.name,
            image: artist.images[0]?.url?.replace("https://i.scdn.co/image/", "")
        }
    } catch (err: any) {
        // Convert to HTTP error
        const status = err?.statusCode ?? err?.status ?? 500
        const message = err?.message ?? 'Internal Server Error'
        return createError({ statusCode: status, statusMessage: message })
    }
})
