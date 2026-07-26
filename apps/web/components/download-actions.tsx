'use client';

import {
  downloadGrantResponseSchema,
  downloadListResponseSchema,
  type DownloadListResponse,
} from '@neogamelabs/contracts';
import { useCallback, useEffect, useState } from 'react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const platformLabels = {
  android: 'Android',
  linux: 'Linux',
  macos: 'macOS',
  windows: 'Windows',
} as const;

function formatSize(sizeBytes: number): string {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(1)} KB`;
  if (sizeBytes < 1024 * 1024 * 1024) {
    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(sizeBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function DownloadActions({ gameSlug }: { gameSlug: string }) {
  const [assets, setAssets] = useState<DownloadListResponse['downloads']>();
  const [activePlatform, setActivePlatform] = useState<string>();
  const [error, setError] = useState<string>();

  const loadDownloads = useCallback(async () => {
    setError(undefined);
    try {
      const response = await fetch(`${apiUrl}/v1/downloads/${gameSlug}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        setError(
          response.status === 503
            ? 'Downloads are temporarily paused.'
            : response.status === 401
              ? 'Your session expired. Sign in again to download.'
              : 'Downloads could not be checked.',
        );
        return;
      }
      setAssets(
        downloadListResponseSchema.parse(await response.json()).downloads,
      );
    } catch {
      setError('Downloads could not be checked. Check your connection.');
    }
  }, [gameSlug]);

  useEffect(() => {
    void loadDownloads();
  }, [loadDownloads]);

  async function download(platform: string) {
    setActivePlatform(platform);
    setError(undefined);
    try {
      const response = await fetch(
        `${apiUrl}/v1/downloads/${gameSlug}/${platform}/grant`,
        { credentials: 'include', method: 'POST' },
      );
      if (!response.ok) {
        setError(
          response.status === 503
            ? 'Downloads are temporarily paused.'
            : response.status === 404
              ? 'This build is no longer available.'
              : response.status === 401
                ? 'Your session expired. Sign in again to download.'
                : 'The download could not be prepared.',
        );
        return;
      }
      const grant = downloadGrantResponseSchema.parse(await response.json());
      window.location.assign(`${apiUrl}${grant.url}`);
    } catch {
      setError('The download could not be prepared. Check your connection.');
    } finally {
      setActivePlatform(undefined);
    }
  }

  if (error) {
    return (
      <div className="download-error" role="alert">
        <p>{error}</p>
        <button onClick={() => void loadDownloads()} type="button">
          Try again
        </button>
      </div>
    );
  }
  if (!assets)
    return (
      <p className="download-note" role="status">
        Checking downloads…
      </p>
    );
  if (assets.length === 0) {
    return (
      <p className="download-note">No direct download is available yet.</p>
    );
  }

  return (
    <div className="download-actions">
      <p className="download-note">
        Links are private, expire after five minutes, and work once.
      </p>
      {assets.map((asset) => (
        <div className="download-build" key={asset.platform}>
          <span>
            <strong>{platformLabels[asset.platform]}</strong>
            <small>
              Version {asset.version} · {formatSize(asset.sizeBytes)}
            </small>
          </span>
          <button
            disabled={activePlatform === asset.platform}
            onClick={() => void download(asset.platform)}
            type="button"
          >
            {activePlatform === asset.platform ? 'Preparing…' : 'Download'}
          </button>
        </div>
      ))}
    </div>
  );
}
