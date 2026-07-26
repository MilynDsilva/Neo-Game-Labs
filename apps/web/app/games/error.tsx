'use client';

export default function GamesError({
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  return (
    <main className="status-page">
      <p className="eyebrow">Connection interrupted</p>
      <h1>We couldn’t load this game.</h1>
      <p>The catalog service may be temporarily unavailable.</p>
      <button onClick={reset} type="button">
        Try again
      </button>
    </main>
  );
}
