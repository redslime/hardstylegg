import {PrismaClient} from '~/generated/prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if(id !== null) {
        const quizId = parseInt(id!!)
        const quiz = await prisma.game_quiz.findUnique({
            where: {
                id: quizId
            }
        })
        let items = await prisma.game_quiz_item.findMany({
            select: {
                text: true,
                correct: true
            },
            where: {
                parent_id: quizId
            }
        })

        return {
            ...quiz,
            answers: items
        }
    }

    return {}
})