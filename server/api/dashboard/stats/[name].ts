import {findGameByName} from "~/server/utils/game/serverGameRegistry";
import prisma from "~/lib/prisma";
import {getQuery} from "h3";
import type {GameReportFlat} from "~/types/models";

export default defineEventHandler(async (event) => {
    await requireUserSession(event)
    const name = event.context.params?.name;

    if(name) {
        const { gid } = getQuery(event)

        if(gid) {
            const gameDef = findGameByName(name)

            if(gameDef) {
                // this endpoint is only called on games in the past, so the reports won't change
                setHeader(event, 'Cache-Control', 'private, max-age=2592000') // 1 month
                const fetched = await prisma.report_item.findMany({
                    select: {
                        success: true,
                        attempts: true,
                        items_completed: true,
                        items_clicked: true,
                        custom: true
                    },
                    where: {
                        AND: [
                            { typeId: gameDef.id },
                            { gameId: parseInt(gid.toString()) }
                        ]
                    }
                })
                return <GameReportFlat[]> fetched.map(report => {
                    return <GameReportFlat>{
                        success: report.success,
                        attempts: report.attempts,
                        itemsCompleted: report.items_completed ? JSON.parse(report.items_completed) as { [key: string]: boolean } : {},
                        itemsClicked: report.items_clicked ? JSON.parse(report.items_clicked) as number[] : [],
                        custom: report.custom
                    }
                })
            } else {
                return createError({
                    statusCode: 404,
                    statusMessage: "Game instance not found"
                })
            }
        } else {
            return createError({
                statusCode: 400,
                statusMessage: "Game instance must be defined"
            })
        }
    } else {
        return createError({
            statusCode: 404,
            statusMessage: "Game not found"
        })
    }
})