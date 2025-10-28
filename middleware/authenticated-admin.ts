export default defineNuxtRouteMiddleware(() => {
    const { loggedIn, user } = useUserSession()

    // redirect the user to the login screen if they're not authenticated
    if(!loggedIn.value || !user.value.admin) {
        return navigateTo('/admin/login')
    }
})