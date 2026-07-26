import type { NextFunction, Request, Response } from 'express';

export function securityHeadersMiddleware(
  _request: Request,
  response: Response,
  next: NextFunction,
): void {
  response.setHeader('Content-Security-Policy', "default-src 'none'");
  response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader(
    'Permissions-Policy',
    'camera=(), geolocation=(), microphone=()',
  );
  next();
}
