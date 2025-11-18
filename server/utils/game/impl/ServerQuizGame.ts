import {ServerGameDef} from "~/server/utils/game/ServerGameDef";
import type {QuizContainer} from "~/types/gameModels";
import {GAME_METAS} from "#shared/games";
import type {User} from "#auth-utils";
import prisma from "~/lib/prisma";

export class ServerQuizGame extends ServerGameDef<QuizContainer> {

    constructor() {
        super(GAME_METAS.Quiz);
    }

    override async fetchAllInstances(user: User): Promise<QuizContainer[]> {
        const parents = await prisma.game_quiz.findMany(this.whereAdminOrCreator(user))
        const items = await prisma.game_quiz_item.findMany()

        const mapped = parents.map(parent => {
            return {
                ...parent,
                items: items.filter(item => item.parent_id === parent.id)
            }
        })

        return <QuizContainer[]> mapped
    }

    override async fetchInstance(gameId: number): Promise<QuizContainer> {
        const parent = await prisma.game_quiz.findUnique({ where: { id: gameId } })
        const items = await prisma.game_quiz_item.findMany({ where: { parent_id: gameId } })
        return <QuizContainer>{
            id: parent!!.id,
            created_by: parent!!.created_by,
            title: parent!!.title,
            items: items
        }
    }

    override async createInstance(instance: QuizContainer): Promise<QuizContainer> {
        const fetched = await prisma.game_quiz.create({
            data: {
                title: instance.title,
                created_by: instance.created_by!!,
                game_quiz_item: {
                    create: instance.items.map(item => {
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
    }

    override async updateInstance(instance: QuizContainer): Promise<QuizContainer> {
        const fetched = await prisma.game_quiz.update({
            where: { id: instance.id },
            data: {
                title: instance.title,
                game_quiz_item: {
                    // delete all old items not in new list
                    deleteMany: {
                        id: { notIn: instance.items.filter((i) => i.id).map((i) => i.id!) },
                    },
                    // upsert all new/updated items
                    upsert: instance.items.map((item) => ({
                        where: { id: item.id ?? -1 }, // if id missing, won't match existing
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

    override async deleteInstance(gameId: number): Promise<any> {
        return await prisma.game_quiz.delete(this.whereGameId(gameId))
    }

    override getPreviewIcon(): string {
        return '<path stroke="currentColor" fill="none" stroke-width="1.5" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />'
    }
}