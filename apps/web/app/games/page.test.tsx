import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import GamesPage from './page';

vi.mock('../../lib/catalog-api', () => ({
  getCatalog: vi.fn().mockResolvedValue({ games: [], total: 0 }),
}));

describe('GamesPage', () => {
  it('shows active filters with a clear action', async () => {
    render(
      await GamesPage({
        searchParams: Promise.resolve({
          featured: 'true',
          platform: 'windows',
          search: 'orbit',
        }),
      }),
    );

    expect(screen.getByText('Search: “orbit”')).toBeInTheDocument();
    expect(screen.getByText('Platform: Windows')).toBeInTheDocument();
    expect(screen.getByText('Featured')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Reset' })).toHaveAttribute(
      'href',
      '/games',
    );
  });

  it('does not show filter controls when browsing the full catalog', async () => {
    render(
      await GamesPage({
        searchParams: Promise.resolve({}),
      }),
    );

    expect(screen.queryByLabelText('Active filters')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Reset' }),
    ).not.toBeInTheDocument();
  });
});
