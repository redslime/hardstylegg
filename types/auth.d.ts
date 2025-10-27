declare module '#auth-utils' {
    interface User {
        id: number
        name: string
        admin: boolean
        discordId: string
        avatar: string
    }

    interface UserSession {
        user: User
    }
}