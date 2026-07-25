import { healthResponseSchema } from '@neogamelabs/contracts';

export async function ApiStatus() {
  const apiUrl = process.env.API_URL ?? 'http://localhost:4000';

  try {
    const response = await fetch(`${apiUrl}/v1/health`, { cache: 'no-store' });
    const health = healthResponseSchema.parse(await response.json());

    return <span className="status">API {health.status}</span>;
  } catch {
    return <span className="status">Foundation ready</span>;
  }
}
