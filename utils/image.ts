export const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export async function processImageToWebP(file: File): Promise<string> {
    validateImageFile(file)

    const dataUrl = await fileToDataURL(file)
    const img = await loadImageFromDataURL(dataUrl)

    const webp = await convertToWebP(img)
    validateWebPDataURL(webp)

    return webp
}

export function decodeBase64Image(dataUrl: string): Buffer {
    const cleaned = dataUrl.replace(/^data:image\/\w+;base64,/, "")

    if (!/^[A-Za-z0-9+/=]+$/.test(cleaned)) {
        throw new Error("Invalid base64 image input.")
    }

    try {
        return Buffer.from(cleaned, "base64")
    } catch {
        throw new Error("Could not decode base64 image.")
    }
}

export function validateImageFile(file: File, maxSizeMb: number = 20) {
    if (!file) {
        throw new Error("No file selected.")
    }

    if (!file.type.startsWith("image/")) {
        throw new Error("The selected file is not an image.")
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
        throw new Error("Image file is too large (max " + maxSizeMb + "MB).")
    }
}

export function fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error("Failed to read image."))

        reader.readAsDataURL(file)
    })
}

export function loadImageFromDataURL(dataUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error("Invalid image data."))
        img.src = dataUrl
    })
}

export function convertToWebP(img: HTMLImageElement, quality = 1): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            const canvas = document.createElement("canvas")
            canvas.width = img.width
            canvas.height = img.height

            const ctx = canvas.getContext("2d")
            if (!ctx) return reject(new Error("Canvas not supported."))

            ctx.drawImage(img, 0, 0)

            canvas.toBlob(
                (blob) => {
                    if (!blob) return reject(new Error("Failed to convert image to WebP."))

                    const reader = new FileReader()
                    reader.onloadend = () => resolve(reader.result as string)
                    reader.readAsDataURL(blob)
                },
                "image/webp",
                quality
            )
        } catch (e) {
            reject(e)
        }
    })
}

export function validateWebPBuffer(buf: Buffer): void {
    if (buf.length === 0) {
        throw new Error("Image buffer is empty.")
    }

    // WebP Magic Bytes: "RIFF....WEBP"
    const isRIFF =
        buf[0] === 0x52 && // R
        buf[1] === 0x49 && // I
        buf[2] === 0x46 && // F
        buf[3] === 0x46    // F

    const isWEBP =
        buf[8] === 0x57 && // W
        buf[9] === 0x45 && // E
        buf[10] === 0x42 && // B
        buf[11] === 0x50    // P

    if (!isRIFF || !isWEBP) {
        throw new Error("Invalid WebP file header.")
    }

    if (buf.length > MAX_SIZE_BYTES) {
        throw new Error(`Image exceeds max size (${(MAX_SIZE_BYTES / 1024 / 1024)} MB).`)
    }
}

export function validateWebPDataURL(webpBase64: string) {
    const sizeInBytes = Math.ceil(webpBase64.length * 0.75) // Base64 to Bytes approximation

    if (sizeInBytes > MAX_SIZE_BYTES) {
        throw new Error(`Converted image exceeds ${MAX_SIZE_BYTES / 1024 / 1024}MB limit.`)
    }
}