import {PrismaClient} from '~/generated/prisma/client'

const prisma = new PrismaClient()

async function getDuplicateTracks() {
    const ad = await prisma.track.groupBy({
        by: ['artists', 'title'],
        _count: {
            _all: true,
        },
        having: {
            artists: {
                _count: {
                    gt: 1,
                },
            },
        },
        // take: 1,
        orderBy: {
            _count: {
                sid: 'desc',
            },
        },
    });

    const duplicates = await prisma.track.findMany({
        where: {
            OR: ad.map(d => ({
                artists: d.artists,
                title: d.title,
            })),
        },
    });

    return duplicates;
}

export default defineEventHandler(async (event) => {
    return await getDuplicateTracks()
})