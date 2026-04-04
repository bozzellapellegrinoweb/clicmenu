import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/menus", "/admin"];

// Subdomains that are NOT business slugs
const RESERVED_SUBDOMAINS = new Set(["www", "app", "api", "admin", "mail", "smtp", "ftp"]);

export async function middleware(request: NextRequest) {
  // ── Subdomain routing (ciaobello.clicmenu.ai → /m/ciaobello) ──────────────
  const hostname = request.headers.get("host") ?? "";
  const subdomainMatch = hostname.match(/^([a-z0-9-]+)\.clicmenu\.ai$/i);

  if (subdomainMatch && !RESERVED_SUBDOMAINS.has(subdomainMatch[1].toLowerCase())) {
    const businessSlug = subdomainMatch[1].toLowerCase();
    const { pathname } = request.nextUrl;

    // Pass through API, static files, etc.
    if (
      !pathname.startsWith("/_next") &&
      !pathname.startsWith("/api") &&
      !pathname.startsWith("/favicon") &&
      pathname !== "/robots.txt" &&
      pathname !== "/manifest.json"
    ) {
      const url = request.nextUrl.clone();
      url.pathname = pathname === "/" ? `/m/${businessSlug}` : `/m/${businessSlug}${pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = PROTECTED_PATHS.some((p) =>
    request.nextUrl.pathname.startsWith(p)
  );

  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup")) {
    const isAdmin = user.email === "info@clicmenu.ai";
    return NextResponse.redirect(new URL(isAdmin ? "/admin" : "/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
