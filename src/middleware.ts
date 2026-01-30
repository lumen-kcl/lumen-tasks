import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  
  // Allow auth-related routes
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/auth/')) {
    return NextResponse.next();
  }
  
  // Allow internal API key auth (for Lumen's cron polling)
  const apiKey = req.headers.get('x-api-key');
  if (apiKey && apiKey === process.env.LUMEN_API_KEY) {
    return NextResponse.next();
  }
  
  // Require auth for everything else
  if (!req.auth) {
    const signInUrl = new URL('/api/auth/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(signInUrl);
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
