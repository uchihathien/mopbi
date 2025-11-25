import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware';
import { AuthRequest } from '../types';

const router = Router();
const prisma = new PrismaClient();

// All cart routes require authentication
router.use(authenticate);

// Get user's cart
router.get('/', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;

        const cartItems = await prisma.cartItem.findMany({
            where: { userId },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        images: true,
                        stockQuantity: true,
                        isActive: true,
                    },
                },
            },
        });

        const total = cartItems.reduce(
            (sum, item) => sum + Number(item.product.price) * item.quantity,
            0
        );

        res.json({
            items: cartItems,
            total,
            itemCount: cartItems.length,
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

// Add item to cart
router.post('/', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const { productId, quantity } = req.body;

        if (!productId || !quantity || quantity < 1) {
            return res.status(400).json({ error: 'Invalid request data' });
        }

        // Check if product exists and is available
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product || !product.isActive) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (product.stockQuantity < quantity) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }

        // Check if item already in cart
        const existingItem = await prisma.cartItem.findFirst({
            where: { userId, productId },
        });

        let cartItem;

        if (existingItem) {
            // Update quantity
            cartItem = await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
                include: { product: true },
            });
        } else {
            // Create new cart item
            cartItem = await prisma.cartItem.create({
                data: {
                    userId,
                    productId,
                    quantity,
                },
                include: { product: true },
            });
        }

        res.status(201).json(cartItem);
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ error: 'Failed to add to cart' });
    }
});

// Update cart item quantity
router.put('/:itemId', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const { itemId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ error: 'Invalid quantity' });
        }

        const cartItem = await prisma.cartItem.findFirst({
            where: { id: itemId, userId },
            include: { product: true },
        });

        if (!cartItem) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        if (cartItem.product.stockQuantity < quantity) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }

        const updatedItem = await prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity },
            include: { product: true },
        });

        res.json(updatedItem);
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ error: 'Failed to update cart' });
    }
});

// Remove item from cart
router.delete('/:itemId', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const { itemId } = req.params;

        const cartItem = await prisma.cartItem.findFirst({
            where: { id: itemId, userId },
        });

        if (!cartItem) {
            return res.status(404).json({ error: 'Cart item not found' });
        }

        await prisma.cartItem.delete({
            where: { id: itemId },
        });

        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ error: 'Failed to remove from cart' });
    }
});

// Clear cart
router.delete('/', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;

        await prisma.cartItem.deleteMany({
            where: { userId },
        });

        res.json({ message: 'Cart cleared' });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
});

export default router;
