import type {GameMeta} from "#shared/GameMeta";
import {GameDef} from "#shared/GameDef";

export abstract class ClientGameDef<T extends EditorContainer> extends GameDef<T> {

    public gameComponent: Component
    public icon: Component
    public previewComponent: Component
    public editorComponent: Component

    private instances: T[] | null = null

    protected constructor(meta: GameMeta, gameComponent: Component, icon: Component, previewComponent: Component, editorComponent: Component) {
        super(meta)
        this.gameComponent = gameComponent
        this.icon = icon
        this.previewComponent = previewComponent
        this.editorComponent = editorComponent
    }

    abstract getIconPreviewTitle(container: T): string

    abstract getDashboardHeaderTitle(container: T): string

    public async getAllInstances(): Promise<T[]> {
        if(this.instances !== null) return this.instances
        this.instances = await $fetch<T[]>('/api/dashboard/' + this.name.toLowerCase())
        return this.instances
    }
}