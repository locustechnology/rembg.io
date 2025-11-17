import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });

    // Set CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

    return response;
  }

  // For all other requests, add CORS headers
  const response = NextResponse.next();

  // Get the origin from the request
  const origin = request.headers.get('origin');

  // List of allowed origins
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://rembg.io',
    'https://www.rembg.io',
    'https://rembg-test-mode.vercel.app',
  ];

  // Check if the origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else {
    response.headers.set('Access-Control-Allow-Origin', 'https://rembg.io');
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  return response;
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    '/api/:path*',
    '/api/auth/:path*',
  ],
};
