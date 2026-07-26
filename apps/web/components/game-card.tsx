'use client';

import type { GameSummary } from '@neogamelabs/contracts';
import Link from 'next/link';

import { useAuth } from './auth-provider';
import { useOwnership } from './ownership-provider';

const platformLabels = {
  android: 'Android',
  ios: 'iOS',
  linux: 'Linux',
  macos: 'macOS',
  web: 'Web',
  windows: 'Windows',
} as const;

export function GameCard({ game }: Readonly<{ game: GameSummary }>) {
  const { authenticated } = useAuth();
  const { isOwned, loading } = useOwnership();
  const owned = authenticated && !loading && isOwned(game.slug);

  return (
    <article className="game-card">
      <Link
        aria-label={`View ${game.title}`}
        className="game-art"
        href={`/games/${game.slug}`}
      >
        <img alt="" src={game.coverImageUrl} />
        {game.featured ? (
          <span className="featured-label">Featured</span>
        ) : null}
        {owned ? <span className="owned-label">In your library</span> : null}
      </Link>
      <div className="game-card-body">
        <div>
          <p className="game-type">Base game</p>
          <h3>
            <Link href={`/games/${game.slug}`}>{game.title}</Link>
          </h3>
          <p>{game.tagline}</p>
        </div>
        <div className="game-card-footer">
          <ul aria-label="Available platforms" className="platform-list">
            {game.platforms.map((platform) => (
              <li key={platform.kind}>
                <span aria-hidden="true" />
                {platformLabels[platform.kind]}
              </li>
            ))}
          </ul>
          <strong>
            {owned
              ? 'Owned'
              : game.pointPrice === 0
                ? 'Free'
                : `${game.pointPrice} pts`}
          </strong>
        </div>
      </div>
    </article>
  );
}
