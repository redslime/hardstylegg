declare global {
    interface EditorContainer {
        id?: number
        created_by?: number
        context: string | null
    }
}

export {}