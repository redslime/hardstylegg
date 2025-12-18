import {readBody} from "h3";
import {findGameById} from "~/server/utils/game/serverGameRegistry";

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)

    const { typeId, gameId } = await readBody<{ typeId: number, gameId: number }>(event)
    const gameDef = findGameById(typeId)!!
    return gameDef.deleteInstance(gameId, user)
})