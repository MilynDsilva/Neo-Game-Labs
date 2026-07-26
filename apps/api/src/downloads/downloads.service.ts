import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { createHash, randomBytes } from 'node:crypto';
import { access } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import type { Model } from 'mongoose';
import { Types } from 'mongoose';

import { Game } from '../catalog/game.schema.js';
import type { GameDocument } from '../catalog/game.schema.js';
import { Entitlement } from '../purchases/entitlement.schema.js';
import type { EntitlementDocument } from '../purchases/entitlement.schema.js';
import { DownloadAsset } from './download-asset.schema.js';
import type { DownloadAssetDocument } from './download-asset.schema.js';
import { DownloadGrant } from './download-grant.schema.js';
import type { DownloadGrantDocument } from './download-grant.schema.js';

const grantLifetimeMilliseconds = 5 * 60 * 1000;

@Injectable()
export class DownloadsService {
  constructor(
    @InjectModel(Game.name) private readonly gameModel: Model<GameDocument>,
    @InjectModel(Entitlement.name)
    private readonly entitlementModel: Model<EntitlementDocument>,
    @InjectModel(DownloadAsset.name)
    private readonly assetModel: Model<DownloadAssetDocument>,
    @InjectModel(DownloadGrant.name)
    private readonly grantModel: Model<DownloadGrantDocument>,
  ) {}

  async listDownloads(customerId: string, gameSlug: string) {
    const { game } = await this.requireEntitlement(customerId, gameSlug);
    const assets = await this.assetModel
      .find({ active: true, gameId: game._id })
      .sort({ platform: 1 })
      .lean();
    return {
      downloads: assets.map((asset) => ({
        fileName: asset.fileName,
        platform: asset.platform,
        sizeBytes: asset.sizeBytes ?? 0,
        version: asset.version,
      })),
    };
  }

  async createGrant(customerId: string, gameSlug: string, platform: string) {
    const { game } = await this.requireEntitlement(customerId, gameSlug);
    const asset = await this.assetModel.findOne({
      active: true,
      gameId: game._id,
      platform,
    });
    if (!asset) throw new NotFoundException('Download is not available');

    const token = randomBytes(32).toString('base64url');
    await this.grantModel.create({
      assetId: asset._id,
      customerId: new Types.ObjectId(customerId),
      expiresAt: new Date(Date.now() + grantLifetimeMilliseconds),
      tokenHash: this.hashToken(token),
    });
    return {
      expiresAt: new Date(Date.now() + grantLifetimeMilliseconds).toISOString(),
      url: `/v1/downloads/file/${token}`,
    };
  }

  async consumeGrant(token: string) {
    if (!/^[a-zA-Z0-9_-]{40,80}$/.test(token)) {
      throw new UnauthorizedException('Invalid download grant');
    }
    const tokenHash = this.hashToken(token);
    const pendingGrant = await this.grantModel.findOne({
      expiresAt: { $gt: new Date() },
      tokenHash,
      usedAt: { $exists: false },
    });
    if (!pendingGrant)
      throw new UnauthorizedException('Download grant expired');

    const asset = await this.assetModel.findOne({
      _id: pendingGrant.assetId,
      active: true,
    });
    if (!asset) throw new NotFoundException('Download is not available');
    const entitlement = await this.entitlementModel.exists({
      customerId: pendingGrant.customerId,
      gameId: asset.gameId,
      status: 'active',
    });
    if (!entitlement)
      throw new UnauthorizedException('Entitlement is inactive');

    const filePath = this.resolveStoragePath(asset.storageKey);
    await access(filePath);
    const consumed = await this.grantModel.findOneAndUpdate(
      {
        _id: pendingGrant._id,
        expiresAt: { $gt: new Date() },
        usedAt: { $exists: false },
      },
      { $set: { usedAt: new Date() } },
      { returnDocument: 'after' },
    );
    if (!consumed) throw new UnauthorizedException('Download grant was used');
    return { fileName: asset.fileName, filePath };
  }

  private async requireEntitlement(customerId: string, gameSlug: string) {
    const game = await this.gameModel.findOne({ slug: gameSlug }).lean();
    if (!game) throw new NotFoundException('Game was not found');
    const entitlement = await this.entitlementModel.exists({
      customerId: new Types.ObjectId(customerId),
      gameId: game._id,
      status: 'active',
    });
    if (!entitlement) throw new UnauthorizedException('Game is not owned');
    return { game };
  }

  private resolveStoragePath(storageKey: string): string {
    const storageRoot = resolve(__dirname, '../../storage');
    const filePath = resolve(storageRoot, storageKey);
    if (!filePath.startsWith(`${storageRoot}${sep}`)) {
      throw new BadRequestException('Invalid download path');
    }
    return filePath;
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
