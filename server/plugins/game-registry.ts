import {registerGames} from "~/server/utils/game/serverGameRegistry";

export default defineNitroPlugin((nitroApp) => {
    registerGames()
})