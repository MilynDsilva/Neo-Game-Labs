import Link from 'next/link';

export default function GameNotFound() {
  return (
    <main className="status-page">
      <p className="eyebrow">Game unavailable</p>
      <h1>This game isn’t in the public catalog.</h1>
      <p>It may have moved, be unreleased, or no longer be available.</p>
      <Link className="button-link" href="/games">
        Browse available games
      </Link>
    </main>
  );
}
