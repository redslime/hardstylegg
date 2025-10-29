import {defineEventHandler, readBody} from 'h3'
import {PrismaClient} from '~/generated/prisma/client'
import {type TimelineContainer, validateTimeline} from "~/types/gameModels";

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)
    const timeline = await readBody<TimelineContainer>(event)
    const errors: string[] = validateTimeline(timeline)

    if(errors.length > 0) {
        return [...errors]
    }

    if(!timeline.id) {
        // create new
        return await prisma.game_timeline.create({
            data: {
                title: timeline.title,
                created_by: timeline.created_by!!,
                goal: timeline.goal
            }
        })
    } else {
        // update existing
        return await prisma.game_timeline.update({
            where: { id: timeline.id },
            data: {
                title: timeline.title,
                goal: timeline.goal
            }
        })
    }
})