import {defineEventHandler, readBody} from "h3";
import type {CompleteAlbumContainer} from "~/types/gameModels";
import {validateCompleteAlbum} from "~/utils/gameValidators";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)
    const album = await readBody<CompleteAlbumContainer>(event)
    const errors: string[] = validateCompleteAlbum(album)

    if(errors.length > 0) {
        return [...errors]
    }

    if(!album.id) {
        // create new
        const fetched = await prisma.game_complete_album.create({
            data: {
                created_by: album.created_by!!,
                album_id: album.album?.sid,
                game_complete_album_item: {
                    create: album.items.map(item => {
                        return {
                            name: item.name,
                            artist: item.artist,
                            hidden: item.hidden
                        }
                    })
                }
            },
            include: { game_complete_album_item: true }
        })

        const { game_complete_album_item, album_id, ...rest } = fetched
        return <CompleteAlbumContainer>{
            ...rest,
            album: album.album,
            items: game_complete_album_item
        }
    } else {
        // update existing album
        const fetched = await prisma.game_complete_album.update({
            where: { id: album.id },
            data: {
                created_by: album.created_by!!,
                album_id: album.album?.sid,
                game_complete_album_item: {
                    deleteMany: {
                        id: { notIn: album.items.filter((i) => i.id).map((i) => i.id!) },
                    },
                    upsert: album.items.map((item) => ({
                        where: { id: item.id!! },
                        create: {
                            name: item.name,
                            artist: item.artist,
                            hidden: item.hidden
                        },
                        update: {
                            name: item.name,
                            artist: item.artist,
                            hidden: item.hidden
                        },
                    }))
                }
            },
            include: { game_complete_album_item: true }
        })

        const { game_complete_album_item, album_id, ...rest } = fetched
        return <CompleteAlbumContainer>{
            ...rest,
            album: album.album,
            items: game_complete_album_item
        }
    }
})