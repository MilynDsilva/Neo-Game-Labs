import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GameComments } from './game-comments';

let authenticated = true;

vi.mock('./auth-provider', () => ({
  useAuth: () => ({ authenticated, loading: false }),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    status,
  });
}

const existingComment = {
  author: { displayName: 'Nova Player' },
  createdAt: '2026-07-26T10:00:00.000Z',
  id: 'comment-one',
  message: 'The movement feels excellent.',
};

beforeEach(() => {
  authenticated = true;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('GameComments', () => {
  it('shows public comments and a sign-in action to guests', async () => {
    authenticated = false;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ comments: [existingComment] })),
    );

    render(<GameComments gameSlug="orbit-breaker" />);

    expect(
      await screen.findByText('The movement feels excellent.'),
    ).toBeInTheDocument();
    expect(screen.getByText(/to join the discussion/)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Post comment' }),
    ).not.toBeInTheDocument();
  });

  it('posts a validated comment and prepends it to the discussion', async () => {
    const postedComment = {
      author: { displayName: 'Signed In Player' },
      createdAt: '2026-07-26T11:00:00.000Z',
      id: 'comment-two',
      message: 'I loved the final level.',
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ comments: [existingComment] }))
      .mockResolvedValueOnce(jsonResponse(postedComment));
    vi.stubGlobal('fetch', fetchMock);

    render(<GameComments gameSlug="orbit-breaker" />);
    await screen.findByText('The movement feels excellent.');

    fireEvent.change(screen.getByLabelText('Join the discussion'), {
      target: { value: postedComment.message },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Post comment' }));

    expect(
      await screen.findByText('Your comment was posted.'),
    ).toBeInTheDocument();
    expect(screen.getByText(postedComment.message)).toBeInTheDocument();
    expect(screen.getByLabelText('Join the discussion')).toHaveValue('');
    expect(fetchMock).toHaveBeenLastCalledWith(
      'http://localhost:4000/v1/games/orbit-breaker/comments',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
