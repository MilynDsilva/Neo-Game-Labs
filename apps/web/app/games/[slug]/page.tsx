import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getGame } from '../../../lib/catalog-api';
import { PurchaseButton } from '../../../components/purchase-button';
import { GameComments } from '../../../components/game-comments';

const platformLabels = {
  android: 'Android',
  ios: 'iOS',
  linux: 'Linux',
  macos: 'macOS',
  web: 'Web',
  windows: 'Windows',
} as const;

type GamePageProperties = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: GamePageProperties): Promise<Metadata> {
  const { slug } = await params;

  try {
    const game = await getGame(slug);

    if (!game) {
      return { title: 'Game not found | Neo Game Labs' };
    }

    return {
      description: game.tagline,
      openGraph: {
        description: game.tagline,
        images: [game.heroImageUrl],
        title: game.title,
      },
      title: `${game.title} | Neo Game Labs`,
    };
  } catch {
    return { title: 'Game | Neo Game Labs' };
  }
}

export default async function GamePage({ params }: GamePageProperties) {
  const { slug } = await params;
  const game = await getGame(slug);

  if (!game) {
    notFound();
  }

  return (
    <main>
      <section className="game-hero">
        <img alt="" src={game.heroImageUrl} />
        <div className="game-hero-overlay" />
        <div className="game-hero-content">
          <Link className="back-link" href="/games">
            ← All games
          </Link>
          <p className="eyebrow">Neo Game Labs presents</p>
          <h1>{game.title}</h1>
          <p>{game.tagline}</p>
          <div className="purchase-row">
            <strong>
              {game.pointPrice === 0 ? 'Free' : `${game.pointPrice} points`}
            </strong>
            <PurchaseButton gameSlug={game.slug} pointPrice={game.pointPrice} />
          </div>
        </div>
      </section>
      <section className="game-details">
        <article>
          <p className="eyebrow">About the game</p>
          <h2>Enter the world</h2>
          <p className="long-copy">{game.description}</p>
          <Link className="text-link" href={`/feedback?game=${game.slug}`}>
            Send feedback about {game.title} →
          </Link>
        </article>
        <aside>
          <p className="eyebrow">Available on</p>
          <ul className="platform-details">
            {game.platforms.map((platform) => (
              <li key={platform.kind}>
                <div>
                  <strong>{platformLabels[platform.kind]}</strong>
                  <span>
                    {platform.availability === 'coming-soon'
                      ? 'Coming soon'
                      : platform.availability === 'external'
                        ? 'External store'
                        : 'Direct download'}
                  </span>
                </div>
                {platform.storeUrl ? (
                  <a
                    aria-label={`Open ${platformLabels[platform.kind]} store in a new tab`}
                    href={platform.storeUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open store ↗
                  </a>
                ) : null}
                {platform.minimumRequirements ? (
                  <small>{platform.minimumRequirements}</small>
                ) : null}
              </li>
            ))}
          </ul>
        </aside>
      </section>
      <GameComments gameSlug={game.slug} />
    </main>
  );
}
