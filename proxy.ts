import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/profile', '/zaap'];
const publicRoutes = ['/', '/auth'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('fb-token')?.value;

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isPublic = publicRoutes.includes(pathname);

  // If user is not authenticated and trying to access a protected route
  if (!token && isProtected) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // If user is authenticated and trying to access auth page, redirect to dashboard
  if (token && pathname === '/auth') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
