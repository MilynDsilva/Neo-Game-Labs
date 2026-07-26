'use client';

import {
  libraryResponseSchema,
  type LibraryResponse,
} from '@neogamelabs/contracts';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DownloadActions } from './download-actions';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function LibraryPanel() {
  const [library, setLibrary] = useState<LibraryResponse>();
  const [requiresSignIn, setRequiresSignIn] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    void fetch(`${apiUrl}/v1/purchases/library`, { credentials: 'include' })
      .then(async (response) => {
        if (response.status === 401) {
          setRequiresSignIn(true);
          return;
        }
        if (!response.ok) throw new Error('Library request failed');
        setLibrary(libraryResponseSchema.parse(await response.json()));
      })
      .catch(() => setFailed(true));
  }, []);

  if (requiresSignIn) {
    return (
      <p className="empty-state">
        <Link className="text-link" href="/account">
          Sign in
        </Link>{' '}
        to view your game library.
      </p>
    );
  }
  if (failed)
    return <p className="empty-state">Your library is unavailable.</p>;
  if (!library) return <p className="empty-state">Loading your library…</p>;
  if (library.games.length === 0) {
    return (
      <p className="empty-state">
        Your library is empty.{' '}
        <Link className="text-link" href="/games">
          Browse games
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="library-grid">
      {library.games.map((game) => (
        <article key={game.entitlementId}>
          <img alt="" src={game.coverImageUrl} />
          <div>
            <h2>{game.title}</h2>
            <p>
              {game.pointsPaid === 0
                ? 'Added free'
                : `${game.pointsPaid} points paid`}
            </p>
            <Link className="text-link" href={`/games/${game.slug}`}>
              View game →
            </Link>
            <DownloadActions gameSlug={game.slug} />
          </div>
        </article>
      ))}
    </div>
  );
}
