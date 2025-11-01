import {writeFile} from "node:fs/promises";
import {join} from "pathe";

function isPngFile(buffer: Buffer | Uint8Array): boolean {
    const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]
    return pngSignature.every((byte, index) => buffer[index] === byte)
}

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)
    const formData = await readMultipartFormData(event)
    const file = formData?.find((item) => item.name === 'file')

    if (!file || !file.filename) {
        throw createError({ statusCode: 400, statusMessage: 'No file to be uploaded detected' })
    }

    if (!file?.filename?.toLowerCase().endsWith('.png') || file.type !== 'image/png' || !isPngFile(file.data)) {
        throw createError({
            statusCode: 400,
            message: 'You may only upload .png files'
        })
    }

    if (file.data.length > 5 * 1024 * 1024) {
        throw createError({ statusCode: 400, message: 'File is too big (max. 5 MB).' })
    }

    // generate random uuid file name
    const fileName = crypto.randomUUID()
    const uploadPath = join(process.cwd(), 'public', 'img', fileName + '.png')

    await writeFile(uploadPath, file.data)
    console.log("User " + user.name + " uploaded file " + fileName + ".png for Artwork")

    return { success: true, fileName }
})
