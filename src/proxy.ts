import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, isValidSessionToken } from "@/lib/auth";

// Protege todas as páginas e rotas da UI com um PIN de acesso (APP_PASSWORD).
// Rotas liberadas sem senha:
//   - /login, /api/login, /api/logout → fluxo de autenticação da própria UI
//   - /api/ai/*                        → autenticadas por Bearer token próprio (AI_API_TOKEN)
//   - /manifest.webmanifest, /sw.js, /icons/*  → assets do PWA
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    pathname === "/login" ||
    pathname === "/api/login" ||
    pathname === "/api/logout" ||
    pathname.startsWith("/api/ai/") ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js" ||
    pathname.startsWith("/icons/");

  if (isPublic) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!(await isValidSessionToken(token))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Aplica o middleware em tudo, exceto arquivos estáticos internos do Next.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
