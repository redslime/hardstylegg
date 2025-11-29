import type {GameMeta} from "#shared/GameMeta";
import {GameDef} from "#shared/GameDef";
import type {GameReportFlat} from "~/types/models";

export abstract class ClientGameDef<T extends EditorContainer> extends GameDef<T> {

    public gameComponent: Component
    public icon: Component
    public previewComponent: Component
    public editorComponent: Component
    public summaryComponent: Component

    private instances: T[] | null = null

    protected constructor(meta: GameMeta, gameComponent: Component, icon: Component, previewComponent: Component, editorComponent: Component, summaryComponent: Component) {
        super(meta)
        this.gameComponent = gameComponent
        this.icon = icon
        this.previewComponent = previewComponent
        this.editorComponent = editorComponent
        this.summaryComponent = summaryComponent
    }

    abstract getIconPreviewTitle(container: T): string

    abstract getDashboardHeaderTitle(container: T): string

    abstract getHelpText(container: T): string

    public async getAllInstances(): Promise<T[]> {
        if(this.instances !== null) return this.instances
        this.instances = await $fetch<T[]>('/api/dashboard/' + this.name.toLowerCase())
        return this.instances
    }

    public async getGameReports(gameId: number): Promise<GameReportFlat[]> {
        return await $fetch<GameReportFlat[]>('/api/dashboard/stats/' + this.name.toLowerCase() + '?gid=' + gameId)
    }
}