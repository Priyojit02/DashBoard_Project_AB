// ============================================
// MIDDLEWARE - Authentication & Route Protection
// ============================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/login', '/api/health'];

// Routes that should redirect to dashboard if authenticated
const authRoutes = ['/login'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Skip middleware for static files and API routes (except protected ones)
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.includes('.') // Static files
    ) {
        return NextResponse.next();
    }
    
    // Check if user has auth cookie/token
    // In production, this would check for a valid session token
    const authToken = request.cookies.get('auth-token')?.value;
    const isAuthenticated = Boolean(authToken);
    
    // For demo purposes, we'll allow access without strict auth checking
    // In production, uncomment the following:
    /*
    // Redirect unauthenticated users to login
    if (!isAuthenticated && !publicRoutes.some(route => pathname.startsWith(route))) {
        const url = new URL('/login', request.url);
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }
    
    // Redirect authenticated users away from auth routes
    if (isAuthenticated && authRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    */
    
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
    ],
};
