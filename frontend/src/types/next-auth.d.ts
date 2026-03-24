import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's unique identifier. */
            id: string
            role: string
            full_name: string
            email: string
            credits: number
        } & DefaultSession["user"]
        accessToken: string
    }

    interface User {
        id: string
        role: string
        full_name: string
        access_token: string
        user_id: string
        credits: number
    }
}

declare module "next-auth/jwt" {
    /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
    interface JWT {
        id: string
        role: string
        full_name: string
        accessToken: string
        credits: number
    }
}
