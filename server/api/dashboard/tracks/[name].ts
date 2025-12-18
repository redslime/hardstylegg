import {findGameByName} from "~/server/utils/game/serverGameRegistry";

export default defineEventHandler(async (event) => {
    const {user} = await requireUserSession(event)
    const game = findGameByName(event.context.params?.name ?? "");

    if(game) {
        return await game.getExistingTracks()
    } else {
        return createError({
            statusCode: 404,
            statusMessage: "Game Not Found"
        })
    }
});