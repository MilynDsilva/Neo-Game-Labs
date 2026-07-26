import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FeedbackForm } from './feedback-form';

let authenticated = true;
const refresh = vi.fn();

vi.mock('./auth-provider', () => ({
  useAuth: () => ({
    authenticated,
    loading: false,
    refresh,
  }),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    status,
  });
}

const catalog = {
  games: [
    {
      coverImageUrl: '/games/orbit-breaker.svg',
      featured: true,
      platforms: [{ availability: 'direct', kind: 'windows' }],
      pointPrice: 250,
      slug: 'orbit-breaker',
      tagline: 'Break through the stars.',
      title: 'Orbit Breaker',
    },
  ],
  total: 1,
};

beforeEach(() => {
  authenticated = true;
  refresh.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('FeedbackForm', () => {
  it('shows authentication requirements before displaying the form', () => {
    authenticated = false;
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(<FeedbackForm />);

    expect(screen.getByText(/to send private feedback/)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('preselects a game and provides live message-length guidance', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(catalog)));

    render(<FeedbackForm initialGameSlug="orbit-breaker" />);

    expect(
      await screen.findByRole('option', { name: 'Orbit Breaker' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Game (optional)')).toHaveValue(
      'orbit-breaker',
    );

    fireEvent.change(screen.getByLabelText('Your feedback'), {
      target: { value: 'A clear description of my issue.' },
    });

    expect(screen.getByText('1968 characters remaining')).toBeInTheDocument();
  });

  it('preserves customer input when submission fails', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(catalog))
      .mockResolvedValueOnce(jsonResponse({ message: 'failed' }, 500));
    vi.stubGlobal('fetch', fetchMock);

    render(<FeedbackForm />);
    await screen.findByRole('option', { name: 'Orbit Breaker' });

    const message = 'The download stopped after reaching ninety percent.';
    fireEvent.change(screen.getByLabelText('Your feedback'), {
      target: { value: message },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send feedback' }));

    expect(
      await screen.findByText(
        'We could not submit your feedback. Please try again.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Your feedback')).toHaveValue(message);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });
});
