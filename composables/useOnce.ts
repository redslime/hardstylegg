export function useOnce(fn: () => void) {
    const hasRun = ref(false)

    onMounted(() => {
        if (hasRun.value) return
        hasRun.value = true
        fn()
    })
}