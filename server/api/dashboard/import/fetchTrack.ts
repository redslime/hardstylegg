import {createError, defineEventHandler, getQuery} from "h3";
import {getSpotifyApi} from "~/server/utils/spotify";
import {RichArtist, type RichTrack} from "~/types/content";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
    try {
        const {user} = await requireUserSession(event)

        if (!user.admin) return createError({
            statusCode: 403,
            statusMessage: 'Unauthorized'
        })

        const {trackId} = getQuery(event)
        if (!trackId) {
            return createError({statusCode: 400, statusMessage: 'trackId required'})
        }

        const track = await getSpotifyApi().tracks.get(trackId as string)
        const artistIds = track.artists.map(a => a.id)
        const artists = await prisma.artist.findMany({
            where: {
                id: {
                    in: artistIds
                }
            }
        }).then(a => a.map(RichArtist.mapJson))

        if(artistIds.length !== artists.length) {
            // todo import rich artist
        }

        return <RichTrack>{
            sid: track.id,
            title: track.name,
            artists,
            year: parseInt(track.album.release_date.split('-')[0] ?? "1970"),
            image: track.album.images[0]?.url?.replace("https://i.scdn.co/image/", ""),
            hidden: false
        }
    } catch (err: any) {
        // Convert to HTTP error
        const status = err?.statusCode ?? err?.status ?? 500
        const message = err?.message ?? 'Internal Server Error'
        return createError({ statusCode: status, statusMessage: message })
    }
})