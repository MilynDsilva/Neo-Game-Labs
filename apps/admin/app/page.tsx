import {
  adminRequest,
  type AdminAuditEvent,
  type AdminCustomer,
  type AdminFeedback,
  type AdminGame,
  type AdminOverview,
} from '../lib/admin-api';
import Link from 'next/link';
import { creditCustomer, updateFeedback, updateGame } from './actions';

export const dynamic = 'force-dynamic';

const statuses = ['draft', 'scheduled', 'published', 'archived'];
const feedbackStatuses = [
  'new',
  'triaged',
  'in-progress',
  'resolved',
  'closed',
];

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{
    customerPage?: string;
    customerSearch?: string;
  }>;
}) {
  const parameters = await searchParams;
  const customerPage = Math.max(1, Number(parameters.customerPage) || 1);
  const customerSearch = parameters.customerSearch?.trim() ?? '';
  let data:
    | {
        audit: AdminAuditEvent[];
        customers: AdminCustomer[];
        customerPagination: {
          limit: number;
          page: number;
          pages: number;
          total: number;
        };
        feedback: AdminFeedback[];
        games: AdminGame[];
        overview: AdminOverview;
      }
    | undefined;
  let error: string | undefined;

  try {
    const [overview, games, feedback, customers, audit] = await Promise.all([
      adminRequest<AdminOverview>('/overview'),
      adminRequest<{ games: AdminGame[] }>('/games'),
      adminRequest<{ feedback: AdminFeedback[] }>('/feedback'),
      adminRequest<{
        customers: AdminCustomer[];
        pagination: {
          limit: number;
          page: number;
          pages: number;
          total: number;
        };
      }>(
        `/customers?${new URLSearchParams({
          limit: '20',
          page: String(customerPage),
          search: customerSearch,
        })}`,
      ),
      adminRequest<{ events: AdminAuditEvent[] }>('/audit'),
    ]);
    data = {
      audit: audit.events,
      customers: customers.customers,
      customerPagination: customers.pagination,
      feedback: feedback.feedback,
      games: games.games,
      overview,
    };
  } catch (caught) {
    error = caught instanceof Error ? caught.message : 'Admin API unavailable';
  }

  return (
    <div className="dashboard">
      <header className="topbar">
        <div>
          <p className="eyebrow">Control room</p>
          <h1>Good to see you.</h1>
          <p>Manage releases, players, and incoming signals.</p>
        </div>
        <span className="environment">Local environment</span>
      </header>

      {error || !data ? (
        <section className="setup-card">
          <p className="eyebrow">Configuration needed</p>
          <h2>Connect the admin API</h2>
          <p>{error}</p>
          <code>ADMIN_API_KEY=your-long-random-secret</code>
        </section>
      ) : (
        <>
          <section id="overview">
            <SectionHeading
              eyebrow="Live pulse"
              title="Platform overview"
              description="A quick read of catalog and customer activity."
            />
            <div className="metrics">
              <Metric label="Players" value={data.overview.metrics.customers} />
              <Metric
                label="Published"
                value={data.overview.metrics.publishedGames}
              />
              <Metric
                label="Open feedback"
                value={data.overview.metrics.openFeedback}
                warning={data.overview.metrics.openFeedback > 0}
              />
              <Metric
                label="Purchases"
                value={data.overview.metrics.purchases}
              />
              <Metric
                label="Points held"
                value={data.overview.metrics.pointsInWallets}
              />
            </div>
          </section>

          <section id="catalog">
            <SectionHeading
              eyebrow="Release desk"
              title="Game catalog"
              description="Control visibility, featured placement, and point pricing."
            />
            <div className="card-list">
              {data.games.map((game) => (
                <form action={updateGame} className="game-row" key={game.id}>
                  <input name="id" type="hidden" value={game.id} />
                  <div>
                    <strong>{game.title}</strong>
                    <span>{game.platforms.join(' · ')}</span>
                  </div>
                  <label>
                    Status
                    <span className="select-control">
                      <select defaultValue={game.status} name="status">
                        {statuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </span>
                  </label>
                  <label>
                    Points
                    <input
                      defaultValue={game.pointPrice}
                      min="0"
                      name="pointPrice"
                      type="number"
                    />
                  </label>
                  <label className="check">
                    <input
                      defaultChecked={game.featured}
                      name="featured"
                      type="checkbox"
                    />
                    Featured
                  </label>
                  <button type="submit">Save</button>
                </form>
              ))}
            </div>
          </section>

          <section id="feedback">
            <SectionHeading
              eyebrow="Player signals"
              title="Feedback triage"
              description="Review private feedback and keep internal follow-up notes."
            />
            <div className="feedback-grid">
              {data.feedback.map((feedback) => (
                <form
                  action={updateFeedback}
                  className="feedback-card"
                  key={feedback.id}
                >
                  <input name="id" type="hidden" value={feedback.id} />
                  <div className="card-meta">
                    <span>{feedback.reference}</span>
                    <span>{feedback.rating}/5</span>
                  </div>
                  <strong>{feedback.category}</strong>
                  <p>{feedback.message}</p>
                  <label>
                    Status
                    <span className="select-control">
                      <select defaultValue={feedback.status} name="status">
                        {feedbackStatuses.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </span>
                  </label>
                  <label>
                    Internal notes
                    <textarea
                      defaultValue={feedback.internalNotes}
                      name="internalNotes"
                      placeholder="Visible only to administrators"
                      rows={3}
                    />
                  </label>
                  <button type="submit">Update feedback</button>
                </form>
              ))}
            </div>
          </section>

          <section id="customers">
            <SectionHeading
              eyebrow="Community"
              title="Customers"
              description="Read-only customer and wallet visibility."
            />
            <form action="/#customers" className="customer-search">
              <label>
                Search customers
                <input
                  defaultValue={customerSearch}
                  name="customerSearch"
                  placeholder="Name or email"
                  type="search"
                />
              </label>
              <button type="submit">Search</button>
              {customerSearch ? (
                <Link href="/#customers">Clear search</Link>
              ) : null}
            </form>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Email</th>
                    <th>Points</th>
                    <th>Account</th>
                    <th>Credit points</th>
                  </tr>
                </thead>
                <tbody>
                  {data.customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.displayName}</td>
                      <td>{customer.email}</td>
                      <td>{customer.pointsBalance}</td>
                      <td>
                        <span
                          className={
                            customer.deletionPending ? 'pill danger' : 'pill'
                          }
                        >
                          {customer.deletionPending
                            ? 'Deletion pending'
                            : 'Active'}
                        </span>
                      </td>
                      <td>
                        <form action={creditCustomer} className="credit-form">
                          <input name="id" type="hidden" value={customer.id} />
                          <input
                            aria-label={`Points to credit ${customer.displayName}`}
                            max="100000"
                            min="1"
                            name="points"
                            placeholder="Points"
                            required
                            type="number"
                          />
                          <input
                            aria-label={`Reason for crediting ${customer.displayName}`}
                            maxLength={200}
                            minLength={3}
                            name="reason"
                            placeholder="Reason"
                            required
                            type="text"
                          />
                          <button type="submit">Credit</button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <nav aria-label="Customer pages" className="pagination">
              <p>
                Page {data.customerPagination.page} of{' '}
                {data.customerPagination.pages} ·{' '}
                {data.customerPagination.total} customers
              </p>
              <div>
                {data.customerPagination.page > 1 ? (
                  <Link
                    href={`${customerPageUrl(
                      data.customerPagination.page - 1,
                      customerSearch,
                    )}#customers`}
                  >
                    ← Previous
                  </Link>
                ) : (
                  <span>← Previous</span>
                )}
                {data.customerPagination.page <
                data.customerPagination.pages ? (
                  <Link
                    href={`${customerPageUrl(
                      data.customerPagination.page + 1,
                      customerSearch,
                    )}#customers`}
                  >
                    Next →
                  </Link>
                ) : (
                  <span>Next →</span>
                )}
              </div>
            </nav>
          </section>

          <section id="audit">
            <SectionHeading
              eyebrow="Accountability"
              title="Admin audit log"
              description="Recent catalog and moderation changes."
            />
            <div className="audit-list">
              {data.audit.length ? (
                data.audit.map((event) => (
                  <div key={event.id}>
                    <span className="pulse" />
                    <p>
                      <strong>{event.action}</strong>
                      <span>
                        {event.actor} · {event.targetType} ·{' '}
                        {new Date(event.createdAt).toLocaleString()}
                      </span>
                    </p>
                  </div>
                ))
              ) : (
                <p className="empty">No admin changes recorded yet.</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function customerPageUrl(page: number, search: string) {
  const parameters = new URLSearchParams({ customerPage: String(page) });
  if (search) parameters.set('customerSearch', search);
  return `/?${parameters}`;
}

function Metric({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: number;
  warning?: boolean;
}) {
  return (
    <article className={warning ? 'metric warning' : 'metric'}>
      <span>{label}</span>
      <strong>{value.toLocaleString()}</strong>
    </article>
  );
}

function SectionHeading({
  description,
  eyebrow,
  title,
}: {
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <header className="section-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <p>{description}</p>
    </header>
  );
}
