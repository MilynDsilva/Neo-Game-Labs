import { FeedbackForm } from '../../components/feedback-form';

export const metadata = {
  description: 'Send private game feedback to Neo Game Labs.',
  title: 'Feedback | Neo Game Labs',
};

export default function FeedbackPage() {
  return (
    <main>
      <section className="page-heading">
        <p className="eyebrow">Player feedback</p>
        <h1>Help shape what comes next.</h1>
        <p>
          Report a problem or tell us how a game feels. Your submission stays
          private and goes to our team for triage.
        </p>
      </section>
      <section className="feedback-layout">
        <FeedbackForm />
      </section>
    </main>
  );
}
