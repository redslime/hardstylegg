import {writeFile} from "node:fs/promises";
import {join} from "pathe";

function isMp3File(buffer: Buffer | Uint8Array): boolean {
    const mp3Signature = [0x49, 0x44, 0x33]
    return mp3Signature.every((byte, index) => buffer[index] === byte)
}

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)
    const formData = await readMultipartFormData(event)
    const file = formData?.find((item) => item.name === 'file')

    if (!file || !file.filename) {
        throw createError({ statusCode: 400, statusMessage: 'No file to be uploaded detected' })
    }

    if (!file?.filename?.toLowerCase().endsWith('.mp3') || file.type !== 'audio/mpeg' || !isMp3File(file.data)) {
        throw createError({
            statusCode: 400,
            message: 'You may only upload .mp3 files'
        })
    }

    if (file.data.length > 5 * 1024 * 1024) {
        throw createError({ statusCode: 400, message: 'File is too big (max. 5 MB).' })
    }

    // generate random uuid file name
    const fileName = crypto.randomUUID()
    const uploadPath = join(process.cwd(), 'data', 'heardle', fileName + '.mp3')

    await writeFile(uploadPath, file.data)
    console.log("User " + user.name + " uploaded file " + fileName + ".mp3 for Heardle")

    return { success: true, fileName }
})
