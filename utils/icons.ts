import {GameState} from "~/types/models";

export function getStrokeColor(state: GameState | undefined): string {
    switch (state) {
        case GameState.UPCOMING:
            return "var(--color-primary)"
        case GameState.PLAYING:
            return "var(--color-primary-content)"
        case GameState.SUCCEEDED:
            return "var(--color-success-content)"
        case GameState.FAILED:
            return "var(--color-error-content)"
    }

    return "var(--color-primary)"
}

import { defineAsyncComponent, type Component } from 'vue'

// Define the shape of a glob import
type GlobImport = Record<string, () => Promise<{ default: Component }>>

// Glob all icons once at build time
const generalIcons: GlobImport = import.meta.glob('~/components/icons/*.vue') as GlobImport
const gameIcons: GlobImport = import.meta.glob('~/components/icons/game/*.vue') as GlobImport

/**
 * Dynamically load a Vue icon component.
 *
 * @param icon - The base filename of the icon (e.g. "HomeIcon")
 * @param isGameIcon - Whether to load from `/icons/game/` instead of `/icons/`
 * @returns A lazily-loaded Vue component
 */
export function getIcon(icon: string, isGameIcon = false): Component {
    const icons = isGameIcon ? gameIcons : generalIcons
    const key = Object.keys(icons).find(path => path.endsWith(`/${icon}.vue`))

    if(!key) {
        return defineAsyncComponent(() => import('~/components/icons/HomeIcon.vue'))
    }

    return defineAsyncComponent(icons[key]!!)
}