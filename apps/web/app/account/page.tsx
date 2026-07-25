import { AccountPanel } from '../../components/account-panel';

export const metadata = {
  description: 'Manage your Neo Game Labs customer account.',
  title: 'Account | Neo Game Labs',
};

export default function AccountPage() {
  return (
    <main>
      <section className="page-heading">
        <p className="eyebrow">Your account</p>
        <h1>Player profile</h1>
        <p>Manage your identity and view your points balance.</p>
      </section>
      <section className="account-layout">
        <AccountPanel />
      </section>
    </main>
  );
}
