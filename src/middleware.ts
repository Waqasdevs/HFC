import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Configured marketing domains (e.g., custom landing page domain)
  const marketingDomain = process.env.MARKETING_DOMAIN;

  const isMarketingHost = Boolean(
    (marketingDomain && hostname.toLowerCase().includes(marketingDomain.toLowerCase())) ||
    (
      process.env.NODE_ENV === 'production' &&
      !hostname.includes('hfc-kappa') &&
      !hostname.includes('muhammad-waqas-project') &&
      !hostname.includes('localhost') &&
      !hostname.includes('127.0.0.1') &&
      !hostname.endsWith('.vercel.app')
    )
  );

  // If request arrives at root "/" from a dedicated marketing domain, rewrite to /landing
  if (isMarketingHost && url.pathname === '/') {
    url.pathname = '/landing';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, manifest.json, sw.js, icons, public images
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icon|images).*)',
  ],
};
