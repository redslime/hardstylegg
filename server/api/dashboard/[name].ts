import {findGameByName} from "~/server/utils/game/serverGameRegistry";

export default defineEventHandler(async (event) => {
    const {user} = await requireUserSession(event)
    const name = event.context.params?.name;

    if(name) {
        return await findGameByName(name)!!.fetchAllInstances(user)
    } else {
        return createError({
            statusCode: 404,
            statusMessage: "Game Not Found"
        })
    }
});