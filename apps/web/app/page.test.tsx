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
      screen.getByRole('heading', { name: 'Games worth getting lost in.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Explore the catalog' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Ready when you are.' }),
    ).toBeInTheDocument();
  });
});
