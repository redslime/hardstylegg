export interface GameMeta {
    id: number
    name: string
    validator: (container: any) => string[]
}