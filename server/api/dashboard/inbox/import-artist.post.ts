import type {InboxArtist} from "~/types/models";
import {getSpotifyApi} from "~/server/utils/spotify";
import {RichArtist} from "~/types/content";

export default defineEventHandler(async (event): Promise<RichArtist> => {
    const artist = await readBody<InboxArtist>(event)
    const {user} = await requireUserSession(event)

    if (!user.admin) {
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden"
        })
    }

    const fetched = await getSpotifyApi().artists.get(artist.id)
    const upserted = await prisma.artist.upsert({
        where: { id: artist.id },
        create: {
            id: artist.id,
            name: fetched.name,
            image: fetched.images[0]?.url?.replace("https://i.scdn.co/image/", "")
        },
        update: {
            name: fetched.name,
            image: fetched.images[0]?.url?.replace("https://i.scdn.co/image/", "")
        }
    })

    return RichArtist.fromJson(upserted)
})