import type {GameMeta} from "#shared/GameMeta";
import type {GameReport, ReportItem} from "~/types/models";

export abstract class GameDef<T extends EditorContainer> {

    public id: number
    public name: string

    private readonly validator: (container: T) => string[]

    protected constructor(meta: GameMeta) {
        this.id = meta.id
        this.name = meta.name
        this.validator = meta.validator
    }

    public validate(container: T): string[] {
        return this.validator(container)
    }

    public getEditUrl(): string {
        return '/api/dashboard/edit/' + this.name.toLowerCase()
    }

    public getDashedName(): string {
        let dashed = this.name.replace(/[A-Z]/g, m => "-" + m.toLowerCase());
        if(dashed.startsWith("-")) dashed = dashed.substring(1);
        return dashed
    }

    public getSpacedName(): string {
        return this.name.replace(/[A-Z]/g, m => " " + m);
    }

    protected respondAttempts(reportItem: ReportItem | GameReport): string {
        if(reportItem.success) {
            return "in " + reportItem.attempts
        }

        return ""
    }
}