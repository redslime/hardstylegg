import prisma from "~/lib/prisma";
import type {RichAlbum, RichTrack} from "~/types/content";

export default defineEventHandler(async (event): Promise<RichAlbum[]> => {
    const isDev = useRuntimeConfig().public.isDev

    if(!isDev) {
        setHeader(event, 'Cache-Control', 'private, max-age=2592000') // 1 month
    } else {
        setHeader(event, 'Cache-Control', 'private, max-age=600') // 10 minutes
    }

    const recs = await prisma.album.findMany({
        include: {
            album_artist: {
                include: {
                    artist: true
                }
            },
            album_track: {
                include: {
                    track: {
                        include: {
                            track_artist: {
                                include: {
                                    artist: true
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    return recs.map(rec => {
        return <RichAlbum>{
            sid: rec.sid,
            title: rec.title,
            date: rec.date,
            artists: rec.album_artist.map(a => a.artist),
            tracks: rec.album_track.map(t => t.index)
                .sort((n1, n2) => n1 - n2) // ensure the index order is kept
                .map(i => rec.album_track.find(t => t.index === i)!.track)
                .map(t => <RichTrack>{
                    sid: t.sid,
                    title: t.title,
                    date: t.date,
                    artists: t.track_artist.map(a => a.artist),
                    image: t.cover_art,
                    hidden: t.hidden
            }),
            image: rec.cover_art,
            hidden: rec.hidden
        }
    })
})