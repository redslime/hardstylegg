import {createError, defineEventHandler, getQuery} from "h3";
import {getSpotifyApi} from "#server/utils/spotify";
import type {RichArtist} from "~/types/content";

export default defineEventHandler(async (event): Promise<RichArtist> => {
        const {user} = await requireUserSession(event)

        if (!user.admin) throw createError({
            statusCode: 403,
            statusMessage: 'Unauthorized'
        })

        const {artistId} = getQuery(event)
        if (!artistId) {
            throw createError({statusCode: 400, statusMessage: 'artistId required'})
        }

        try {
            const fetched = await getSpotifyApi().artists.get(artistId as string)

            return <RichArtist>{
                id: fetched.id,
                name: fetched.name,
                image: fetched.images[0]?.url?.replace("https://i.scdn.co/image/", "") ?? null
            }
        } catch(err: any) {
            const status = err?.statusCode ?? err?.status ?? 500
            const message = err?.message ?? 'Internal Server Error'
            throw createError({ statusCode: status, statusMessage: message })
        }
})