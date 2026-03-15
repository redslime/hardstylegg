import {computed, type MaybeRefOrGetter, ref, type Ref, toValue} from "vue"
import {delay} from "~/utils/utils"

interface SearchInputItem<T> {
    item: T
}

interface UseSelectableSearchInputOptions<T> {
    query: Ref<string>
    debouncedQuery?: Ref<string>
    filtered: MaybeRefOrGetter<SearchInputItem<T>[]>
    allOptions: MaybeRefOrGetter<T[]>
    getItemLabel: (item: T) => string
    onSelect: (item: T, inputFeedback: (success: boolean) => boolean) => void
    onTextEnter?: (query: string, inputFeedback: (success: boolean) => boolean) => void
    defaultPlaceholder: MaybeRefOrGetter<string>
    fetchProgress: MaybeRefOrGetter<number>
    minQueryLength?: MaybeRefOrGetter<number>
    xl?: MaybeRefOrGetter<boolean | undefined>
    textMode?: MaybeRefOrGetter<boolean | undefined>
}

export function useSelectableSearchInput<T>(options: UseSelectableSearchInputOptions<T>) {
    const {
        query,
        debouncedQuery,
        filtered,
        allOptions,
        getItemLabel,
        onSelect,
        onTextEnter,
        defaultPlaceholder,
        fetchProgress,
        minQueryLength = 3,
        xl = false,
        textMode = false
    } = options

    const hoverIndex = ref(-1)
    const selected = ref(false)
    const errorFlash = ref(false)
    const successFlash = ref(false)

    const visible = computed(() => {
        if (toValue(textMode)) return false

        return query.value.trim().length >= toValue(minQueryLength)
            && toValue(filtered).length > 0
    })

    const placeholder = computed(() => {
        if (errorFlash.value) {
            return "Incorrect"
        }

        return toValue(defaultPlaceholder)
    })

    const inputFeedback = (success: boolean): boolean => {
        query.value = ""
        if (debouncedQuery) {
            debouncedQuery.value = ""
        }
        hoverIndex.value = -1

        if(success) {
            successFlash.value = true
            delay(400).then(() => successFlash.value = false)
        } else {
            errorFlash.value = true
            delay(400).then(() => errorFlash.value = false)
        }

        return success
    }

    function select(item: T) {
        query.value = getItemLabel(item)
        selected.value = true
        hoverIndex.value = -1
        onSelect(item, inputFeedback)
    }

    function enter() {
        if (toValue(textMode)) {
            onTextEnter?.(query.value, inputFeedback)
            return
        }

        if (!visible.value) return

        const currentFiltered = toValue(filtered)

        if (hoverIndex.value !== -1) {
            const hovered = currentFiltered[hoverIndex.value]
            if (hovered) {
                select(hovered.item)
            }
            return
        }

        const exactMatches = toValue(allOptions).filter((item) => {
            return query.value.toLowerCase() === getItemLabel(item).toLowerCase()
        })

        if (exactMatches.length === 1) {
            select(exactMatches[0]!)
        } else {
            inputFeedback(false)
        }
    }

    function down() {
        if (visible.value) {
            hoverIndex.value = Math.min(hoverIndex.value + 1, toValue(filtered).length - 1)
        }
    }

    function up() {
        if (visible.value) {
            hoverIndex.value = Math.max(hoverIndex.value - 1, 0)
        }
    }

    async function unfocused() {
        await delay(500)
        selected.value = true
    }

    const inputBindings = computed(() => ({
        value: query.value,
        class: [
            "input w-full",
            {
                "md:input-xl": !!toValue(xl),
                "border-error bg-error font-medium text-xl text-error-content text-center uppercase caret-transparent": errorFlash.value,
                "border-success": successFlash.value
            }
        ],
        placeholder: placeholder.value,
        disabled: toValue(fetchProgress) !== 100
    }))

    const inputEvents = {
        input: (event: Event) => {
            query.value = (event.target as HTMLInputElement).value
            hoverIndex.value = -1
            selected.value = false
        },
        keyup: (event: KeyboardEvent) => {
            if (event.key === "Enter") enter()
            else if (event.key === "ArrowUp") up()
            else if (event.key === "ArrowDown") down()
        },
        focusout: unfocused
    }

    return {
        hoverIndex,
        selected,
        errorFlash,
        successFlash,
        visible,
        placeholder,
        inputBindings,
        inputEvents,
        select,
        enter,
        down,
        up,
    }
}