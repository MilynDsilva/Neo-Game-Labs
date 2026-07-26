'use client';

import Link from 'next/link';

import { useAuth } from './auth-provider';
import { DownloadActions } from './download-actions';
import { useOwnership } from './ownership-provider';

const platformLabels = {
  android: 'Android',
  ios: 'iOS',
  linux: 'Linux',
  macos: 'macOS',
  web: 'Web',
  windows: 'Windows',
} as const;

export function LibraryPanel() {
  const { authenticated, loading: authLoading } = useAuth();
  const { error, games, loading, refreshOwnership } = useOwnership();

  if (authLoading) {
    return (
      <p className="empty-state" role="status">
        Checking your account…
      </p>
    );
  }
  if (!authenticated) {
    return (
      <p className="empty-state">
        <Link className="text-link" href="/account">
          Sign in
        </Link>{' '}
        to view your game library.
      </p>
    );
  }
  if (loading)
    return (
      <p className="empty-state" role="status">
        Loading your library…
      </p>
    );
  if (error) {
    return (
      <div className="empty-state" role="alert">
        <p>{error}</p>
        <button onClick={() => void refreshOwnership()} type="button">
          Try again
        </button>
      </div>
    );
  }
  if (games.length === 0) {
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
      {games.map((game) => (
        <article key={game.entitlementId}>
          <img alt="" src={game.coverImageUrl} />
          <div>
            <h2>{game.title}</h2>
            <dl className="library-metadata">
              <div>
                <dt>Added</dt>
                <dd>
                  {new Intl.DateTimeFormat('en', {
                    dateStyle: 'medium',
                  }).format(new Date(game.acquiredAt))}
                </dd>
              </div>
              <div>
                <dt>Price</dt>
                <dd>
                  {game.pointsPaid === 0 ? 'Free' : `${game.pointsPaid} points`}
                </dd>
              </div>
              <div>
                <dt>Platforms</dt>
                <dd>
                  {game.platforms
                    .map((platform) => platformLabels[platform.kind])
                    .join(', ')}
                </dd>
              </div>
            </dl>
            <div className="library-links">
              <Link className="text-link" href={`/games/${game.slug}`}>
                View game →
              </Link>
              <Link className="text-link" href={`/feedback?game=${game.slug}`}>
                Send feedback
              </Link>
            </div>
            <DownloadActions gameSlug={game.slug} />
          </div>
        </article>
      ))}
    </div>
  );
}
