import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/i18n/config";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

const SESSION_COOKIE = "taxiq_session";

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get(SESSION_COOKIE);
    if (!session) {
      const signInUrl = new URL(`/${defaultLocale}/sign-in`, request.url);
      signInUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
