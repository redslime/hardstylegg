import prisma from "~/lib/prisma";
import {RichArtist} from "~/types/content";

const isDev = useRuntimeConfig().public.isDev

export default defineEventHandler(async (event): Promise<RichArtist[]> => {
    if(!isDev) {
        setHeader(event, 'Cache-Control', 'private, max-age=2592000') // 1 month
    } else {
        setHeader(event, 'Cache-Control', 'private, max-age=600') // 10 minutes
    }

    return (await prisma.artist.findMany()).map(a => <RichArtist>{
        id: a.id,
        name: a.name,
        image: a.image
    })
})