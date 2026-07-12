import {getGraphCache} from "~/server/utils/graphCache";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const minWeight = Number(query.minWeight ?? 1);
    const limit = Number(query.limit ?? 0);
    const graph = await getGraphCache()
    let links = graph.links.filter(link => link.value >= minWeight);

    if (limit > 0) {
        links = links.slice(0, limit);
    }

    const usedArtistIds = new Set<string>();

    for (const link of links) {
        usedArtistIds.add(link.source);
        usedArtistIds.add(link.target);
    }

    const nodes = graph.nodes.filter(artist => usedArtistIds.has(artist.id));

    return {
        nodes,
        links,
    };
});