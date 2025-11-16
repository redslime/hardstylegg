import {createError, defineEventHandler, getQuery} from "h3";
import {getSpotifyApi} from "~/server/utils/spotify";
import type {Track} from "~/types/models";

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
        return <Track>{
            sid: track.id,
            title: track.name,
            artists: track.artists.map((a: any) => a.name).join(', '),
            year: parseInt(track.album.release_date.split('-')[0] ?? "1970"),
            cover_art: track.album.images[0]?.url?.replace("https://i.scdn.co/image/", "")
        }
    } catch (err: any) {
        // Convert to HTTP error
        const status = err?.statusCode ?? err?.status ?? 500
        const message = err?.message ?? 'Internal Server Error'
        return createError({ statusCode: status, statusMessage: message })
    }
})