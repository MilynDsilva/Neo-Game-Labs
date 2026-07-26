import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const username = process.env.ADMIN_DASHBOARD_USERNAME;
  const password = process.env.ADMIN_DASHBOARD_PASSWORD;
  if (!username || !password) {
    return new NextResponse('Admin dashboard credentials are not configured.', {
      status: 503,
    });
  }

  const expected = `Basic ${Buffer.from(`${username}:${password}`).toString(
    'base64',
  )}`;
  if (request.headers.get('authorization') !== expected) {
    return new NextResponse('Authentication required.', {
      headers: { 'WWW-Authenticate': 'Basic realm="Neo Game Labs Admin"' },
      status: 401,
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
