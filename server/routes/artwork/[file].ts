import { createReadStream, existsSync } from 'node:fs'
import { join } from 'node:path'
import mime from 'mime'

export default defineEventHandler((event) => {
    const file = event.context.params!.file as string
    const absolutePath = join(process.cwd(), 'data', 'artwork', file)

    if (!existsSync(absolutePath)) {
        throw createError({ statusCode: 404, statusMessage: 'File not found' })
    }

    const type = mime.getType(absolutePath) || 'application/octet-stream'
    setHeader(event, 'Content-Type', type)
    setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')

    return sendStream(event, createReadStream(absolutePath))
})
