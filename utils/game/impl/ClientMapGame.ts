import {ClientGameDef} from "~/utils/game/ClientGameDef";
import type {MapContainer, MapType} from "~/types/gameModels";
import MapIcon from "~/components/games/map/MapIcon.vue";
import MapPreview from "~/components/games/map/MapPreview.vue";
import {GAME_METAS} from "#shared/games";
import MapGame from "~/components/games/map/MapGame.vue";
import MapSummary from "~/components/games/map/MapSummary.vue";
import MapEditor from "~/components/games/map/MapEditor.vue";
import {getName} from "i18n-iso-countries";

export type EventMarker = { id: number, name: string, lat: number, lng: number }

export const mapEventMarkers: EventMarker[] = [
    { id: 1, name: 'Gelredome', lat: 51.96282, lng: 5.89289 },
    { id: 2, name: 'Brabanthallen', lat: 51.70114, lng: 5.29053 },
    { id: 3, name: 'Autotron', lat: 51.71168, lng: 5.41746 },
    { id: 4, name: 'AFAS Live', lat: 52.31211, lng: 4.94438 },
    { id: 5, name: 'Ziggodome', lat: 52.31350, lng: 4.93710 },
    { id: 6, name: 'Amsterdam ArenA', lat: 52.31435, lng: 4.94177 },
    { id: 7, name: 'Amsterdam RAI', lat: 52.34290, lng: 4.88867 },
    { id: 8, name: 'Airport Weeze', lat: 51.60648, lng: 6.12370 },
    { id: 9, name: 'Sportpaleis', lat: 51.23114, lng: 4.44120 },
    { id: 10, name: 'Walibi Holland', lat: 52.44081, lng: 5.75675 },
    { id: 11, name: 'Event Terrain Haaren', lat: 51.61759, lng: 5.22699 },
    { id: 12, name: 'Event Terrain Oisterwijk', lat: 51.56669, lng: 5.17388 },
    { id: 13, name: 'Event Terrain Beekse Bergen', lat: 51.52495, lng: 5.12099 },
    { id: 14, name: '013 Poppodium', lat: 51.55788, lng: 5.09306 },
    { id: 15, name: 'Bootshaus', lat: 50.95168, lng: 6.98192 },
    { id: 16, name: 'E3 Strand', lat: 51.38246, lng: 5.33509 },
    { id: 17, name: 'Almere Strand', lat: 52.32980, lng: 5.14280 },
    { id: 18, name: 'Seepark Zülpich', lat: 50.68028, lng: 6.65628 },
    { id: 19, name: 'Maassilo', lat: 51.89753, lng: 4.49390 },
    { id: 20, name: 'Turbinenhalle', lat: 51.48362, lng: 6.86663 },
    { id: 21, name: 'Jaarbeurs', lat: 52.08496, lng: 5.10328 },
    { id: 22, name: 'Westfalenhalle', lat: 51.49651, lng: 7.45682 },
    { id: 23, name: 'Klokgebouw', lat: 51.44880, lng: 5.45782 },
    { id: 24, name: 'Hemkade', lat: 52.42222, lng: 4.81950 },
    { id: 25, name: 'Rotterdam Ahoy', lat: 51.88288, lng: 4.48826 },
    { id: 26, name: 'Breepark', lat: 51.58071, lng: 4.83712 },
    { id: 27, name: 'Time Out', lat: 51.56739, lng: 5.70615 },
]

export interface HighlightMapItem {
    type: MapType
    displayName: () => string
    validate: (container: MapContainer) => boolean
    setGoal: (container: MapContainer) => void
}

export class CountryHighlightMapItem implements HighlightMapItem {

    public iso2: string;
    public color: string;
    public type: MapType = 'countries';

    constructor(iso2: string, color: string) {
        this.iso2 = iso2;
        this.color = color;
    }

    displayName(): string {
        return getName(this.iso2, "en") ?? "";
    }

    validate(container: MapContainer): boolean {
        return container.goal === this.iso2;
    }

    setGoal(container: MapContainer) {
        container.goal = this.iso2;
    }
}

export class EventHighlightMapItem implements HighlightMapItem {

    public id: number;
    public type: MapType = 'events';

    constructor(id: number) {
        this.id = id;
    }

    displayName(): string {
        return mapEventMarkers.find(marker => marker.id === this.id)?.name ?? "";
    }

    validate(container: MapContainer): boolean {
        return Number(container.goal) === this.id;
    }

    setGoal(container: MapContainer) {
        container.goal = this.id.toString();
    }
}

export class ClientMapGame extends ClientGameDef<MapContainer> {

    constructor() {
        super(GAME_METAS.Map, MapGame, MapIcon, MapPreview, MapEditor, MapSummary);
    }

    override getIconPreviewTitle(container: MapContainer): string {
        return container.title;
    }

    override getDashboardHeaderTitle(container: MapContainer): string {
        return container.title
    }

    override getHelpText(container: MapContainer): string {
        return "Your task is to click the correct country on the map.\n\n" +
            "You only have one attempt at guessing!\n" +
            "Can't figure it out? Use the skip button!";
    }

    override remap(data: any): MapContainer {
        return data
    }

    public getHighlightMapItem(container: MapContainer): HighlightMapItem {
        if(container.type === 'countries') {
            return new CountryHighlightMapItem(container.goal, "#3ABDF8")
        } else if(container.type === 'events') {
            return new EventHighlightMapItem(Number(container.goal))
        }

        return new CountryHighlightMapItem(container.goal, "")
    }

    public getGoalName(container: MapContainer): string {
        return this.getHighlightMapItem(container).displayName()
    }
}