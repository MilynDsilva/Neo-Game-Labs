import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  Inject,
  Post,
  Req,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { z } from 'zod';

import { AuthService, sessionCookieName } from '../auth/auth.service.js';
import { PaymentsService } from './payments.service.js';

const checkoutRequestSchema = z.object({
  checkoutRequestKey: z.uuid(),
  packageCode: z.string().min(1).max(80),
});

const verificationSchema = z.object({
  orderId: z.string().min(1).max(80),
  paymentId: z.string().min(1).max(80),
  signature: z.string().min(1).max(256),
});

@Controller('payments')
export class PaymentsController {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(PaymentsService) private readonly paymentsService: PaymentsService,
  ) {}

  @Post('checkout')
  async createCheckout(@Body() body: unknown, @Req() request: Request) {
    if (!this.configService.getOrThrow<boolean>('TOP_UPS_ENABLED')) {
      throw new ServiceUnavailableException('Point top-ups are paused');
    }
    this.assertTrustedOrigin(request);
    const parsed = checkoutRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException('Invalid checkout request');
    }
    const input = parsed.data;
    const customerId = await this.authService.getAuthenticatedCustomerId(
      request.cookies[sessionCookieName] as string | undefined,
    );
    return this.paymentsService.createCheckout(
      customerId,
      input.packageCode,
      input.checkoutRequestKey,
    );
  }

  @Post('razorpay/verify')
  async verifyRazorpayPayment(@Body() body: unknown, @Req() request: Request) {
    if (!this.configService.getOrThrow<boolean>('TOP_UPS_ENABLED')) {
      throw new ServiceUnavailableException('Point top-ups are paused');
    }
    this.assertTrustedOrigin(request);
    const parsed = verificationSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException('Invalid payment verification');
    }
    const customerId = await this.authService.getAuthenticatedCustomerId(
      request.cookies[sessionCookieName] as string | undefined,
    );
    return this.paymentsService.verifyCheckout(customerId, parsed.data);
  }

  @Post('razorpay/webhook')
  @HttpCode(200)
  async handleRazorpayWebhook(
    @Headers('x-razorpay-signature') signature: string | undefined,
    @Headers('x-razorpay-event-id') eventId: string | undefined,
    @Req() request: RawBodyRequest<Request>,
  ) {
    if (!signature || !eventId || !request.rawBody) {
      throw new BadRequestException(
        'Missing Razorpay signature, event ID, or raw body',
      );
    }
    const event = this.paymentsService.constructWebhook(
      request.rawBody,
      signature,
    );
    await this.paymentsService.processWebhook(eventId, event);
    return { received: true };
  }

  private assertTrustedOrigin(request: Request): void {
    if (
      request.headers.origin !==
      this.configService.getOrThrow<string>('WEB_ORIGIN')
    ) {
      throw new UnauthorizedException('Invalid request origin');
    }
  }
}
