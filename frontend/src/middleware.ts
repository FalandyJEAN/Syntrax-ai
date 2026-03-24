import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/login",
    },
});

export const config = {
    // Protects dashboard and all sub-routes
    // Also protects docs if we wanted, but keeping docs public for now
    matcher: ["/dashboard/:path*", "/admin/:path*"],
};
