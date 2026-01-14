import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Skip middleware for public routes - let client-side handle auth
  // This avoids issues with localStorage not being available in middleware
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For protected routes, let client-side handle redirects
  // The useAuth hook will handle authentication checks
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
