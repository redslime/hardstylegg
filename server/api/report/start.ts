import prisma from "~/lib/prisma";
import {getDayIdToday} from "~/server/utils/schedule";

async function createEmptyReport(code: string) {
    await prisma.report.create({
        data: {
            code,
            dayId: getDayIdToday()
        }
    })
}

export default defineEventHandler((event) => {
    const code = Math.random().toString(36).substring(2, 17)
    createEmptyReport(code).catch(err => console.error("Error while trying to create empty report in background:", err))
    return code
})