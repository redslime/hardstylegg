import type {Track} from "~/types/models";

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

export function findDuplicates(items: Track[]): Record<string, Track[]> {
    const duplicates: Record<string, Track[]> = {}

    findExactDuplicates(items, duplicates)
    findObviousSuffixes(items, duplicates)
    findExtendedRemixDuplicates(items, duplicates)
    findVersionsDuplicates(items, duplicates)

    return duplicates
}

function findExactDuplicates(items: Track[], duplicates: Record<string, Track[]>) {
    for(let item of items) {
        const sameTitles = items.filter(t => t.title === item.title && t.sid !== item.sid)
        sameTitles.forEach(t => addDuplicate(item, t, duplicates))
    }
}

function findObviousSuffixes(items: Track[], duplicates: Record<string, Track[]>) {
    for(let item of items) {
        const title = item.title.toLowerCase()

        for(const suffix of suffixes) {
            const duplicateTitle = title + suffix.toLowerCase()
            items.filter(t => t.title.toLowerCase() === duplicateTitle).forEach(t => addDuplicate(item, t, duplicates))
        }
    }
}

function findExtendedRemixDuplicates(items: Track[], duplicates: Record<string, Track[]>) {
    for(let item of items) {
        const title = item.title.toLowerCase()

        if(title.includes("remix")) {
            const duplicateTitle = title.replace("remix", "extended remix")
            items.filter(t => t.title.toLowerCase() === duplicateTitle).forEach(t => addDuplicate(item, t, duplicates))
        }
    }
}

function findVersionsDuplicates(items: Track[], duplicates: Record<string, Track[]>) {
    let checked: Track[] = []

    for(let item of items) {
        if(checked.includes(item)) continue

        checked.push(item)
        const title = item.title.toLowerCase()

        if(title.includes("-")) {
            const samies = items.filter(t => t.cover_art === item.cover_art && t.sid !== item.sid)

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

function addDuplicate(sample: Track, duplicate: Track, duplicates: Record<string, Track[]>) {
    const key = sample.title
    duplicates[key] = duplicates[key] || []
    
    if(!duplicates[key].includes(sample)) {
        duplicates[key]!!.push(sample)
    }

    if(!duplicates[key].includes(duplicate)) {
        duplicates[key]!!.push(duplicate)
    }
}