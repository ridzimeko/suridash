import { createAuthClient } from "better-auth/react"
export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_BASE_URL_API + '/auth' // The base URL of your auth server
})