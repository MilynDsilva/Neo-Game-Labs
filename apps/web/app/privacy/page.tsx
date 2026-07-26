import { ContentPage } from '../../components/content-page';

export const metadata = {
  description: 'Neo Game Labs privacy notice.',
  title: 'Privacy | Neo Game Labs',
};

export default function PrivacyPage() {
  return (
    <ContentPage
      eyebrow="Legal"
      introduction="This preview notice explains the information the website currently handles. It will be updated before accounts and payments launch."
      title="Privacy notice"
    >
      <section>
        <h2>Information we receive</h2>
        <p>
          The public preview does not provide customer accounts or accept
          payments. Our hosting services may process standard technical data,
          such as IP address, browser type, requested pages, and timestamps, to
          operate and protect the service.
        </p>
      </section>
      <section>
        <h2>How information is used</h2>
        <p>
          Technical data is used to deliver the website, diagnose failures,
          prevent abuse, and understand performance. Information sent directly
          to support is used to answer the request.
        </p>
      </section>
      <section>
        <h2>Future account and payment features</h2>
        <p>
          Before Google sign-in, customer profiles, points, or Razorpay payments
          become available, this notice will describe the relevant providers,
          information, purposes, retention periods, and customer choices.
        </p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>
          Privacy questions can be sent to{' '}
          <a href="mailto:privacy@neogamelabs.com">privacy@neogamelabs.com</a>.
        </p>
      </section>
    </ContentPage>
  );
}
