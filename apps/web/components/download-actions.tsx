'use client';

import {
  downloadGrantResponseSchema,
  downloadListResponseSchema,
  type DownloadListResponse,
} from '@neogamelabs/contracts';
import { useEffect, useState } from 'react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function DownloadActions({ gameSlug }: { gameSlug: string }) {
  const [assets, setAssets] = useState<DownloadListResponse['downloads']>();
  const [activePlatform, setActivePlatform] = useState<string>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    void fetch(`${apiUrl}/v1/downloads/${gameSlug}`, {
      credentials: 'include',
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Download list request failed');
        setAssets(
          downloadListResponseSchema.parse(await response.json()).downloads,
        );
      })
      .catch(() => setFailed(true));
  }, [gameSlug]);

  async function download(platform: string) {
    setActivePlatform(platform);
    setFailed(false);
    try {
      const response = await fetch(
        `${apiUrl}/v1/downloads/${gameSlug}/${platform}/grant`,
        { credentials: 'include', method: 'POST' },
      );
      if (!response.ok) throw new Error('Download grant request failed');
      const grant = downloadGrantResponseSchema.parse(await response.json());
      window.location.assign(`${apiUrl}${grant.url}`);
    } catch {
      setFailed(true);
    } finally {
      setActivePlatform(undefined);
    }
  }

  if (failed) return <p className="download-note">Download unavailable.</p>;
  if (!assets) return <p className="download-note">Checking downloads…</p>;
  if (assets.length === 0) {
    return (
      <p className="download-note">No direct download is available yet.</p>
    );
  }

  return (
    <div className="download-actions">
      {assets.map((asset) => (
        <button
          disabled={activePlatform === asset.platform}
          key={asset.platform}
          onClick={() => void download(asset.platform)}
          type="button"
        >
          {activePlatform === asset.platform
            ? 'Preparing…'
            : `Download for ${asset.platform} · ${asset.version}`}
        </button>
      ))}
    </div>
  );
}
