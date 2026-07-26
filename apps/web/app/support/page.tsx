import Link from 'next/link';

import { ContentPage } from '../../components/content-page';

export const metadata = {
  description: 'Get help with Neo Game Labs games and your account.',
  title: 'Support | Neo Game Labs',
};

export default function SupportPage() {
  return (
    <ContentPage
      eyebrow="Player support"
      introduction="Find quick answers below. If the issue continues, send us the game, platform, and a short description of what happened."
      title="Let’s get you back in the game."
    >
      <section>
        <h2>Downloads and installation</h2>
        <p>
          Confirm that your device meets the requirements on the game page and
          that enough storage is available. Mobile releases are installed
          through their linked app store.
        </p>
      </section>
      <section>
        <h2>Purchases and points</h2>
        <p>
          Points and paid purchases are not available during this preview.
          Account, payment, refund, and purchase-history help will appear here
          when those features launch.
        </p>
      </section>
      <section>
        <h2>Report a problem</h2>
        <p>
          Include the game title, device, operating-system version, and steps
          that reproduce the issue. Never include passwords or payment details.
        </p>
        <Link className="text-link" href="/contact">
          Contact support →
        </Link>
      </section>
    </ContentPage>
  );
}
