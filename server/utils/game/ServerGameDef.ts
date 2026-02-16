import type {User} from "#auth-utils";
import type {GameMeta} from "#shared/GameMeta";
import {type EventHandlerRequest, type H3Event, readBody} from "h3";
import {GameDef} from "#shared/GameDef";
import type {ReportItem} from "~/types/models";

export abstract class ServerGameDef<T extends EditorContainer> extends GameDef<T> {

    protected constructor(meta: GameMeta) {
        super(meta)
    }

    abstract fetchAllInstances(user: User): Promise<T[]>

    abstract fetchInstances(ids: number[]): Promise<T[]>

    abstract fetchInstance(gameId: number): Promise<T>

    abstract createInstance(instance: T): Promise<T>

    abstract updateInstance(instance: T): Promise<T>

    abstract deleteInstance(gameId: number, user: User): Promise<boolean>

    abstract getPreviewIcon(): string

    public async getPreviewDetails(reportItem: ReportItem): Promise<string> {
        return ""
    }

    protected async getPreviewOptions(gameId: number): Promise<number | "?"> {
        return "?"
    }

    public async getExistingTracks(): Promise<string[]> {
        return []
    }

    public async readBody(event: H3Event<EventHandlerRequest>): Promise<T> {
        return await readBody<T>(event)
    }

    protected respondAttempts(reportItem: ReportItem): string {
        if(reportItem.success) {
            return "in " + reportItem.attempts
        }

        return ""
    }

    protected async respondCompleted(reportItem: ReportItem): Promise<string> {
        if(!reportItem.success && reportItem.items_completed) {
            try {
                const completed = JSON.parse(reportItem.items_completed) as { [key: string]: boolean }
                const count = Object.values(completed).filter(v => v).length

                if(count > 0) {
                    const options = await this.getPreviewOptions(reportItem.gameId)
                    return count + "/" + options
                }
            } catch(e: any) {
                console.error(e)
                return ""
            }
        }

        return ""
    }

    protected whereGameIdAndAdminOrCreator(gameId: number, user: User) {
        return {
            where: {
                id: gameId,
                ...(user.admin ? {} : { created_by: user.id })
            }
        }
    }

    protected whereAdminOrCreator(user: User) {
        return {
            where: {
                ...(user.admin ? { } : {
                    OR: [
                        {
                            created_by: user.id
                        },
                        {
                            id: 1
                        }
                    ]
                })
            }
        }
    }

    protected whereIdIn(gameIds: number[]) {
        return {
            where: {
                id: {
                    in: gameIds
                }
            }
        }
    }
}