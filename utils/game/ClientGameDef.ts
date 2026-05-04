import type {GameMeta} from "#shared/GameMeta";
import {GameDef} from "#shared/GameDef";
import type {GameReport, GameReportFlat} from "~/types/models";

export abstract class ClientGameDef<T extends EditorContainer> extends GameDef<T> {

    public gameComponent: Component
    public icon: Component
    public previewComponent: Component
    public editorComponent: Component
    public summaryComponent: Component

    private instances: T[] | null = null
    private existingTracks: string[] = []

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

    abstract remap(data: any): T

    public async getAllInstances(): Promise<T[]> {
        if(this.instances !== null) return this.instances
        this.instances = (await $fetch<T[]>('/api/dashboard/' + this.name.toLowerCase())).map(this.remap)
        return this.instances
    }

    public async getExistingTracks(): Promise<string[]> {
        this.existingTracks = await $fetch<string[]>('/api/dashboard/tracks/' + this.name.toLowerCase())
        return this.existingTracks
    }

    public async getGameReports(gameId: number): Promise<GameReportFlat[]> {
        return await $fetch<GameReportFlat[]>('/api/dashboard/stats/' + this.name.toLowerCase() + '?gid=' + gameId)
    }

    public getPreviewDetails(reportItem: GameReport, container: T): string {
        return ""
    }

    protected getPreviewOptions(container: T): number | "?" {
        return "?"
    }

    protected respondCompleted(reportItem: GameReport, container: T): string {
        if(!reportItem.success && reportItem.itemsCompleted) {
            try {
                const completed = reportItem.itemsCompleted
                const count = Object.values(completed).filter(v => v).length

                if(count > 0) {
                    const options = this.getPreviewOptions(container)
                    return count + "/" + options
                }
            } catch(e: any) {
                console.error(e)
                return ""
            }
        }

        return ""
    }

    public getPreloadUrls(container: T): string[] {
        return []
    }
}