import {defineEventHandler, getCookie, getQuery, setCookie} from 'h3'
import {PrismaClient} from '~/generated/prisma/client'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const base = config.public.appUrl
    const query = getQuery(event)
    const code = String(query.code || '')
    const returnedState = String(query.state || '')
    const storedState = getCookie(event, 'discord_oauth_state') as string | undefined
    const errorRedirect = (msg: string) => {
        const encoded = encodeURIComponent(msg)
        event.node.res.writeHead(302, { Location: `${base}/admin/login?error=${encoded}` })
        event.node.res.end()
    }

    if (!code) {
        return errorRedirect('No code returned from Discord')
    }
    if (!returnedState || !storedState || returnedState !== storedState) {
        return errorRedirect('Invalid state')
    }

    // Build redirect URI same as in login
    const redirectUri = `${base}/auth/discord/callback`

    // Exchange code for token
    const tokenUrl = 'https://discord.com/api/oauth2/token'
    const body = new URLSearchParams()

    body.append('client_id', String(config.public.discordClientId))
    body.append('client_secret', String(config.discordClientSecret))
    body.append('grant_type', 'authorization_code')
    body.append('code', code)
    body.append('redirect_uri', redirectUri)

    let tokenResponse: any
    try {
        tokenResponse = await $fetch(tokenUrl, {
            method: 'POST',
            body: body.toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
    } catch (err) {
        return errorRedirect('Failed to exchange code for token')
    }

    const accessToken = tokenResponse.access_token
    if (!accessToken) {
        return errorRedirect('No access token returned from Discord')
    }

    // Fetch user info
    let userInfo: any
    try {
        userInfo = await $fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
    } catch (err) {
        return errorRedirect('Failed to fetch user info')
    }

    const prisma = new PrismaClient()
    const userData = await prisma.user.findUnique({
        where: {
            discord_id: userInfo.id
        }
    })

    if(userData) {
        await setUserSession(event, {
            user: {
                id: userData.id,
                name: userData.name,
                admin: userData.admin,
                discordId: userInfo.id,
                avatar: userInfo.avatar
            }
        })
    } else {
        return errorRedirect('You are not an admin or editor')
    }

    // Clear the temporary state cookie
    setCookie(event, 'discord_oauth_state', '', { maxAge: 0 })

    // Redirect to admin panel
    event.node.res.writeHead(302, { Location: '/admin' })
    event.node.res.end()
})
