import {registerGames} from "~/utils/game/clientGameRegistry";

export default defineNuxtPlugin(() => {
    registerGames()
});
