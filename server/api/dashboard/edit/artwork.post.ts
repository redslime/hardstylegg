import {defineEventHandler, readBody} from "h3";
import type {ArtworkContainer} from "~/types/gameModels";
import {validateArtwork} from "~/utils/gameValidators";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
    const {user} = await requireUserSession(event)
    const artwork = await readBody<ArtworkContainer>(event)
    const errors: string[] = validateArtwork(artwork)

    if(errors.length > 0) {
        return [...errors]
    }

    if(!artwork.id) {
        // create new
        const fetched = await prisma.game_artwork.create({
            data: {
                created_by: artwork.created_by!!,
                track_id: artwork.track.sid,
                artwork_blank: artwork.artwork_blank
            }
        })
        const { track_id, ...rest } = fetched
        return <ArtworkContainer>{
            ...rest,
            track: artwork.track
        }
    } else {
        // update existing
        const fetched = await prisma.game_artwork.update({
            where: {id: artwork.id},
            data: {
                track_id: artwork.track.sid,
                artwork_blank: artwork.artwork_blank
            }
        })
        const {track_id, ...rest} = fetched
        return <ArtworkContainer>{
            ...rest,
            track: artwork.track
        }
    }
})