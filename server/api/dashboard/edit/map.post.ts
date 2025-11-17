import {defineEventHandler, readBody} from 'h3'
import prisma from "~/lib/prisma";
import {type MapContainer} from "~/types/gameModels";
import {validateMap} from "~/utils/gameValidators"

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)
    const map = await readBody<MapContainer>(event)
    const errors: string[] = validateMap(map)

    if(errors.length > 0) {
        return [...errors]
    }

    if(!map.id) {
        // create new
        return await prisma.game_map.create({
            data: {
                title: map.title,
                created_by: map.created_by!!,
                goal: map.goal
            }
        })
    } else {
        // update existing
        return await prisma.game_map.update({
            where: { id: map.id },
            data: {
                title: map.title,
                goal: map.goal
            }
        })
    }
})