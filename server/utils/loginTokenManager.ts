import prisma from "~/lib/prisma";

let loginToken: string | null = null // used to login with admin account
let discordToken: string | null = null // used to verify discord oauth flow to create own account

export async function registerSeedIntent() {
    // generate token that can be logged in with initially
    loginToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    console.log("-------------")
    console.log("Initial login detected!")
    console.log("Use the following code to create your account:", loginToken)
    console.log("-------------")
}

export async function consumeLoginToken(token: string): Promise<string | null> {
    if(token === loginToken) {
        loginToken = null
        return registerDiscordIntent()
    }

    return null
}

export async function registerDiscordIntent(): Promise<string> {
    discordToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return discordToken
}

export async function consumeDiscordToken(token: string, discord_id: string, name: string): Promise<{ discord_id: string, name: string, admin: boolean, id: number } | null> {
    if(token === discordToken) {
        const user = await prisma.user.create({
            data: {
                name,
                discord_id,
                admin: true
            }
        })

        loginToken = null
        discordToken = null

        return user
    }

    return null
}