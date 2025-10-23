import {getTimeUntilMidnight} from "~/server/utils/schedule";

export default defineEventHandler(async (event) => {
    return {
        seconds: getTimeUntilMidnight()
    }
})