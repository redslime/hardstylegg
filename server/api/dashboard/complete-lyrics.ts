import prisma from "~/lib/prisma";
import type {CompleteLyricsContainer} from "~/types/gameModels";

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)
    const instances = await prisma.game_complete_lyrics.findMany({
        where: {
            ...(user.admin ? { } : {
                OR: [
                    {
                        created_by: user.id
                    },
                    {
                        id: 1
                    }
                ]
            })
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
        const { track_id, ...rest } = i
        const track = tracks.find(t => t.sid === track_id)
        return <CompleteLyricsContainer>{
            ...rest,
            track
        }
    })
})