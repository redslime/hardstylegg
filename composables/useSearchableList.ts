import {computed, ref, watch} from "vue"
import Fuse from "fuse.js"

export interface SearchableResult<T> {
    item: T
    score: number | undefined
    matches?: ReadonlyArray<Fuse.FuseResultMatch>
}

interface UseSearchableListOptions<T> {
    minQueryLength?: number
    debounceMs?: number
    maxFuseResults?: number
    fuseKeys?: string[]
    getSearchText: (item: T) => string
}

export function useSearchableList<T>(
    items: Ref<T[] | undefined>,
    options: UseSearchableListOptions<T>
) {
    const {
        minQueryLength = 5,
        debounceMs = 300,
        maxFuseResults = 5,
        fuseKeys = [],
        getSearchText
    } = options

    const query = ref("")
    const debouncedQuery = ref("")
    const results = ref<SearchableResult<T>[]>([])
    const normalizedItems = computed<T[]>(() => items.value ?? [])

    let timeout: number | undefined

    const fuse = computed(() => {
        return new Fuse(normalizedItems.value, {
            includeScore: true,
            includeMatches: true,
            keys: fuseKeys
        })
    })

    watch(query, (value) => {
        const trimmed = value.trim()

        if (debouncedQuery.value === trimmed) return

        if (timeout) {
            clearTimeout(timeout)
        }

        results.value = []

        timeout = window.setTimeout(() => {
            debouncedQuery.value = trimmed
        }, debounceMs)
    })

    watch([debouncedQuery, normalizedItems], ([value]) => {
        const currentItems = normalizedItems.value

        if (value.length < minQueryLength || currentItems.length === 0) {
            results.value = []
            return
        }

        const normalizedQuery = value.toLowerCase()

        const exactMatches: SearchableResult<T>[] = currentItems
            .filter((item) => getSearchText(item).toLowerCase().includes(normalizedQuery))
            .map((item) => ({
                item,
                score: 0
            }))

        if (exactMatches.length > 0) {
            results.value = exactMatches
            return
        }

        const keywords = normalizedQuery
            .split(/\s+/)
            .filter((keyword) => keyword.length > 2)

        const keywordMatches: SearchableResult<T>[] = currentItems
            .map((item) => {
                const text = getSearchText(item).toLowerCase()
                const matchedKeywords = keywords.filter((keyword) => text.includes(keyword))

                return {
                    item,
                    matchCount: matchedKeywords.length,
                    matchScore: keywords.length > 0 ? matchedKeywords.length / keywords.length : 0
                }
            })
            .filter((result) => result.matchCount >= Math.min(2, keywords.length))
            .sort((a, b) => b.matchScore - a.matchScore)
            .map((result) => ({
                item: result.item,
                score: 1 - result.matchScore
            }))

        if (keywordMatches.length < maxFuseResults) {
            const fuseResults: SearchableResult<T>[] = fuse.value
                .search(value, {limit: maxFuseResults})
                .map(({item, score, matches}) => ({
                    item,
                    score,
                    matches
                }))

            const combined = [...keywordMatches]

            for (const fuseResult of fuseResults) {
                if (combined.length >= maxFuseResults) break
                if (!combined.find((result) => result.item === fuseResult.item)) {
                    combined.push(fuseResult)
                }
            }

            results.value = combined
            return
        }

        results.value = keywordMatches
    }, {immediate: true})

    const resultsLength = computed(() => results.value.length)
    const isSearching = computed(() => debouncedQuery.value.length >= minQueryLength)
    const computedPageProvider = computed(() => {
        const copyComputed = results.value // required to trigger re-calculation
        return async function pageProvider(pageNumber: number, pageSize: number) {
            const start = pageNumber * pageSize
            const end = Math.min(start + pageSize, resultsLength.value)
            return results.value.slice(start, end)
        }
    })

    return {
        query,
        debouncedQuery,
        results,
        resultsLength,
        isSearching,
        minQueryLength,
        maxFuseResults,
        computedPageProvider
    }
}