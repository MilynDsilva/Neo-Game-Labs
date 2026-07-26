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
      screen.getByRole('heading', { name: 'Find your next obsession.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Explore all games' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Keep your library' }),
    ).toBeInTheDocument();
  });
});
