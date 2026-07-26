import type { Connection } from 'mongoose';
import { describe, expect, it } from 'vitest';

import { ReadinessController } from '../src/health/readiness.controller.js';

describe('ReadinessController', () => {
  it('reports ready only while MongoDB is connected', () => {
    const ready = new ReadinessController({ readyState: 1 } as Connection);
    const unavailable = new ReadinessController({
      readyState: 0,
    } as Connection);

    expect(ready.getReadiness().status).toBe('ready');
    expect(() => unavailable.getReadiness()).toThrow('Database is not ready');
  });
});
