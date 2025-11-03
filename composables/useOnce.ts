const hasRun = ref(false)

export function useOnce(fn: () => void) {
    onMounted(() => {
        if (hasRun.value) return
        hasRun.value = true
        fn()
    })
}