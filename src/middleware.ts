import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

// Old cap.direct URLs → new ones, so existing links and Google results keep working.
const LEGACY: Record<string, string> = {
  "/cases": "/work",
  "/contacts": "/contact",
};

/**
 * The admin only opens on the hosts listed in ADMIN_HOSTS (comma-separated, `*` wildcards),
 * e.g. ADMIN_HOSTS=admin.cap.direct. On every other host — the official site — the admin,
 * its sign-in pages and its APIs answer "page not found", as if they didn't exist.
 * When ADMIN_HOSTS isn't set: in development only this computer and the local network can
 * open it; in production the admin stays closed everywhere until ADMIN_HOSTS is set.
 * Only the real Host header is used (forwarded-host headers can be faked by anyone).
 */
const LOCAL_HOSTS = ["localhost", "127.0.0.1", "[::1]", "192.168.*", "10.*", "172.16.*"];

function adminHostAllowed(req: NextRequest) {
  const raw = req.headers.get("host") || "";
  const host = raw.split(",")[0].trim().toLowerCase().replace(/:\d+$/, "");
  const list = (process.env.ADMIN_HOSTS || "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
  if (!list.length && process.env.NODE_ENV === "production") return false;
  const patterns = list.length ? list : LOCAL_HOSTS;
  return patterns.some((p) => new RegExp(`^${p.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`).test(host));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (LEGACY[pathname]) return NextResponse.redirect(new URL(LEGACY[pathname], req.url), 308);
  if (pathname.startsWith("/cases/")) {
    return NextResponse.redirect(new URL(pathname.replace("/cases/", "/work/"), req.url), 308);
  }

  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminApi = pathname.startsWith("/api/admin") || pathname.startsWith("/api/auth");
  if (!isAdminArea && !isAdminApi) return NextResponse.next();

  // Not the admin address → behave exactly like a page that doesn't exist.
  if (!adminHostAllowed(req)) {
    if (isAdminApi) return new NextResponse("Not found", { status: 404 });
    return NextResponse.rewrite(new URL("/__not-found", req.url), { status: 404 });
  }

  // Sign-in, forgot-password and reset pages (and their APIs) are open; everything else needs a session.
  const isPublic = ["/admin/login", "/admin/forgot", "/admin/reset"].includes(pathname) || pathname.startsWith("/api/auth");
  if (isPublic) return NextResponse.next();

  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (session) return NextResponse.next();

  if (isAdminApi) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const url = new URL("/admin/login", req.url);
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*", "/api/auth/:path*", "/cases", "/cases/:path*", "/contacts"],
};
