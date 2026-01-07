import {defineEventHandler, readBody} from "h3";
import type {ReportContainer} from "~/types/models";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
    const report = await readBody<ReportContainer>(event)

    if(report) {
        const successes = report.data.filter(item => item.success).length

        try {
            return await prisma.report.update({
                where: { code: report.code, completed: false },
                data: {
                    completed: true,
                    successes,
                    app: report.isApp,
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
            console.error("Error while trying to update report:", e, report)
            return createError({ statusCode: 500, statusMessage: "Error while trying to update report" })
        }
    } else {
        console.error("Invalid report data", report)
        return createError({ statusCode: 400, statusMessage: "Invalid report data" })
    }
})