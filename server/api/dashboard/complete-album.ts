import prisma from "~/lib/prisma";
import type {CompleteAlbumContainer} from "~/types/gameModels";

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)
    const instances = await prisma.game_complete_album.findMany({
        where: {
            OR: [
                {
                    ...(user.admin ? {} : { created_by: user.id })
                },
                {
                    id: 1
                }
            ]
        }
    })

    const albums = await prisma.album.findMany({
        where: {
            sid: {
                in: instances.map(i => i.album_id ?? "")
            }
        }
    })
    const items = await prisma.game_complete_album_item.findMany({
        where: {
            parent_id: {
                in: instances.map(i => i.id)
            }
        }
    })

    return instances.map(i => {
        return <CompleteAlbumContainer>{
            id: i.id,
            created_by: i.created_by,
            album: albums.find(a => a.sid === i.album_id),
            items: items.filter(item => item.parent_id === i.id)
        }
    })
})