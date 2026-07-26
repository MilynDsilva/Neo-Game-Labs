import {
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { describe, expect, it } from 'vitest';

import { AdminGuard } from '../src/admin/admin.guard.js';

function contextWithKey(key?: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        header: (name: string) => (name === 'x-admin-key' ? key : undefined),
      }),
    }),
  } as unknown as ExecutionContext;
}

function guardWithKey(key?: string) {
  const config = {
    get: (name: string) => (name === 'ADMIN_API_KEY' ? key : undefined),
  } as ConfigService;
  return new AdminGuard(config);
}

describe('AdminGuard', () => {
  it('allows the configured server credential', () => {
    expect(
      guardWithKey('a-long-admin-key').canActivate(
        contextWithKey('a-long-admin-key'),
      ),
    ).toBe(true);
  });

  it('rejects an invalid credential', () => {
    expect(() =>
      guardWithKey('a-long-admin-key').canActivate(
        contextWithKey('the-wrong-key'),
      ),
    ).toThrow(UnauthorizedException);
  });

  it('keeps admin endpoints unavailable until configured', () => {
    expect(() => guardWithKey().canActivate(contextWithKey())).toThrow(
      ServiceUnavailableException,
    );
  });
});
