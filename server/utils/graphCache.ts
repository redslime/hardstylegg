import prisma from "~/lib/prisma";

type GraphNode = {
    id: string;
    name: string;
    image: string | null;
    imageUrl: string | null;
    val: number;
};

type GraphLink = {
    source: string;
    target: string;
    value: number;
};

type GraphCache = {
    nodes: GraphNode[];
    links: GraphLink[];
};

let cache: GraphCache | null = null;
let cachePromise: Promise<GraphCache> | null = null;

export function resetGraphCache() {
    cache = null;
    cachePromise = null;
}

async function buildGraphCache(): Promise<GraphCache> {
    const trackArtists = await prisma.track_artist.findMany({
        where: {
            track: {
                hidden: false,
            },
        },
        select: {
            track_id: true,
            artist_id: true,
        },
    });

    const releaseCounts = await prisma.track_artist.groupBy({
        by: ["artist_id"],
        where: {
            track: {
                hidden: false,
            },
        },
        _count: {
            track_id: true,
        },
    });

    const artistIds = releaseCounts.map(releaseCount => releaseCount.artist_id);
    const artists = await prisma.artist.findMany({
        where: {
            id: {
                in: artistIds,
            },
        },
        select: {
            id: true,
            name: true,
            image: true,
        },
    });

    const releaseCountsByArtistId = new Map(
        releaseCounts.map(releaseCount => [
            releaseCount.artist_id,
            releaseCount._count.track_id,
        ])
    );

    const nodesById = new Map<string, GraphNode>();

    for (const artist of artists) {
        nodesById.set(artist.id, {
            id: artist.id,
            name: artist.name,
            image: artist.image,
            imageUrl: artist.image
                ? `https://i.scdn.co/image/${artist.image}`
                : null,
            val: releaseCountsByArtistId.get(artist.id) ?? 0,
        });
    }

    const artistIdsByTrackId = new Map<string, Set<string>>();

    for (const trackArtist of trackArtists) {
        const trackArtistIds = artistIdsByTrackId.get(trackArtist.track_id) ?? new Set<string>();

        trackArtistIds.add(trackArtist.artist_id);
        artistIdsByTrackId.set(trackArtist.track_id, trackArtistIds);
    }

    const linkWeights = new Map<string, number>();

    for (const artistIds of artistIdsByTrackId.values()) {
        const ids = [...artistIds].sort();

        if (ids.length < 2) {
            continue;
        }

        for (let i = 0; i < ids.length; i++) {
            for (let j = i + 1; j < ids.length; j++) {
                const source = ids[i];
                const target = ids[j];
                const key = `${source}:${target}`;

                linkWeights.set(key, (linkWeights.get(key) ?? 0) + 1);
            }
        }
    }

    const links: GraphLink[] = [...linkWeights.entries()]
        .map(([key, value]) => {
            const [source, target] = key.split(":");

            return {
                source: source!,
                target: target!,
                value,
            };
        })
        .sort((a, b) => b.value - a.value);

    const nodes = [...nodesById.values()]
        .sort((a, b) => b.val - a.val);

    return {
        nodes,
        links,
    };
}

export async function getGraphCache(): Promise<GraphCache> {
    if (cache !== null) {
        return cache;
    }

    if (cachePromise !== null) {
        return cachePromise;
    }

    cachePromise = buildGraphCache()
        .then(result => {
            cache = result;
            cachePromise = null;
            return result;
        })
        .catch(error => {
            cachePromise = null;
            throw error;
        });

    return cachePromise;
}