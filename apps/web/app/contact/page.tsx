import { ContentPage } from '../../components/content-page';

export const metadata = {
  description: 'Contact Neo Game Labs.',
  title: 'Contact | Neo Game Labs',
};

export default function ContactPage() {
  return (
    <ContentPage
      eyebrow="Contact"
      introduction="Questions, feedback, or a technical issue? Send us a message and include enough detail for us to help."
      title="Talk to Neo Game Labs."
    >
      <section className="content-callout">
        <h2>Player support</h2>
        <p>
          For game and account assistance, include the game title and platform
          in the subject.
        </p>
        <a className="text-link" href="mailto:support@neogamelabs.com">
          support@neogamelabs.com
        </a>
      </section>
      <section>
        <h2>Business enquiries</h2>
        <p>For partnerships, publishing, and general studio enquiries:</p>
        <a className="text-link" href="mailto:hello@neogamelabs.com">
          hello@neogamelabs.com
        </a>
      </section>
    </ContentPage>
  );
}
