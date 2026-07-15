import type { H3Error } from "h3";
import { Prisma } from "~/generated/prisma/client";

export default defineNitroPlugin((nitroApp) => {
    nitroApp.hooks.hook("error", async (error, { event }) => {
        const handledError = handlePrismaError(error)

        if (handledError !== error) {
            console.error(error)
            Object.assign(error, handledError)
        }
    })
})

function handlePrismaError(e: unknown): H3Error | unknown {
    const prismaError = findPrismaKnownRequestError(e)

    if (!prismaError) {
        return e
    }

    return createError({
        statusCode: 500,
        statusText: `${getErrorMessage(prismaError)} (${prismaError.code})`,
        data: prismaError.meta,
        cause: prismaError
    })
}

function findPrismaKnownRequestError(e: unknown): Prisma.PrismaClientKnownRequestError | undefined {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
        return e
    }

    if (!e || typeof e !== "object") {
        return undefined
    }

    const error = e as {
        cause?: unknown
        data?: unknown
        unhandled?: unknown
    }

    return findPrismaKnownRequestError(error.cause)
        ?? findPrismaKnownRequestError(error.data)
        ?? findPrismaKnownRequestError(error.unhandled)
}

function getErrorMessage(e: Prisma.PrismaClientKnownRequestError): string {
    if (e.code === "P2000") {
        const column = e.meta?.["column_name"] || ""
        return column ? `${column} is too long!` : e.message
    }

    return e.message
}