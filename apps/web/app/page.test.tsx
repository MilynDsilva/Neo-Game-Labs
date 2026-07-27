import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Home from './page';

vi.mock('../lib/catalog-api', () => ({
  getCatalog: vi.fn().mockResolvedValue({ games: [], total: 0 }),
}));

describe('Home', () => {
  it('introduces the game catalog', async () => {
    render(await Home());

    expect(
      screen.getByRole('heading', { name: 'Discover games' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'See all →' })).toHaveLength(2);
    expect(
      screen.getByRole('heading', { name: 'Popular Games' }),
    ).toBeInTheDocument();
  });
});
