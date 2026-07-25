import type { GameSummary } from '@neogamelabs/contracts';
import Link from 'next/link';

const platformLabels = {
  android: 'Android',
  ios: 'iOS',
  linux: 'Linux',
  macos: 'macOS',
  web: 'Web',
  windows: 'Windows',
} as const;

export function GameCard({ game }: Readonly<{ game: GameSummary }>) {
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
      </Link>
      <div className="game-card-body">
        <div>
          <h3>
            <Link href={`/games/${game.slug}`}>{game.title}</Link>
          </h3>
          <p>{game.tagline}</p>
        </div>
        <div className="game-card-footer">
          <ul aria-label="Available platforms" className="platform-list">
            {game.platforms.map((platform) => (
              <li key={platform.kind}>{platformLabels[platform.kind]}</li>
            ))}
          </ul>
          <strong>
            {game.pointPrice === 0 ? 'Free' : `${game.pointPrice} pts`}
          </strong>
        </div>
      </div>
    </article>
  );
}
