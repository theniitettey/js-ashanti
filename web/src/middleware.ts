import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const sessionCookie = req.cookies.get("__Secure-auth-cookies.session_token")?.value;

  const isOnProtectedRoute = pathname.startsWith("/admin");
  const isOnAuthRoute = pathname === "/login";


  // Not logged in and trying to access /admin route
  if (!sessionCookie && isOnProtectedRoute ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Logged in and trying to access /login
  if (sessionCookie && isOnAuthRoute) {
      return NextResponse.redirect(new URL("/admin", req.url));
}

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"], // Only run middleware on actual page routes
};