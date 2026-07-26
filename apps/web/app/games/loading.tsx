export default function GamesLoading() {
  return (
    <main aria-busy="true" aria-live="polite">
      <section className="page-heading">
        <p className="eyebrow">The catalog</p>
        <h1>Loading games…</h1>
      </section>
      <section className="loading-grid">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="loading-card" key={index} />
        ))}
      </section>
    </main>
  );
}
