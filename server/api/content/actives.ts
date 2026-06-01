import prisma from "~/lib/prisma";
import { RichArtist } from "~/types/content";

export default defineEventHandler(async (event): Promise<RichArtist[] | string> => {
    const {user} = await requireUserSession(event)

    if(!user.admin) {
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden"
        })
    }

    const query = getQuery(event)
    const list = query.list !== undefined

    const activeYear = new Date().getFullYear();
    const minimumActiveYear = activeYear - 1;

    const artists = await prisma.artist.findMany({
        select: {
            id: true,
            name: true,
            image: true,
            track_artist: {
                select: {
                    track: {
                        select: {
                            date: true,
                        },
                    },
                },
            },
        },
    });

    const filtered = artists
        .filter((artist) => {
            const trackYears = artist.track_artist
                .map(({ track }) => new Date(track.date).getFullYear())
                .filter((year): year is number => year !== null);

            const trackCount = artist.track_artist.length;
            const lastReleaseYear = Math.max(...trackYears);

            return trackCount > 100 || lastReleaseYear >= minimumActiveYear;
        })
        .map(({ track_artist, ...artist }) => RichArtist.mapJson(artist));

    console.log("active artists: %o", filtered.length);

    if(list) {
        return filtered.map(a => `"${a.id}"`).join(',');
    } else {
        return filtered
    }
});