
export default defineEventHandler((event) => {
    const env = process.env
    const runtimeConfig = useRuntimeConfig()

    return {
        env, runtimeConfig
    }
})