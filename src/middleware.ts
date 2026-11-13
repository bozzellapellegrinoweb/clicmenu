import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/menus", "/admin"];

// Subdomains that are NOT business slugs
const RESERVED_SUBDOMAINS = new Set(["www", "app", "api", "admin", "mail", "smtp", "ftp"]);

// ── Clicmenu in pausa (decisione di Sara Tufo del 13/11/2026) ────────────
// Iscrizioni chiuse: il menu digitale con QR diventa una funzione del gestionale TuttiServiti.
// Tutte le pagine mostrano questo avviso e le API (traduzione AI, Stripe) rispondono 503.
// Per riaprire Clicmenu: variabile d'ambiente CLICMENU_APERTO=1 su Vercel, oppure togliere questo blocco.
const CLICMENU_IN_PAUSA = process.env.CLICMENU_APERTO !== "1";
const PAGINA_PAUSA = `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Clicmenu è in pausa</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#faf8f5;color:#15191b;font-family:system-ui,-apple-system,Segoe UI,sans-serif}main{max-width:32rem;padding:2rem;text-align:center}h1{font-size:1.8rem;margin:0 0 1rem}p{font-size:1.1rem;line-height:1.6;color:#56625f}a{color:#0e4a55;font-weight:700}</style></head><body><main><h1>Clicmenu è in pausa</h1><p>Le iscrizioni sono chiuse. Il menu digitale con QR sta diventando una funzione di TuttiServiti, il gestionale per ristoranti.</p><p><a href="https://tuttiserviti.com/">Scopri TuttiServiti</a></p></main></body></html>`;

export async function middleware(request: NextRequest) {
  if (CLICMENU_IN_PAUSA) {
    if (request.nextUrl.pathname.startsWith("/api")) {
      return new NextResponse("Clicmenu è in pausa.", { status: 503 });
    }
    return new NextResponse(PAGINA_PAUSA, {
      status: 503,
      headers: { "content-type": "text/html; charset=utf-8", "retry-after": "86400" },
    });
  }

  // ── Subdomain routing (ciaobello.clicmenu.ai → /m/ciaobello) ──────────────
  // x-forwarded-host is set by the Cloudflare Worker when proxying *.clicmenu.ai
  const hostname = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
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
