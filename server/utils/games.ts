import {PrismaClient} from '~/generated/prisma/client'

import type {
    ArtworkContainer,
    CompleteAlbumContainer,
    CompleteLyricsContainer,
    HeardleContainer,
    NameXContainer,
    OrderContainer,
    OrderItem,
    QuizContainer,
    TimelineContainer,
    TimetableContainer
} from "~/types/gameModels";

export async function getGameInstance(prisma: PrismaClient, type_id: number, instance_id: number) {
    switch (type_id) {
        case 1: {
            return await getArtworkInstance(prisma, instance_id)
        }
        case 2: {
            return await getCompleteAlbumInstance(prisma, instance_id)
        }
        case 3: {
            return await getCompleteLyricsInstance(prisma, instance_id)
        }
        case 4: {
            return await getHeardleInstance(prisma, instance_id)
        }
        case 5: {
            return await getNameXInstance(prisma, instance_id)
        }
        case 6: {
            return await getOrderInstance(prisma, instance_id)
        }
        case 7: {
            return await getQuizInstance(prisma, instance_id)
        }
        case 8: {
            return await getTimelineInstance(prisma, instance_id)
        }
        case 9: {
            return await getTimetableInstance(prisma, instance_id)
        }
    }
}

export async function getArtworkInstance(prisma: PrismaClient, id: number): Promise<ArtworkContainer> {
    const parent = await prisma.game_artwork.findUnique({ where: { id: id } })
    const track = await prisma.track.findUnique({ where: { sid: parent!!.track_id } })

    return <ArtworkContainer>{
        id: parent!!.id,
        created_by: parent!!.created_by,
        track: track,
        artwork_blank: parent!!.artwork_blank
    }
}

export async function getCompleteAlbumInstance(prisma: PrismaClient, id: number): Promise<CompleteAlbumContainer> {
    const parent = await prisma.game_complete_album.findUnique({ where: { id: id } })
    const album = await prisma.album.findUnique({ where: { sid: parent!!.album_id ?? "" } })
    const items = await prisma.game_complete_album_item.findMany({ where: { parent_id: id } })
    return <CompleteAlbumContainer>{
        id: parent!!.id,
        created_by: parent!!.created_by,
        album: album,
        items: items
    }
}

export async function getCompleteLyricsInstance(prisma: PrismaClient, id: number): Promise<CompleteLyricsContainer> {
    const parent = await prisma.game_complete_lyrics.findUnique({ where: { id: id } })
    const track = await prisma.track.findUnique({ where: { sid: parent!!.track_id } })
    return <CompleteLyricsContainer>{
        id: parent!!.id,
        created_by: parent!!.created_by,
        text: parent!!.text,
        track: track
    }
}

export async function getHeardleInstance(prisma: PrismaClient, id: number): Promise<HeardleContainer> {
    const parent = (await prisma.game_heardle.findUnique({ where: { id: id } }))
    const flattenDurations: number[] = JSON.parse(parent!!.durations)
    const track = await prisma.track.findUnique({ where: { sid: parent!!.track_id } })
    return <HeardleContainer>{
        id: parent!!.id,
        created_by: parent!!.created_by,
        track: track,
        src: parent!!.src,
        durations: flattenDurations,
    }
}

export async function getNameXInstance(prisma: PrismaClient, id: number): Promise<NameXContainer> {
    const parent = await prisma.game_namex.findUnique({ where: { id: id } })
    const trackIds: string[] = JSON.parse(parent!!.items)
    const tracks = await prisma.track.findMany({ where: { sid: { in: trackIds } } })
    const trackById = new Map(tracks.map(t => [t.sid, t]))
    const orderedTracks = trackIds.map(id => trackById.get(id)).filter(Boolean) as typeof tracks
    return <NameXContainer>{
        id: parent!!.id,
        created_by: parent!!.created_by,
        goal: parent!!.goal,
        title: parent!!.title,
        items: orderedTracks
    }
}

export async function getOrderInstance(prisma: PrismaClient, id: number): Promise<OrderContainer> {
    const parent = await prisma.game_order.findUnique({ where: { id: id } })
    const items = await prisma.game_order_item.findMany({ where: { parent_id: id } })
    const trackIds: string[] = items.map(i => i.track_id)
    const tracks = await prisma.track.findMany({ where: { sid: { in: trackIds } } })
    const itemsFat = items.map(i => {
        const trackId = i.track_id
        const track = tracks.find(i => i.sid == trackId)
        return <OrderItem>{
            parent_id: i.parent_id,
            index: i.index,
            track: track
        }
    })
    return <OrderContainer>{
        id: parent!!.id,
        created_by: parent!!.created_by,
        title: parent!!.title,
        showNames: parent!!.show_names,
        items: itemsFat
    }
}

export async function getQuizInstance(prisma: PrismaClient, id: number): Promise<QuizContainer> {
    const parent = await prisma.game_quiz.findUnique({ where: { id: id } })
    const items = await prisma.game_quiz_item.findMany({ where: { parent_id: id } })
    return <QuizContainer>{
        id: parent!!.id,
        created_by: parent!!.created_by,
        title: parent!!.title,
        items: items
    }
}

export async function getTimelineInstance(prisma: PrismaClient, id: number): Promise<TimelineContainer> {
    const parent = await prisma.game_timeline.findUnique({ where: { id: id } })
    return <TimelineContainer>{
        id: parent!!.id,
        created_by: parent!!.created_by,
        title: parent!!.title,
        goal: parent!!.goal
    }
}

export async function getTimetableInstance(prisma: PrismaClient, id: number): Promise<TimetableContainer> {
    const parent = await prisma.game_timetable.findUnique({ where: { id: id } })
    const items = await prisma.game_timetable_item.findMany({ where: { parent_id: id } })
    return <TimetableContainer>{
        id: parent!!.id,
        created_by: parent!!.created_by,
        title: parent!!.title,
        color_bg: "#" + parent!!.color_bg,
        color_text: "#" + parent!!.color_text,
        items: items
    }
}