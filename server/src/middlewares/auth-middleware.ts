import type { MiddlewareHandler } from "hono";
import { auth } from "@/lib/auth";

export const authMiddleware: MiddlewareHandler = async (c, next) => {
    // Ambil session dari Better Auth
    const session = await auth.api.getSession({
        headers: c.req.raw.headers,
    });

    // Jika tidak ada session → unauthorized
    if (!session) {
        return c.json(
            { error: "Unauthorized", message: "Please login first." },
            401
        );
    }

    // Simpan user & session ke context
    c.set("user", session.user);
    c.set("session", session.session);

    // Lanjut ke handler berikutnya
    await next();
};
