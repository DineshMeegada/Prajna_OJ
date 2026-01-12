
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Public paths that don't satisfy the protection check
    const publicPaths = ['/login', '/signup', '/google', '/static', '/_next', '/favicon.ico', '/forgot-password'];

    // Check if the current path is public
    const isPublicPath = publicPaths.some(path =>
        request.nextUrl.pathname.startsWith(path) || request.nextUrl.pathname === '/'
    );

    // Note: The Homepage '/' is technically public, effectively the "Landing Page". 
    // The user said: "By default, the user should be shown login page. When he is successfully logged in, then only he could access any other page in the frontend part"
    // This usually implies that even '/' might redirect to login if not authenticated, OR '/' IS the login page.
    // BUT, we have a separate '/login' page.
    // AND the user said "Show the app/page.tsx. In that put a profile section... if user clicks... redirect to dashboard."
    // So '/' MUST be public.

    // We will protect specific routes or everything EXCEPT public.
    // The auth uses localStorage, so we check for a client-set cookie 'is_authenticated'
    // which serves as a hint for the middleware.
    const isAuthenticated = request.cookies.get('is_authenticated');

    // If user is trying to access a protected route and is not authenticated, redirect to login
    if (!isPublicPath && !isAuthenticated) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('next', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Optional: If user is on Login/Signup and HAS a token, redirect to optional default?
    // Use AuthContext for that usually.

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
