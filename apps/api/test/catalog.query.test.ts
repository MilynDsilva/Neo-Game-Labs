import { describe, expect, it } from 'vitest';

import { catalogQuerySchema } from '../src/catalog/catalog.query.js';
import { escapeRegularExpression } from '../src/catalog/catalog.service.js';

describe('catalogQuerySchema', () => {
  it('normalizes supported catalog filters', () => {
    const result = catalogQuerySchema.parse({
      featured: 'true',
      limit: '8',
      platform: 'windows',
      search: 'orbit',
    });

    expect(result).toEqual({
      featured: true,
      limit: 8,
      platform: 'windows',
      search: 'orbit',
    });
  });

  it('rejects unsupported platforms', () => {
    expect(() => catalogQuerySchema.parse({ platform: 'console' })).toThrow();
  });
});

describe('escapeRegularExpression', () => {
  it('prevents search input from becoming a regular expression', () => {
    expect(escapeRegularExpression('game.*')).toBe('game\\.\\*');
  });
});
