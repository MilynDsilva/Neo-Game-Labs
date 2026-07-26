import { LibraryPanel } from '../../components/library-panel';

export const metadata = {
  description: 'Access games owned by your Neo Game Labs account.',
  title: 'Library | Neo Game Labs',
};

export default function LibraryPage() {
  return (
    <main>
      <section className="page-heading">
        <p className="eyebrow">Your collection</p>
        <h1>Game library</h1>
        <p>Every game purchased with points appears here.</p>
      </section>
      <section className="library-layout">
        <LibraryPanel />
      </section>
    </main>
  );
}
