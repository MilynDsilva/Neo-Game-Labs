import type { GameSummary } from '@neogamelabs/contracts';

import { GameCard } from './game-card';

export function CatalogGrid({
  emptyMessage,
  games,
}: Readonly<{ emptyMessage: string; games: GameSummary[] }>) {
  if (games.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return (
    <div className="game-grid">
      {games.map((game) => (
        <GameCard game={game} key={game.slug} />
      ))}
    </div>
  );
}
