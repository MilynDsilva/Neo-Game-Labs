const apiUrl = process.env.API_URL ?? 'http://localhost:4000';

export interface AdminOverview {
  metrics: {
    customers: number;
    games: number;
    openFeedback: number;
    pointsInWallets: number;
    publishedGames: number;
    purchases: number;
  };
  recentFeedback: AdminFeedback[];
}

export interface AdminGame {
  featured: boolean;
  id: string;
  platforms: string[];
  pointPrice: number;
  slug: string;
  status: string;
  title: string;
}

export interface AdminFeedback {
  category: string;
  createdAt: string;
  id: string;
  internalNotes: string;
  message: string;
  rating: number;
  reference: string;
  status: string;
}

export interface AdminCustomer {
  deletionPending: boolean;
  displayName: string;
  email: string;
  id: string;
  pointsBalance: number;
}

export interface AdminAuditEvent {
  action: string;
  actor: string;
  createdAt: string;
  id: string;
  targetId: string;
  targetType: string;
}

export async function adminRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const key = process.env.ADMIN_API_KEY;
  if (!key) throw new Error('ADMIN_API_KEY is not configured');

  const response = await fetch(`${apiUrl}/v1/admin${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      'content-type': 'application/json',
      'x-admin-actor': process.env.ADMIN_ACTOR ?? 'admin-dashboard',
      'x-admin-key': key,
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? `Admin API failed (${response.status})`);
  }
  return (await response.json()) as T;
}
