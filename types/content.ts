import {formatDate} from "compatx";
import type {List} from "~/types/models";

export abstract class BaseTrack {
    protected constructor(
        public sid: string,
        public title: string,
        public image: string,
    ) {}

    public abstract getArtistsString(): string

    protected abstract isAlbum(): boolean

    public getDisplayName(onlyTitle: boolean = false): string {
        if(onlyTitle) return this.title
        return `${this.getArtistsString()} - ${this.title}`
    }

    public getImageUrl(): string {
        return `https://i.scdn.co/image/${this.image}`
    }

    public isYouTube(): boolean {
        return this.sid.startsWith("yt:")
    }

    public getPlayUrl(): string {
        if(this.isYouTube()) {
            return `https://www.youtube.com/watch?v=${this.sid.replace("yt:", "")}`
        } else {
            if(this.isAlbum()) {
                return `https://open.spotify.com/album/${this.sid}`
            } else {
                return `https://open.spotify.com/track/${this.sid}`
            }
        }
    }
}

export class FlatTrack extends BaseTrack {
    constructor(
        sid: string,
        title: string,
        public artists: string,
        public year: number,
        image: string
    ) {
        super(sid, title, image)
        this.artists = artists
        this.year = year
    }

    static fromJson(data: any): FlatTrack {
        return new FlatTrack(
            data.sid,
            data.title,
            data.artists,
            data.year,
            data.image ?? data.cover_art
        )
    }

    static mapJson(data: any): FlatTrack {
        return <FlatTrack>{
            sid: data.sid,
            title: data.title,
            artists: data.artists,
            year: data.year,
            image: data.image ?? data.cover_art
        }
    }

    public override getArtistsString(): string {
        return this.artists
    }

    protected override isAlbum(): boolean {
        return false
    }
}

export class RichTrack extends BaseTrack {
    constructor(
        sid: string,
        title: string,
        public artists: RichArtist[],
        public date: Date,
        image: string,
        public hidden: boolean = false
    ) {
        super(sid, title, image)
        this.date = new Date(date)
    }

    static fromJson(data: any): RichTrack {
        return new RichTrack(
            data.sid,
            data.title,
            data.artists?.map((a: any) => RichArtist.fromJson(a)) || [],
            new Date(data.date),
            data.image,
            data.hidden
        )
    }

    static mapJson(data: any): RichTrack {
        return <RichTrack>{
            sid: data.sid,
            title: data.title,
            artists: data.artists?.map((a: any) => RichArtist.fromJson(a)) || [],
            date: new Date(data.date),
            image: data.image,
            hidden: data.hidden
        }
    }

    public get year(): number {
        return this.date.getFullYear()
    }

    public override getArtistsString(): string {
        return this.artists.map(a => a.name).join(' & ')
    }

    public getFriendlyDate(): string {
        return formatDate(this.date)
    }

    protected override isAlbum(): boolean {
        return false
    }

    public toFlatTrack(): FlatTrack {
        return new FlatTrack(
            this.sid,
            this.title,
            this.getArtistsString(),
            this.year,
            this.image
        )
    }
}

export class FlatAlbum extends FlatTrack {
    constructor(
        sid: string,
        title: string,
        artists: string,
        year: number,
        image: string
    ) {
        super(sid, title, artists, year, image);
    }

    static override fromJson(data: any) {
        return new FlatAlbum(
            data.sid,
            data.title,
            data.artists,
            data.year,
            data.image
        )
    }

    static override mapJson(data: any) {
        return <FlatAlbum>{
            sid: data.sid,
            title: data.title,
            artists: data.artists,
            year: data.year,
            image: data.image
        }
    }

    protected override isAlbum(): boolean {
        return true
    }
}

export class RichAlbum extends RichTrack {
    constructor(
        sid: string,
        title: string,
        artists: RichArtist[],
        public tracks: RichTrack[],
        date: Date,
        image: string,
        hidden: boolean = false
    ) {
        super(sid, title, artists, date, image, hidden)
    }

    static override fromJson(data: any) {
        return new RichAlbum(
            data.sid,
            data.title,
            data.artists?.map((a: any) => RichArtist.fromJson(a)) || [],
            data.tracks?.map((t: any) => RichTrack.fromJson(t)) || [],
            new Date(data.date),
            data.image,
            data.hidden
        )
    }

    static override mapJson(data: any) {
        return <RichAlbum>{
            sid: data.sid,
            title: data.title,
            artists: data.artists?.map((a: any) => RichArtist.fromJson(a)) || [],
            tracks: data.tracks?.map((t: any) => RichTrack.fromJson(t)) || [],
            date: new Date(data.date),
            image: data.image,
            hidden: data.hidden
        }
    }

    protected override isAlbum(): boolean {
        return true
    }

    public toFlatAlbum(): FlatAlbum {
        return new FlatAlbum(
            this.sid,
            this.title,
            this.getArtistsString(),
            this.year,
            this.image
        )
    }

    public getTrackCount(): number {
        return this.tracks.length
    }

    public override getArtistsString(): string {
        return this.artists.map(a => a.name).join(' & ')
    }
}

export class FlatArtist {
    constructor(
        public id: string,
        public name: string
    ) {}

    static fromJson(data: any) {
        return new FlatArtist(
            data.id,
            data.name
        )
    }

    static mapJson(data: any) {
        return <FlatArtist>{
            id: data.id,
            name: data.name
        }
    }

    public getDisplayName(): string {
        return this.name
    }
}

export class RichArtist extends FlatArtist {
    constructor(
        id: string,
        name: string,
        public image: string | null,
        public listeners: number | null
    ) { super(id, name) }

    static override fromJson(data: any) {
        return new RichArtist(
            data.id,
            data.name,
            data.image,
            data.listeners
        )
    }

    static override mapJson(data: any) {
        return <RichArtist>{
            id: data.id,
            name: data.name,
            image: data.image,
            listeners: data.listeners
        }
    }

    public getListenersFriendly(): string | undefined {
        return this.listeners?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    public toFlatArtist(): FlatArtist {
        return new FlatArtist(this.id, this.name)
    }

    public getImageUrl(): string {
        return `https://i.scdn.co/image/${this.image}`
    }
}

export function getContentId(item: RichTrack | RichAlbum | RichArtist | BaseTrack): string {
    if('id' in item) {
        return item.id
    } else if('sid' in item) {
        return item.sid
    }

    return "<invalid>"
}

export function remapList(list: List): List {
    if(list.type === 'artist') {
        list.items = list.items.map(i => {
            i.item = RichArtist.fromJson(i.item)
            return i
        })
    } else if(list.type === 'album') {
        list.items = list.items.map(i => {
            i.item = FlatAlbum.fromJson(i.item)
            return i
        })
    } else if(list.type === 'track') {
        list.items = list.items.map(i => {
            i.item = FlatTrack.fromJson(i.item)
            return i
        })
    }

    return list
}