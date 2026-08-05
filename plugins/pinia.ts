import {getActivePinia} from "pinia";

export default defineNuxtPlugin(nuxtApp => {
    const pinia = getActivePinia()

    if(pinia) {
        nuxtApp.vueApp.use(pinia)
    }
})