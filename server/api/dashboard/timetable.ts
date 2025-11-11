import type {TimetableContainer} from "~/types/gameModels";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
    const {user} = await requireUserSession(event)

    const parents = await prisma.game_timetable.findMany({
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
    const items = await prisma.game_timetable_item.findMany()

    return parents.map(parent => {
        const { color_bg, color_text, ...rest } = parent
        return {
            ...rest,
            color_bg: "#" + color_bg,
            color_text: "#" + color_text,
            items: items.filter(item => item.parent_id === parent.id)
        } as TimetableContainer
    })
})