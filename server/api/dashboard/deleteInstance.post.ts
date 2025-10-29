import prisma from "~/lib/prisma";
import {readBody} from "h3";
import type {QuizContainer} from "~/types/gameModels";

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)

    if(user.admin) {
        const { typeId, gameId } = await readBody<{ typeId: number, gameId: number }>(event)

        switch (typeId) {
            case 1: {
                return await prisma.game_artwork.delete({
                    where: {
                        id: gameId
                    }
                })
            }
            case 2: {
                return await prisma.game_complete_album.delete({
                    where: {
                        id: gameId
                    }
                })
            }
            case 3: {
                return await prisma.game_complete_lyrics.delete({
                    where: {
                        id: gameId
                    }
                })
            }
            case 4: {
                return await prisma.game_heardle.delete({
                    where: {
                        id: gameId
                    }
                })
            }
            case 5: {
                return await prisma.game_namex.delete({
                    where: {
                        id: gameId
                    }
                })
            }
            case 6: {
                return await prisma.game_order.delete({
                    where: {
                        id: gameId
                    }
                })
            }
            case 7: {
                return <QuizContainer> await prisma.game_quiz.delete({
                    where: {
                        id: gameId
                    }
                })
            }
            case 8: {
                return await prisma.game_timeline.delete({
                    where: {
                        id: gameId
                    }
                })
            }
            case 9: {
                return await prisma.game_timetable.delete({
                    where: {
                        id: gameId
                    }
                })
            }
        }
    } else {
        throw createError({
            statusCode: 403,
            message: 'Forbidden'
        })
    }
})