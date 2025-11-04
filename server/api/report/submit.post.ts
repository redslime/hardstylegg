import {defineEventHandler, readBody} from "h3";
import type {ReportContainer} from "~/types/models";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
    const report = await readBody<ReportContainer>(event)
    const successes = report.data.filter(item => item.success).length

    try {
        return await prisma.report.update({
            where: { code: report.code },
            data: {
                completed: true,
                successes,
                report_item: {
                    // insert child items from report.data
                    create: report.data.map(item => {
                        return {
                            typeId: item.typeId,
                            gameId: item.gameId,
                            success: item.success,
                            attempts: item.attempts,
                            items_completed: JSON.stringify(item.itemsCompleted),
                            items_clicked: JSON.stringify(item.itemsClicked)
                        }
                    })
                }
            }
        })
    } catch (e: any) {
        console.error("Error while trying to update report:", e)
        return createError({ statusCode: 500, statusMessage: "Error while trying to update report" })
    }
})