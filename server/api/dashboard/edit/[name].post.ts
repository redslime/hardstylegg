import {defineEventHandler} from "h3";
import {findGameByName} from "~/server/utils/game/serverGameRegistry";

export default defineEventHandler(async (event) => {
    await requireUserSession(event)
    const name = event.context.params?.name;

    if(name) {
        const game = findGameByName(name)!!
        const instance = await game.readBody(event)
        const errors: string[] = game.validate(instance)

        if (errors.length > 0) {
            return [...errors]
        }

        if (!instance.id) {
            return await game.createInstance(instance)
        } else {
            return await game.updateInstance(instance)
        }
    }
})