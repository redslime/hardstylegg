import {RichArtist} from "~/types/content";
import prisma from "~/lib/prisma";
import type {NavigatorPath} from "~/types/models";

interface ArtistEdge {
    from_id: string
    to_id: string
}

const DEFAULT_MAX_STEPS = 2
const MAX_ALLOWED_STEPS = 5

function parseMaxSteps(value: unknown): number {
    const parsed = Number(Array.isArray(value) ? value[0] : value)

    if (!Number.isInteger(parsed) || parsed < 0) {
        return DEFAULT_MAX_STEPS
    }

    return Math.min(parsed, MAX_ALLOWED_STEPS)
}

export default defineEventHandler(async (event): Promise<NavigatorPath[]> => {
    const {user} = await requireUserSession(event)
    const from = event.context.params?.from
    const to = event.context.params?.to
    const query = getQuery(event)
    const maxSteps = parseMaxSteps(query.maxSteps ?? query.steps)

    if (!from || !to) {
        throw createError({
            statusCode: 400,
            statusMessage: "Missing from or to artist id"
        })
    }

    if (from === to) {
        const artist = await prisma.artist.findUnique({
            select: {
                id: true,
                name: true,
                image: true
            },
            where: {
                id: from
            }
        })

        return artist ? [{nodes: [RichArtist.fromJson(artist)]}] : []
    }

    if (maxSteps === 0) {
        return []
    }

    const edges = await prisma.$queryRaw<ArtistEdge[]>`
        SELECT DISTINCT
            ta1.artist_id AS from_id,
            ta2.artist_id AS to_id
        FROM track_artist ta1
        INNER JOIN track_artist ta2
            ON ta1.track_id = ta2.track_id
        INNER JOIN track t
            ON t.sid = ta1.track_id
        WHERE ta1.artist_id <> ta2.artist_id
          AND t.hidden = 0
    `

    const neighboursByArtist = new Map<string, string[]>()

    for (const edge of edges) {
        const neighbours = neighboursByArtist.get(edge.from_id)

        if (neighbours) {
            neighbours.push(edge.to_id)
        } else {
            neighboursByArtist.set(edge.from_id, [edge.to_id])
        }
    }

    const pathIds: string[][] = []

    function search(current: string, path: string[], visited: Set<string>) {
        if (path.length - 1 > maxSteps) {
            return
        }

        if (current === to) {
            pathIds.push([...path])
            return
        }

        if (path.length - 1 === maxSteps) {
            return
        }

        for (const next of neighboursByArtist.get(current) ?? []) {
            if (visited.has(next)) {
                continue
            }

            visited.add(next)
            path.push(next)

            search(next, path, visited)

            path.pop()
            visited.delete(next)
        }
    }

    search(from, [from], new Set([from]))

    if (pathIds.length === 0) {
        return []
    }

    const artistIds = [...new Set(pathIds.flat())]
    const artists = await prisma.artist.findMany({
        select: {
            id: true,
            name: true,
            image: true
        },
        where: {
            id: {
                in: artistIds
            }
        }
    })

    const artistsById = new Map(
        artists.map(artist => [artist.id, RichArtist.fromJson(artist)])
    )

    return pathIds
        .map(ids => ({
            nodes: ids
                .map(id => artistsById.get(id))
                .filter((artist): artist is RichArtist => artist !== undefined)
        }))
        .filter(path => path.nodes.length > 0 && path.nodes[path.nodes.length - 1]?.id === to)
        .sort((p1, p2) => p1.nodes.length - p2.nodes.length)
})