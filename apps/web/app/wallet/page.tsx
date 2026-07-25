import { WalletPanel } from '../../components/wallet-panel';

export const metadata = {
  description: 'View your Neo Game Labs points and transaction history.',
  title: 'Wallet | Neo Game Labs',
};

export default function WalletPage() {
  return (
    <main>
      <section className="page-heading">
        <p className="eyebrow">Your points</p>
        <h1>Wallet</h1>
        <p>View your balance, top-up options, and immutable points history.</p>
      </section>
      <WalletPanel />
    </main>
  );
}
