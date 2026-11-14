import {getRichAlbumsYearly, getRichTracksYearly} from "#server/utils/content.ts";

export default defineEventHandler(async (event) => {
    const year = parseInt(event.context.params?.year ?? "")

    if(year === undefined) {
        return createError({ statusCode: 400, statusMessage: "Invalid year" })
    }

    setHeader(event, 'Cache-Control', 'public, max-age=86400') // 24 hours

    const tracks = await getRichTracksYearly(year)
    const albums = await getRichAlbumsYearly(year)

    return { tracks, albums }
})