export default defineEventHandler((event) => {
    return {
        env: process.env,
        runtimeConfig: useRuntimeConfig()
    }
})