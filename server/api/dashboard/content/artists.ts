import prisma from "~/lib/prisma";
import {RichArtist} from "~/types/content";

const isDev = useRuntimeConfig().public.isDev

export default defineEventHandler(async (event): Promise<RichArtist[]> => {
    if(!isDev) {
        setHeader(event, 'Cache-Control', 'private, max-age=2592000') // 1 month
    } else {
        setHeader(event, 'Cache-Control', 'private, max-age=600') // 10 minutes
    }

    const lastId = await prisma.artist_stats_parent.findMany({
        select: {
            id: true
        },
        orderBy: {
            id: 'desc'
        },
        take: 1
    }).then(arr => arr[0])

    if(!lastId) {
        return await prisma.artist.findMany({
            select: {
                id: true,
                name: true,
                image: true
            },
        }).then(a => a.map(RichArtist.mapJson))
    } else {
        const fetched = await prisma.artist.findMany({
            select: {
                id: true,
                name: true,
                image: true,
                artist_stats: {
                    select: {
                        count: true
                    },
                    where: {
                        parent_id: lastId.id
                    }
                }
            }
        })

        return fetched.map(row => {
            const { artist_stats, ...rest } = row
            return RichArtist.fromJson(<RichArtist>{
                ...rest,
                listeners: artist_stats[0]?.count
            })
        })
    }
})