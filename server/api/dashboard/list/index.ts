import type {List, ListItem} from "~/types/models";
import prisma from "~/lib/prisma";
import {getFlatAlbums, getFlatTracks, getRichArtists} from "~/server/utils/content";

export default defineEventHandler(async (event): Promise<List[]> => {
    const {user} = await requireUserSession(event)

    const fetched = await prisma.list.findMany({
        include: {
            list_item: {
                orderBy: {
                    index: 'asc'
                }
            }
        }
    })

    return mapLists(fetched)
})

export async function mapLists(fetched: ({
    list_item: {
        parent_id: number
        item_id: string
        index: number
        context: string | null
    }[]
} & {
    id: number
    created_by: number
    type: string
    name: string
    description: string | null
    icon: string | null
})[]): Promise<List[]> {
    const artistIds = fetched.filter(r => r.type === 'artist').flatMap(r => r.list_item).map(a => a.item_id)
    const albumIds = fetched.filter(r => r.type === 'album').flatMap(r => r.list_item).map(a => a.item_id)
    const trackIds = fetched.filter(r => r.type === 'track').flatMap(r => r.list_item).map(a => a.item_id)

    const artists = await getRichArtists(artistIds)
    const albums = await getFlatAlbums(albumIds)
    const tracks = await getFlatTracks(trackIds)

    const getItem = (type: string, itemId: string)=> {
        switch(type) {
            case 'artist': return artists.find(a => a.id === itemId)
            case 'album': return albums.find(a => a.sid === itemId)
            case 'track': return tracks.find(a => a.sid === itemId)
        }
    }

    return fetched.map(r => {
        return <List>{
            id: r.id,
            createdBy: r.created_by,
            type: r.type,
            name: r.name,
            description: r.description,
            icon: r.icon,
            items: r.list_item.map(i => {
                return <ListItem>{
                    item: getItem(r.type, i.item_id),
                    index: i.index,
                    context: i.context
                }
            })
        }
    })
}