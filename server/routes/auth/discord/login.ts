import {defineEventHandler, setCookie} from 'h3'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const clientId = config.public.discordClientId
    if (!clientId) {
        return {
            statusCode: 500,
            statusMessage: 'Missing discord client id'
        }
    }

    // generate state
    const state = [...Array(30)].map(() => (Math.random() * 36 | 0).toString(36)).join('')
    // store state in secure httpOnly cookie for 5 minutes
    setCookie(event, 'discord_oauth_state', state, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 5
    })

    // build redirect URI (callback) from request origin OR fallback to public appUrl
    const base = config.public.appUrl
    const redirectUri = `${base}/auth/discord/callback`
    const params = new URLSearchParams()

    params.append('client_id', clientId.toString())
    params.append('redirect_uri', redirectUri)
    params.append('response_type', 'code')
    params.append('scope', 'identify')
    params.append('state', state)

    // Redirect to Discord authorize endpoint
    event.node.res.writeHead(302, { Location: `https://discord.com/api/oauth2/authorize?${params.toString()}` })
    event.node.res.end()
})
