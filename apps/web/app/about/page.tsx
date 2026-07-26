import Link from 'next/link';

import { ContentPage } from '../../components/content-page';

export const metadata = {
  description: 'Meet Neo Game Labs and learn what guides our games.',
  title: 'About | Neo Game Labs',
};

export default function AboutPage() {
  return (
    <ContentPage
      eyebrow="Our studio"
      introduction="Neo Game Labs creates focused, memorable games that are easy to discover and available wherever our players are."
      title="Small worlds. Big reasons to return."
    >
      <section>
        <h2>What we make</h2>
        <p>
          We build original games for desktop, mobile, and the web. Every title
          starts with a clear play experience and grows through player feedback.
        </p>
      </section>
      <section>
        <h2>How we work</h2>
        <p>
          We value polished fundamentals, honest communication, and games that
          respect a player&apos;s time. Availability and pricing are shown
          clearly on every game page.
        </p>
      </section>
      <section className="content-callout">
        <h2>Find your next game</h2>
        <p>Explore current releases and see what is coming next.</p>
        <Link className="text-link" href="/games">
          Browse all games →
        </Link>
      </section>
    </ContentPage>
  );
}
