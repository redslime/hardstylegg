import {BaseTrack} from "~/types/content";

const suffixes = [
    " - Original Mix",
    " - Extended Mix",
    " - Edit",
    " - Original Edit",
    " - Radio Mix",
    " - Radio Edit",
    " - Radio Version",
    " - Pro Mix",
    " - Extended",
    " - DJ Version",
    " - DJ Version Deluxe"
]

export function findDuplicates<T extends BaseTrack>(items: T[]): Record<string, T[]> {
    const duplicates: Record<string, T[]> = {}

    findExactDuplicates(items, duplicates)
    findObviousSuffixes(items, duplicates)
    findExtendedRemixDuplicates(items, duplicates)
    findVersionsDuplicates(items, duplicates)

    return duplicates
}

function findExactDuplicates<T extends BaseTrack>(items: T[], duplicates: Record<string, T[]>) {
    for(let item of items) {
        const sameTitles = items.filter(t => t.title === item.title && t.sid !== item.sid)
        sameTitles.forEach(t => addDuplicate(item, t, duplicates))
    }
}

function findObviousSuffixes<T extends BaseTrack>(items: T[], duplicates: Record<string, T[]>) {
    for(let item of items) {
        const title = item.title.toLowerCase()

        for(const suffix of suffixes) {
            const duplicateTitle = title + suffix.toLowerCase()
            items.filter(t => t.title.toLowerCase() === duplicateTitle).forEach(t => addDuplicate(item, t, duplicates))
        }
    }
}

function findExtendedRemixDuplicates<T extends BaseTrack>(items: T[], duplicates: Record<string, T[]>) {
    for(let item of items) {
        const title = item.title.toLowerCase()

        if(title.includes("remix")) {
            const duplicateTitle = title.replace("remix", "extended remix")
            items.filter(t => t.title.toLowerCase() === duplicateTitle).forEach(t => addDuplicate(item, t, duplicates))
        }
    }
}

function findVersionsDuplicates<T extends BaseTrack>(items: T[], duplicates: Record<string, T[]>) {
    let checked: T[] = []

    for(let item of items) {
        if(checked.includes(item)) continue

        checked.push(item)
        const title = item.title.toLowerCase()

        if(title.includes("-")) {
            const samies = items.filter(t => t.image === item.image && t.sid !== item.sid)

            for(const same of samies) {
                const sameTitle = same.title.toLowerCase()

                if(checked.includes(same)) continue
                checked.push(same)

                if(sameTitle.includes("-")) {
                    const [sampleTitle, sampleSuffix] = title.split("-")
                    const [duplicateTitle, duplicateSuffix] = sameTitle.split("-")

                    if(sampleSuffix!!.includes("remix") || duplicateSuffix!!.includes("remix")) {
                        continue
                    }

                    if(sampleTitle === duplicateTitle) {
                        addDuplicate(item, same, duplicates)
                    }
                }
            }
        }
    }
}

function addDuplicate<T extends BaseTrack>(sample: T, duplicate: T, duplicates: Record<string, T[]>) {
    const key = sample.title
    duplicates[key] = duplicates[key] || []
    
    if(!duplicates[key].includes(sample)) {
        duplicates[key]!!.push(sample)
    }

    if(!duplicates[key].includes(duplicate)) {
        duplicates[key]!!.push(duplicate)
    }
}