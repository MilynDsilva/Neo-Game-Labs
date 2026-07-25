import { ContentPage } from '../../components/content-page';

export const metadata = {
  description: 'Terms for using the Neo Game Labs website.',
  title: 'Terms | Neo Game Labs',
};

export default function TermsPage() {
  return (
    <ContentPage
      eyebrow="Legal"
      introduction="These preview terms cover the public catalog. Purchase, points, account, and game-license terms will be added before those services launch."
      title="Website terms"
    >
      <section>
        <h2>Using this website</h2>
        <p>
          You may use the website to learn about Neo Game Labs and discover our
          games. Do not interfere with the service, attempt unauthorized access,
          or use automated requests in a way that disrupts other visitors.
        </p>
      </section>
      <section>
        <h2>Catalog information</h2>
        <p>
          Release dates, platform availability, links, and preview point prices
          may change before launch. A listing does not guarantee availability in
          every country or on every device.
        </p>
      </section>
      <section>
        <h2>Intellectual property</h2>
        <p>
          The website, game artwork, names, and related materials belong to Neo
          Game Labs or their respective owners. Access to the website does not
          transfer ownership of those materials.
        </p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>
          Questions about these terms can be sent to{' '}
          <a href="mailto:legal@neogamelabs.com">legal@neogamelabs.com</a>.
        </p>
      </section>
    </ContentPage>
  );
}
