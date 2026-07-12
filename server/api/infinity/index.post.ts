import {readBody} from "h3";
import type {InfinityRequestContainer, InfinityResponseContainer} from "~/types/models";
import {findGameById} from "~/server/utils/game/serverGameRegistry";
import {inflate, pickRandomItems, shuffleArray, unzip, zip} from "~/utils/utils";
import prisma from "~/lib/prisma";
import {getDayIdToday} from "~/server/utils/schedule";
import {YEAR_FILTER_GAMES} from "#shared/games";
import type {
    ArtworkContainer,
    CompleteAlbumContainer,
    CompleteLyricsContainer,
    HeardleContainer
} from "~/types/gameModels";

type Cache = {
    id: number;
    data: YearGroupedEntry[] | number[]
}[]
type YearGroupedEntry = {
    year: number;
    gameIds: number[];
}
let cache: Cache | null = null

async function getCache(): Promise<Cache> {
    if(cache === null) {
        const games: Record<number, number[]> = {}
        const schedule = await prisma.day_schedule.findMany({
            where: {
                day: {
                    lt: getDayIdToday()
                }
            }
        })

        cache = [] as Cache
        schedule.forEach(item => {
            const typeIds = JSON.parse(item.type_ids) as number[]
            const gameIds = JSON.parse(item.game_ids) as number[]

            typeIds.forEach(async (typeId, index) => {
                const gameId = gameIds[index]!!

                if(typeId in games) {
                    games[typeId]!!.push(gameId)
                } else {
                    games[typeId] = [gameId]
                }
            })
        })

        for(const [typeId, gameIds] of Object.entries(games)) {
            await putCacheEntry(Number(typeId), gameIds);
        }
    }

    return cache
}

async function putCacheEntry(typeId: number, gameIds: number[]) {
    if (YEAR_FILTER_GAMES.includes(typeId)) {
        const gameDef = findGameById(typeId)
        if (!gameDef) return

        const containers = await gameDef.fetchInstances(gameIds) as (ArtworkContainer | CompleteAlbumContainer | CompleteLyricsContainer | HeardleContainer)[]
        const grouped = groupContainersByYear(containers)
        
        const yearGroupedEntries: YearGroupedEntry[] = Object.entries(grouped).map(([year, ids]) => ({
            year: Number(year),
            gameIds: ids
        }))

        cache!!.push({
            id: typeId,
            data: yearGroupedEntries
        })
    } else {
        cache!!.push({
            id: typeId,
            data: gameIds
        })
    }
}

function groupContainersByYear(containers: (ArtworkContainer | CompleteAlbumContainer | CompleteLyricsContainer | HeardleContainer)[]): Record<number, number[]> {
    const grouped: Record<number, number[]> = {}

    for (const container of containers) {
        let year: number | undefined

        if('track' in container && container.track) {
            year = container.track.year
        } else if('album' in container && container.album) {
            year = container.album.year
        }

        if (year !== undefined && container.id !== undefined) {
            if(!grouped[year]) {
                grouped[year] = []
            }
            grouped[year]!!.push(container.id)
        }
    }

    return grouped
}

async function getCachedIds(typeId: number, start: number, end: number): Promise<number[]> {
    const cacheData = await getCache()
    const typeData = cacheData.find(i => i.id === typeId)
    const resultIds: number[] = []

    if(!typeData || !typeData.data) {
        return []
    }

    if(YEAR_FILTER_GAMES.includes(typeId)) {
        (typeData.data as YearGroupedEntry[]).forEach(e => {
            if(e.year >= start && e.year <= end) {
                e.gameIds.forEach(id => resultIds.push(id))
            }
        })
    } else {
        return typeData.data as number[]
    }

    return resultIds
}

async function saveSharedChallenge(typeIds: number[], gameIds: number[], attempt: number = 1): Promise<string | null> {
    if(attempt > 10) {
        return null
    }

    const code = Math.random().toString(36).substring(2, 8)
        .toUpperCase().replaceAll('O', 'X').replaceAll('0', '1')

    try {
        const fetched = await prisma.infinity.create({
            data: {
                code,
                type_ids: JSON.stringify(typeIds),
                game_ids: JSON.stringify(gameIds),
            }
        })

        return fetched.code
    } catch (e: any) {
        return saveSharedChallenge(typeIds, gameIds, ++attempt)
    }
}

export default defineEventHandler(async (event) => {
    const body = await readBody<InfinityRequestContainer | { code: string }>(event)

    if ('code' in body) {
        const shared = await prisma.infinity.findUnique({
            where: {
                code: body.code
            }
        })

        if (!shared) {
            throw createError({
                statusCode: 404,
                statusMessage: "Entered share code was not found!"
            })
        }

        // special case for shared: we already have the game IDs
        const typeIds = JSON.parse(shared.type_ids) as number[]
        const gameIds = JSON.parse(shared.game_ids) as number[]

        // group by typeId to prepare batch fetching of games
        const typeGames: Record<number, number[]> = {}

        for (let i = 0; i < typeIds.length; i++) {
            const typeId = typeIds[i]!!
            const gameId = gameIds[i]!!

            if (typeId in typeGames) {
                typeGames[typeId]!!.push(gameId)
            } else {
                typeGames[typeId] = [gameId]
            }
        }

        // fetch game instances
        const mappedGames: Record<number, EditorContainer[]> = {}

        for(const [typeId, gameIds] of Object.entries(typeGames)) {
            const gameDef = findGameById(Number(typeId))

            if(gameDef) {
                mappedGames[Number(typeId)] = await gameDef.fetchInstances(gameIds)
            }
        }

        // transform
        const gameData: EditorContainer[] = []

        for(const [typeId, gameId] of zip(typeIds, gameIds)) {
            const match = mappedGames[Number(typeId)]?.find(g => g.id === gameId)

            if(match) {
                gameData.push(match)
            }
        }

        return <InfinityResponseContainer>{ typeIds, gameData }
    } else {
        const container = body
        const typeGames: Record<number, any[]> = {}

        // select valid gameIds per typeId
        for(const typeId of container.typeIds) {
            const gameDef = findGameById(typeId)

            if(gameDef) {
                const gameIds = await getCachedIds(typeId, container.startYear, container.endYear)
                let pickedIds: number[] = []

                if(container.typeLimits && typeId in container.typeLimits) {
                    pickedIds = pickRandomItems(gameIds, container.typeLimits[typeId] ?? gameIds.length)
                } else {
                    pickedIds = shuffleArray(gameIds)
                }

                typeGames[typeId] = await gameDef.fetchInstances(pickedIds)
            }
        }

        // mix game order randomly and transform
        const inflated = shuffleArray(inflate(typeGames))
        const [typeIds, gameData] = unzip(inflated)
        const response = <InfinityResponseContainer>{ typeIds, gameData }

        // share code handling
        if(container.shared) {
            response.shareCode = await saveSharedChallenge(typeIds, gameData.map(d => d.id!!))
        }

        return response
    }
})