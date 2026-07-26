import type { Model } from 'mongoose';
import { describe, expect, it } from 'vitest';

import type { GameDocument } from '../src/catalog/game.schema.js';
import type { EntitlementDocument } from '../src/purchases/entitlement.schema.js';
import type { DownloadAssetDocument } from '../src/downloads/download-asset.schema.js';
import type { DownloadGrantDocument } from '../src/downloads/download-grant.schema.js';
import { DownloadsService } from '../src/downloads/downloads.service.js';

describe('DownloadsService', () => {
  it('rejects malformed grants before accessing persistence', async () => {
    const service = new DownloadsService(
      {} as Model<GameDocument>,
      {} as Model<EntitlementDocument>,
      {} as Model<DownloadAssetDocument>,
      {} as Model<DownloadGrantDocument>,
    );

    await expect(service.consumeGrant('../game.zip')).rejects.toMatchObject({
      status: 401,
    });
  });
});
