import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) return null;

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/auth/login`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                        signal: controller.signal
                    });
                    clearTimeout(timeoutId);

                    const user = await res.json();

                    if (res.ok && user) {
                        return user;
                    } else {
                        console.error("Login Failed:", user);
                        return null;
                    }
                } catch (e) {
                    console.error("Auth Error:", e);
                    return null;
                }
            }
        })
    ],
    pages: {
        signIn: '/login', // Custom login page
    },
    callbacks: {
        async jwt({ token, user }: any) {
            // Initial sign in
            if (user) {
                token.accessToken = user.access_token;
                token.id = user.user_id;
                token.role = user.role;
                token.full_name = user.full_name;
                token.credits = user.credits;
            }
            return token;
        },
        async session({ session, token }: any) {
            session.user.id = token.id;
            session.user.role = token.role;
            session.user.full_name = token.full_name;
            session.user.credits = token.credits;
            session.accessToken = token.accessToken;
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
