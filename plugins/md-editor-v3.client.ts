import {config} from 'md-editor-v3'
import {mdYoutubePlugin} from '../utils/mdYoutubePlugin'

export default defineNuxtPlugin(() => {
    config({
        markdownItConfig(md) {
            md.use(mdYoutubePlugin)
            md.set({ html: true })
        }
    })
})