import { ApiStatus } from './api-status';

export default function Home() {
  return (
    <main>
      <section className="hero">
        <h1>Neo Game Labs</h1>
        <p>
          The customer platform foundation is live. Games, points, and player
          accounts are coming next.
        </p>
        <ApiStatus />
      </section>
    </main>
  );
}
