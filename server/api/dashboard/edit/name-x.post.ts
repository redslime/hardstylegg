import {defineEventHandler, readBody} from "h3";
import type {NameXContainer} from "~/types/gameModels";
import {validateNameX} from "~/utils/gameValidators";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)
    const game = await readBody<NameXContainer>(event)
    const errors: string[] = validateNameX(game)

    if(errors.length > 0) {
        return [...errors]
    }

    if(!game.id) {
        // create new
        const fetched = await prisma.game_namex.create({
            data: {
                created_by: game.created_by!!,
                title: game.title,
                goal: game.goal,
                items: JSON.stringify(game.items.map(i => i.sid))
            }
        })
        const { items, ...rest } = fetched
        return <NameXContainer>{
            ...rest,
            items: game.items
        }
    } else {
        // update existing
        const fetched = await prisma.game_namex.update({
            where: { id: game.id },
            data: {
                created_by: game.created_by,
                title: game.title,
                goal: game.goal,
                items: JSON.stringify(game.items.map(i => i.sid))
            }
        })
        const { items, ...rest } = fetched
        return <NameXContainer>{
            ...rest,
            items: game.items
        }
    }
})