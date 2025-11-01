import prisma from "~/lib/prisma";
import type {QuizContainer} from "~/types/gameModels";

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)
    const parents = await prisma.game_quiz.findMany({
        where: {
            ...(user.admin ? {} : { created_by: user.id })
        }
    })
    const items = await prisma.game_quiz_item.findMany()

    const mapped = parents.map(parent => {
        return {
            ...parent,
            items: items.filter(item => item.parent_id === parent.id)
        }
    })

    return <QuizContainer[]>mapped
})