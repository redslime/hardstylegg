import prisma from "~/lib/prisma";
import type {ArtworkContainer} from "~/types/gameModels";

export default defineEventHandler(async (event) => {
    const {user} = await requireUserSession(event)
    const instances = await prisma.game_artwork.findMany({
        where: {
            ...(user.admin ? {} : { created_by: user.id })
        }
    })
    const trackIds = instances.map(i => i.track_id)
    const tracks = await prisma.track.findMany({
        where: {
            sid: {
                in: trackIds
            }
        }
    })
    return instances.map(i => {
        return <ArtworkContainer>{
            id: i.id,
            created_by: i.created_by,
            artwork_blank: i.artwork_blank,
            track: tracks.find(t => t.sid === i.track_id),
        }
    })
})