import {defineEventHandler, getQuery, setCookie} from "h3";
import {consumeLoginToken} from "~/server/utils/loginTokenManager";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const base = config.public.appUrl
    const query = getQuery(event)
    const discordToken = await consumeLoginToken(String(query.token || ''))
    const errorRedirect = (msg: string) => {
        const encoded = encodeURIComponent(msg)
        event.node.res.writeHead(302, { Location: `${base}/admin/login?error=${encoded}` })
        event.node.res.end()
    }

    if(discordToken) {
        const clientId = config.public.discordClientId
        if (!clientId) {
            return {
                statusCode: 500,
                statusMessage: 'Missing discord client id'
            }
        }

        // store token in secure httpOnly cookie for 5 minutes
        setCookie(event, 'discord_oauth_state', discordToken, {
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
        params.append('state', discordToken)

        // Redirect to Discord authorize endpoint
        event.node.res.writeHead(302, { Location: `https://discord.com/api/oauth2/authorize?${params.toString()}` })
        event.node.res.end()
    } else {
        errorRedirect("Invalid token")
    }
})