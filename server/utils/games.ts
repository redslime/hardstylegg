import {PrismaClient} from '~/generated/prisma/client'

export async function getGameFlattenedInstance(prisma: PrismaClient, type_id: number, instance_id: number) {
    switch (type_id) {
        case 1: {
            const {track, artwork_blank} = await getArtworkInstance(prisma, instance_id)
            return {track, artwork_blank}
        }
        case 2: {
            const {items} = await getCompleteAlbumInstance(prisma, instance_id)
            const flatItems = items.map(({id, parent_id, ...rest}) => ({...rest}))
            return {items: flatItems}
        }
        case 3: {
            const {description, text} = await getCompleteLyricsInstance(prisma, instance_id)
            return {description, text}
        }
        case 4: {
            const {track, src, durations} = await getHeardleInstance(prisma, instance_id)
            return {track, src, durations}
        }
        case 5: {
            const {title, goal, items} = await getNameXInstance(prisma, instance_id)
            return {title, goal, items}
        }
        case 6: {
            const {title, show_names, items} = await getOrderInstance(prisma, instance_id)
            const flatItems = items.map(({parent_id, ...rest}) => ({...rest}))
            return {title, show_names, items: flatItems}
        }
        case 7: {
            const {title, answers} = await getQuizInstance(prisma, instance_id)
            const flatAnswers = answers.map(({id, parent_id, ...rest}) => ({...rest}))
            return {title, answers: flatAnswers}
        }
        case 8: {
            const {title, goal} = await getTimelineInstance(prisma, instance_id)
            return {title, goal}
        }
        case 9: {
            const {description, color_bg, color_text, items} = await getTimetableInstance(prisma, instance_id)
            const flatItems = items.map(({id, parent_id, ...rest}) => ({...rest}))
            return {description, color_bg, color_text, items: flatItems}
        }
    }
}

export async function getArtworkInstance(prisma: PrismaClient, id: number) {
    const parent = await prisma.game_artwork.findUnique({ where: { id: id } })
    const track = await prisma.track.findUnique({ where: { sid: parent!!.track_id } })

    return {
        ...parent,
        track: track
    }
}

export async function getCompleteAlbumInstance(prisma: PrismaClient, id: number) {
    const parent = await prisma.game_complete_album.findUnique({ where: { id: id } })
    const items = await prisma.game_complete_album_item.findMany({ where: { parent_id: id } })
    return {
        ...parent,
        items: items
    }
}

export async function getCompleteLyricsInstance(prisma: PrismaClient, id: number) {
    return {...await prisma.game_complete_lyrics.findUnique({ where: { id: id } })}
}

export async function getHeardleInstance(prisma: PrismaClient, id: number) {
    const parent = (await prisma.game_heardle.findUnique({ where: { id: id } }))
    const {durations, ...rest} = parent!!
    const flattenDurations: number[] = JSON.parse(durations)
    const track = await prisma.track.findUnique({ where: { sid: parent!!.track_id } })
    return {
        ...rest,
        durations: flattenDurations,
        track: track
    }
}

export async function getNameXInstance(prisma: PrismaClient, id: number) {
    const {items, ...rest} = (await prisma.game_namex.findUnique({ where: { id: id } }))!!
    const trackIds: string[] = JSON.parse(items)
    const tracks = await prisma.track.findMany({ where: { sid: { in: trackIds } } })
    const trackById = new Map(tracks.map(t => [t.sid, t]))
    const orderedTracks = trackIds.map(id => trackById.get(id)).filter(Boolean) as typeof tracks
    return {
        ...rest,
        items: orderedTracks
    }
}

export async function getOrderInstance(prisma: PrismaClient, id: number) {
    const parent = await prisma.game_order.findUnique({ where: { id: id } })
    const items = await prisma.game_order_item.findMany({ where: { parent_id: id } })
    const trackIds: string[] = items.map(i => i.track_id)
    const tracks = await prisma.track.findMany({ where: { sid: { in: trackIds } } })
    const itemsFat = items.map(i => {
        const trackId = i.track_id
        const track = tracks.find(i => i.sid == trackId)
        const {track_id, ...rest} = i
        return {...rest, track}
    })
    return {
        ...parent,
        items: itemsFat
    }
}

export async function getQuizInstance(prisma: PrismaClient, id: number) {
    const parent = await prisma.game_quiz.findUnique({ where: { id: id } })
    const answers = await prisma.game_quiz_item.findMany({ where: { parent_id: id } })
    return {
        ...parent,
        answers: answers
    }
}

export async function getTimelineInstance(prisma: PrismaClient, id: number) {
    return {...await prisma.game_timeline.findUnique({ where: { id: id } })}
}

export async function getTimetableInstance(prisma: PrismaClient, id: number) {
    const parent = await prisma.game_timetable.findUnique({ where: { id: id } })
    const items = await prisma.game_timetable_item.findMany({ where: { parent_id: id } })
    return {
        ...parent,
        items: items
    }
}