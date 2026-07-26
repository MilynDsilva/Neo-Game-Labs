import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DownloadActions } from './download-actions';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    status,
  });
}

afterEach(() => vi.unstubAllGlobals());

describe('DownloadActions', () => {
  it('shows platform, version, size, and private-link behavior', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          downloads: [
            {
              fileName: 'orbit-breaker-demo.txt',
              platform: 'windows',
              sizeBytes: 2_097_152,
              version: '1.2.0',
            },
          ],
        }),
      ),
    );

    render(<DownloadActions gameSlug="orbit-breaker" />);

    expect(await screen.findByText('Windows')).toBeInTheDocument();
    expect(screen.getByText('Version 1.2.0 · 2.0 MB')).toBeInTheDocument();
    expect(screen.getByText(/expire after five minutes/)).toBeInTheDocument();
  });

  it('distinguishes a paused download service', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ message: 'paused' }, 503)),
    );

    render(<DownloadActions gameSlug="orbit-breaker" />);

    expect(
      await screen.findByText('Downloads are temporarily paused.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Try again' }),
    ).toBeInTheDocument();
  });
});
