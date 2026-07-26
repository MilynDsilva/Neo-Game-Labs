import { render } from '@testing-library/react';
import axe from 'axe-core';
import { describe, expect, it, vi } from 'vitest';

import GamesPage from './games/page';
import Home from './page';

vi.mock('../lib/catalog-api', () => ({
  getCatalog: vi.fn().mockResolvedValue({ games: [], total: 0 }),
}));

async function expectNoAccessibilityViolations(
  container: Element,
): Promise<void> {
  const results = await axe.run(container, {
    rules: {
      // jsdom has no layout or canvas implementation; contrast remains a
      // real-browser/manual validation concern.
      'color-contrast': { enabled: false },
    },
  });
  expect(
    results.violations,
    results.violations
      .map((violation) => `${violation.id}: ${violation.help}`)
      .join('\n'),
  ).toEqual([]);
}

describe('public page accessibility', () => {
  it('has no automated accessibility violations on the home template', async () => {
    const { container } = render(await Home());
    await expectNoAccessibilityViolations(container);
  });

  it('has no automated accessibility violations on the catalog template', async () => {
    const { container } = render(
      await GamesPage({ searchParams: Promise.resolve({}) }),
    );
    await expectNoAccessibilityViolations(container);
  });
});
