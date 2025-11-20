import {ClientGameRegistry} from "~/utils/game/ClientGameRegistry";

export default defineNuxtPlugin(() => {
    if(import.meta.client) {
        const gameRegistry = new ClientGameRegistry()

        return {
            provide: {
                gameRegistry
            }
        }
    }
});
