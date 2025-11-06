import {getAvgScores} from "~/server/utils/schedule";

export default defineEventHandler(async (event) => {
    return await getAvgScores()
})