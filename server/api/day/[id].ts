import {getPackedDayDataForDay} from "~/server/utils/schedule";

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)
    const dayId = event.context.params?.id;

    if(dayId) {
        return await getPackedDayDataForDay(parseInt(dayId))
    }

    return {}
});