import {getCacheKeys} from "~/server/utils/cacheKeys";

export default defineEventHandler(async (event) => {
    return await getCacheKeys()
})