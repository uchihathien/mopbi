import axios from 'axios';
import crypto from 'crypto';
import { SepayPaymentRequest, SepayWebhookPayload } from '../types';

const SEPAY_API_URL = process.env.SEPAY_API_URL || 'https://api.sepay.vn';
const SEPAY_MERCHANT_ID = process.env.SEPAY_MERCHANT_ID || '';
const SEPAY_API_KEY = process.env.SEPAY_API_KEY || '';
const SEPAY_WEBHOOK_SECRET = process.env.SEPAY_WEBHOOK_SECRET || '';

export class SepayService {
    /**
     * Create a payment request and generate QR code
     */
    async createPayment(data: SepayPaymentRequest) {
        try {
            const payload = {
                merchantId: SEPAY_MERCHANT_ID,
                orderId: data.orderId,
                amount: data.amount,
                description: data.description,
                returnUrl: `${process.env.FRONTEND_URL}/payment/result`,
                cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel`,
            };

            const signature = this.generateSignature(payload);

            const response = await axios.post(
                `${SEPAY_API_URL}/v1/payments/create`,
                {
                    ...payload,
                    signature,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': SEPAY_API_KEY,
                    },
                }
            );

            return {
                success: true,
                data: {
                    qrCode: response.data.qrCode,
                    paymentUrl: response.data.paymentUrl,
                    transactionId: response.data.transactionId,
                },
            };
        } catch (error: any) {
            console.error('Sepay payment creation error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to create payment',
            };
        }
    }

    /**
     * Verify webhook signature
     */
    verifyWebhook(payload: SepayWebhookPayload): boolean {
        const { signature, ...data } = payload;
        const calculatedSignature = this.generateSignature(data);
        return signature === calculatedSignature;
    }

    /**
     * Check payment status
     */
    async checkPaymentStatus(transactionId: string) {
        try {
            const response = await axios.get(
                `${SEPAY_API_URL}/v1/payments/${transactionId}`,
                {
                    headers: {
                        'X-API-Key': SEPAY_API_KEY,
                    },
                }
            );

            return {
                success: true,
                data: response.data,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to check payment status',
            };
        }
    }

    /**
     * Generate signature for Sepay requests
     */
    private generateSignature(data: any): string {
        const sortedKeys = Object.keys(data).sort();
        const signString = sortedKeys
            .map((key) => `${key}=${data[key]}`)
            .join('&');

        return crypto
            .createHmac('sha256', SEPAY_WEBHOOK_SECRET)
            .update(signString)
            .digest('hex');
    }
}

export default new SepayService();
