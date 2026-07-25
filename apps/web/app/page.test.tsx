import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Home from './page';

vi.mock('./api-status', () => ({
  ApiStatus: () => <span>Foundation ready</span>,
}));

describe('Home', () => {
  it('introduces Neo Game Labs', () => {
    render(<Home />);

    expect(
      screen.getByRole('heading', { name: 'Neo Game Labs' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Foundation ready')).toBeInTheDocument();
  });
});
