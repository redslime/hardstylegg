import {type QuizContainer} from "~/types/gameModels";
import {validateQuiz} from "~/utils/gameValidators"
import {defineEventHandler, readBody} from 'h3'
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)
    const quiz = await readBody<QuizContainer>(event)
    const errors: string[] = validateQuiz(quiz)

    if(errors.length > 0) {
        return [...errors]
    }

    if(!quiz.id) {
        // create new quiz
        const fetched = await prisma.game_quiz.create({
            data: {
                title: quiz.title,
                created_by: quiz.created_by!!,
                game_quiz_item: {
                    create: quiz.items.map(item => {
                        return {
                            text: item.text,
                            correct: item.correct
                        }
                    })
                }
            },
            include: { game_quiz_item: true }
        })
        const { game_quiz_item, ...rest } = fetched
        return <QuizContainer>{
            ...rest,
            items: game_quiz_item
        }
    } else {
        // update existing quiz
        const fetched = await prisma.game_quiz.update({
            where: { id: quiz.id },
            data: {
                title: quiz.title,
                created_by: quiz.created_by!!,
                game_quiz_item: {
                    // delete all old items not in new list
                    deleteMany: {
                        id: { notIn: quiz.items.filter((i) => i.id).map((i) => i.id!) },
                    },
                    // upsert all new/updated items
                    upsert: quiz.items.map((item) => ({
                        where: { id: item.id!! }, // if id missing, won't match existing
                        create: {
                            text: item.text,
                            correct: item.correct,
                        },
                        update: {
                            text: item.text,
                            correct: item.correct,
                        },
                    })),
                },
            },
            include: { game_quiz_item: true },
        })

        const { game_quiz_item, ...rest } = fetched
        return <QuizContainer>{
            ...rest,
            items: game_quiz_item
        }
    }
})