import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware';
import { AuthRequest } from '../types';
import sepayService from '../services/sepay.service';

const router = Router();
const prisma = new PrismaClient();

// Create Sepay payment
router.post('/sepay/create', authenticate, async (req: AuthRequest, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.user!.id;

        if (!orderId) {
            return res.status(400).json({ error: 'Order ID required' });
        }

        // Verify order belongs to user
        const order = await prisma.order.findFirst({
            where: { id: orderId, userId },
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.paymentStatus === 'completed') {
            return res.status(400).json({ error: 'Order already paid' });
        }

        // Create Sepay payment
        const payment = await sepayService.createPayment({
            orderId: order.id,
            amount: Number(order.totalAmount),
            description: `Thanh toán đơn hàng #${order.id.substring(0, 8)}`,
        });

        if (!payment.success) {
            return res.status(500).json({ error: payment.error });
        }

        // Update order with transaction ID
        await prisma.order.update({
            where: { id: orderId },
            data: {
                sepayTransactionId: payment.data?.transactionId,
                paymentMethod: 'sepay',
            },
        });

        res.json(payment.data);
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({ error: 'Failed to create payment' });
    }
});

// Sepay webhook
router.post('/sepay/webhook', async (req, res) => {
    try {
        const payload = req.body;

        // Verify webhook signature
        const isValid = sepayService.verifyWebhook(payload);

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid signature' });
        }

        const { orderId, status, transactionId } = payload;

        // Update order payment status
        const updateData: any = {
            sepayTransactionId: transactionId,
        };

        if (status === 'success') {
            updateData.paymentStatus = 'completed';
            updateData.status = 'paid';
        } else if (status === 'failed') {
            updateData.paymentStatus = 'failed';
        }

        await prisma.order.update({
            where: { id: orderId },
            data: updateData,
        });

        res.json({ message: 'Webhook processed' });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ error: 'Failed to process webhook' });
    }
});

// Check payment status
router.get('/sepay/status/:orderId', authenticate, async (req: AuthRequest, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user!.id;

        const order = await prisma.order.findFirst({
            where: { id: orderId, userId },
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (!order.sepayTransactionId) {
            return res.status(400).json({ error: 'No payment transaction found' });
        }

        // Check with Sepay
        const paymentStatus = await sepayService.checkPaymentStatus(
            order.sepayTransactionId
        );

        if (paymentStatus.success && paymentStatus.data.status === 'success') {
            // Update order if not already updated
            if (order.paymentStatus !== 'completed') {
                await prisma.order.update({
                    where: { id: orderId },
                    data: {
                        paymentStatus: 'completed',
                        status: 'paid',
                    },
                });
            }
        }

        res.json({
            orderId: order.id,
            paymentStatus: order.paymentStatus,
            orderStatus: order.status,
            sepayData: paymentStatus.data,
        });
    } catch (error) {
        console.error('Check payment status error:', error);
        res.status(500).json({ error: 'Failed to check payment status' });
    }
});

export default router;
