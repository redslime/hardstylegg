import type {InfinityPreviewContainer} from "~/types/models";
import prisma from "~/lib/prisma";
import {GAME_METAS} from "#shared/games";
import {getDayIdToday} from "~/server/utils/schedule";

const isDev = useRuntimeConfig().public.isDev
let infinityPreviewCache: InfinityPreviewContainer | null = null

export function resetInfinityPreviewCache() {
    infinityPreviewCache = null
}

export async function getInfinityPreview(): Promise<InfinityPreviewContainer> {
    if(infinityPreviewCache === null) {
        console.log("[InfinityPreview] Loading...")

        const gameCounts: Record<number, number> = {}
        const pastGameData: Record<number, number[]> = {} // typeId:gameIds
        const schedule = await prisma.day_schedule.findMany({
            where: {
                day: {
                    lt: getDayIdToday()
                }
            }
        })

        getGames().forEach((game) => {
            pastGameData[game.id] = []
        })

        schedule.forEach(item => {
            const typeIds = JSON.parse(item.type_ids) as number[]
            const gameIds = JSON.parse(item.game_ids) as number[]

            typeIds.forEach((id, index) => {
                gameCounts[id] = (gameCounts[id] ?? 0) + 1
                pastGameData[id]?.push(gameIds[index]!!)
            })
        })

        const trackYears: Record<number, {year: number, count: number}[]> = {}
        const artworkTrackIds = (await prisma.game_artwork.findMany({
            select: {
                track_id: true
            },
            where: {
                id: {
                    in: pastGameData[GAME_METAS.Artwork.id]!!
                }
            }
        })).map(r => r.track_id)
        const completeAlbumTrackIds = (await prisma.game_complete_album.findMany({
            select: {
                album_id: true
            },
            where: {
                id: {
                    in: pastGameData[GAME_METAS.CompleteAlbum.id]!!
                }
            }
        })).map(r => r.album_id!!)
        const completeLyricsTrackIds = (await prisma.game_complete_lyrics.findMany({
            select: {
                track_id: true
            },
            where: {
                id: {
                    in: pastGameData[GAME_METAS.CompleteLyrics.id]!!
                }
            }
        })).map(r => r.track_id)
        const heardleTrackIds = (await prisma.game_heardle.findMany({
            select: {
                track_id: true
            },
            where: {
                id: {
                    in: pastGameData[GAME_METAS.Heardle.id]!!
                }
            }
        })).map(r => r.track_id)

        trackYears[GAME_METAS.Artwork.id] = await fetchTrackYearCounts(artworkTrackIds)
        trackYears[GAME_METAS.CompleteAlbum.id] = await fetchAlbumYearCounts(completeAlbumTrackIds)
        trackYears[GAME_METAS.CompleteLyrics.id] = await fetchTrackYearCounts(completeLyricsTrackIds)
        trackYears[GAME_METAS.Heardle.id] = await fetchTrackYearCounts(heardleTrackIds)

        console.log("[InfinityPreview] Loaded!")
        infinityPreviewCache = { games: gameCounts, trackYears }
    }

    return infinityPreviewCache
}

async function fetchTrackYearCounts(trackIds: string[]): Promise<{ year: number, count: number }[]> {
    const tracks = await prisma.track.findMany({
        where: {
            sid: {
                in: trackIds,
            },
        },
        select: {
            date: true,
        },
    });

    return Object.values(
        tracks.reduce((acc, { date }) => {
            const year = date.getFullYear();

            acc[year] ??= { year, count: 0 };
            acc[year].count++;

            return acc;
        }, {} as Record<number, { year: number; count: number }>)
    );
}

async function fetchAlbumYearCounts(trackIds: string[]): Promise<{ year: number, count: number }[]> {
    const tracks = await prisma.album.findMany({
        where: {
            sid: {
                in: trackIds,
            },
        },
        select: {
            date: true,
        },
    });

    return Object.values(
        tracks.reduce((acc, { date }) => {
            const year = date.getFullYear();

            acc[year] ??= { year, count: 0 };
            acc[year].count++;

            return acc;
        }, {} as Record<number, { year: number; count: number }>)
    );
}

export default defineEventHandler(async (event) => {
    if(!isDev) {
        setHeader(event, 'Cache-Control', 'public, max-age=86400') // 24 hours
    }

    return await getInfinityPreview()
})