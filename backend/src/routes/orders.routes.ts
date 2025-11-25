import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware';
import { AuthRequest } from '../types';
import { emailService } from '../services/email.service';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Create order from cart (items sent from client)
router.post('/', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const { shippingAddress, notes, paymentMethod, items } = req.body;

        if (!shippingAddress) {
            return res.status(400).json({ error: 'Shipping address required' });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Fetch products to validate and get current prices
        const productIds = items.map((item: any) => item.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
        });

        // Create product map for quick lookup
        const productMap = new Map(products.map(p => [p.id, p]));

        // Validate stock availability
        for (const item of items) {
            const product = productMap.get(item.productId);
            if (!product) {
                return res.status(400).json({
                    error: `Product not found: ${item.productId}`,
                });
            }
            if (product.stockQuantity < item.quantity) {
                return res.status(400).json({
                    error: `Insufficient stock for ${product.name}`,
                });
            }
        }

        // Calculate total using current prices
        const totalAmount = items.reduce((sum: number, item: any) => {
            const product = productMap.get(item.productId);
            return sum + Number(product!.price) * item.quantity;
        }, 0);

        // Create order with items in a transaction
        const order = await prisma.$transaction(async (tx) => {
            // Create order
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    totalAmount,
                    shippingAddress,
                    notes,
                    paymentMethod: paymentMethod || 'cod',
                    status: 'pending',
                    paymentStatus: 'pending',
                },
            });

            // Create order items
            await Promise.all(
                items.map((item: any) => {
                    const product = productMap.get(item.productId);
                    return tx.orderItem.create({
                        data: {
                            orderId: newOrder.id,
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: product!.price,
                            subtotal: Number(product!.price) * item.quantity,
                        },
                    });
                })
            );

            // Update stock quantities
            await Promise.all(
                items.map((item: any) =>
                    tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stockQuantity: {
                                decrement: item.quantity,
                            },
                        },
                    })
                )
            );

            return newOrder;
        });

        // Fetch complete order with items and user
        const completeOrder = await prisma.order.findUnique({
            where: { id: order.id },
            include: {
                user: {
                    select: {
                        email: true,
                    },
                },
                orderItems: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        // Send order confirmation email
        if (completeOrder && completeOrder.user.email) {
            const customerName = shippingAddress.fullName || 'Khách hàng';

            emailService.sendOrderConfirmation({
                orderId: completeOrder.id,
                customerName,
                customerEmail: completeOrder.user.email,
                orderDate: new Date(completeOrder.createdAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                items: completeOrder.orderItems.map(item => ({
                    name: item.product.name,
                    quantity: item.quantity,
                    price: Number(item.unitPrice),
                    subtotal: Number(item.subtotal),
                })),
                totalAmount: Number(completeOrder.totalAmount),
                shippingAddress: completeOrder.shippingAddress as any,
                paymentMethod: completeOrder.paymentMethod || 'cod',
            }).catch(err => {
                console.error('Failed to send email, but order was created:', err);
            });
        }

        res.status(201).json(completeOrder);
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Get user's orders
router.get('/', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const { page = '1', limit = '10' } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where: { userId },
                include: {
                    orderItems: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    images: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum,
            }),
            prisma.order.count({ where: { userId } }),
        ]);

        res.json({
            orders,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Get order by ID
router.get('/:id', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const { id } = req.params;

        const order = await prisma.order.findFirst({
            where: { id, userId },
            include: {
                orderItems: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// Upload payment proof
router.post('/:id/payment-proof', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const { id } = req.params;
        const { paymentProof } = req.body;

        if (!paymentProof) {
            return res.status(400).json({ error: 'Payment proof URL required' });
        }

        const order = await prisma.order.findFirst({
            where: { id, userId },
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.paymentMethod !== 'bank_transfer') {
            return res.status(400).json({ error: 'Payment proof only for bank transfer orders' });
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { paymentProof },
        });

        res.json(updatedOrder);
    } catch (error) {
        console.error('Upload payment proof error:', error);
        res.status(500).json({ error: 'Failed to upload payment proof' });
    }
});

// Cancel order
router.put('/:id/cancel', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const { id } = req.params;

        const order = await prisma.order.findFirst({
            where: { id, userId },
            include: { orderItems: true },
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (!['pending', 'confirmed'].includes(order.status)) {
            return res.status(400).json({ error: 'Cannot cancel this order' });
        }

        // Update order status and restore stock
        await prisma.$transaction(async (tx) => {
            await tx.order.update({
                where: { id },
                data: { status: 'cancelled' },
            });

            // Restore stock quantities
            await Promise.all(
                order.orderItems.map((item) =>
                    tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stockQuantity: {
                                increment: item.quantity,
                            },
                        },
                    })
                )
            );
        });

        res.json({ message: 'Order cancelled successfully' });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ error: 'Failed to cancel order' });
    }
});

export default router;
