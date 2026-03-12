import type {FlatArtist} from "~/types/content";

export type ZoomerType = Artist | Festival

export interface Artist {
    id: "artist"
    name: string // not used
    instance: FlatArtist
}

export interface Festival {
    id?: "festival"
    name: string
    years: number[] | number
    fields?: Record<string, string>
    options: Record<string, string[]>
}

export const festivalOptions = <Festival[]>[
    // years definition:
    // '2003': once in 2003
    // '[2003]: 2003 until today
    // '[2003, 2005]': 2003 until 2005
    {
        name: "Defqon.1",
        years: [2003],
        options: {
            stage: ['Red', 'Blue', 'Black', 'UV', 'Magenta', 'Green', 'Yellow', 'Gold', 'Purple', 'White', 'Indigo',
                'Pink', 'Orange', 'Silver']
        }
    },
    {
        name: "Qlimax",
        years: [2000, 2024]
    },
    {
        name: "Qapital",
        years: [2013, 2022]
    },
    {
        name: "Q-Base",
        years: [2004, 2018]
    },
    {
        name: "IMPAQT",
        years: 2019
    },
    {
        name: "Reverze",
        years: [2006],
        options: {
            stage: ["Sportpaleis", "Lotto Arena"]
        }
    }
]

export interface ZoomerInternalImage {
    height: number,
    width: number,
    src: string,
    transforms: {
        scaleX: number,
        scaleY: number,
        translateX: number,
        translateY: number,
    }
}

export interface ZoomerImageData {
    img64?: string, // only used during creation
    imgName?: string,
    author: string,
    width: number,
    height: number,
    stepWidths: number[],
    stepHeights: number[],
    stepLefts: number[],
    stepTops: number[],
    stepTranslateXs: number[],
    stepTranslateYs: number[],
    stepScaleXs: number[],
    stepScaleYs: number[]
}