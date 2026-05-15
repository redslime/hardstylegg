import { defineComponent, h, type Component } from 'vue'

const vueModules = import.meta.glob('./*.vue', {
    eager: true,
})

const webpModules = import.meta.glob('/public/icon/*.webp', {
    eager: true,
    query: '?url',
    import: 'default'
})

export type IconRegistry = Record<string, Component>

export const icons: IconRegistry = {}

for (const path in vueModules) {
    const component = vueModules[path] as any

    // "./Add.vue" -> "Add"
    const fileName = path
        .split('/')
        .pop()
        ?.replace('.vue', '')

    if (!fileName) continue

    icons[fileName] = component.default
}

for (const path in webpModules) {
    const url = webpModules[path] as string

    // "/public/icon/rebirth.webp" -> "rebirth"
    const fileName = path
        .split('/')
        .pop()
        ?.replace('.webp', '')

    if (!fileName) continue

    icons[fileName] = defineComponent({
        name: fileName,
        render() {
            return h('img', {
                src: url,
                alt: fileName,
            })
        }
    })
}

export const iconNames = Object.keys(icons)