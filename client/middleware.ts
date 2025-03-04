import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public paths that don't require authentication
  const publicPaths = ['/', '/signIn', '/register']
  const isPublicPath = publicPaths.includes(pathname)

  // Get the wallet address from the request headers
  const walletAddress = request.headers.get('x-wallet-address')

  // Redirect logic
  if (!walletAddress && !isPublicPath) {
    // Redirect to sign in if trying to access protected route without wallet
    return NextResponse.redirect(new URL('/signIn', request.url))
  }

  if (walletAddress && isPublicPath) {
    // Redirect to dashboard if trying to access public route with wallet
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
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
} 