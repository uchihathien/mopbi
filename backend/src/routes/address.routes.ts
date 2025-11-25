import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get all addresses for current user
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const addresses = await prisma.address.findMany({
            where: { userId },
            orderBy: [
                { isDefault: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        res.json(addresses);
    } catch (error) {
        console.error('Get addresses error:', error);
        res.status(500).json({ error: 'Failed to get addresses' });
    }
});

// Create new address
router.post('/',
    authenticate,
    [
        body('fullName').trim().notEmpty().withMessage('Full name is required'),
        body('phone').trim().notEmpty().withMessage('Phone is required'),
        body('addressLine').trim().notEmpty().withMessage('Address is required'),
        body('city').trim().notEmpty().withMessage('City is required'),
        body('district').trim().notEmpty().withMessage('District is required'),
        body('ward').trim().notEmpty().withMessage('Ward is required'),
    ],
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const userId = (req as any).user.id;
            const { label, fullName, phone, addressLine, city, district, ward, isDefault } = req.body;

            // Check if user already has 3 addresses
            const addressCount = await prisma.address.count({
                where: { userId }
            });

            if (addressCount >= 3) {
                return res.status(400).json({ error: 'Maximum 3 addresses allowed per user' });
            }

            // If this is set as default, unset other defaults
            if (isDefault) {
                await prisma.address.updateMany({
                    where: { userId, isDefault: true },
                    data: { isDefault: false }
                });
            }

            const address = await prisma.address.create({
                data: {
                    userId,
                    label,
                    fullName,
                    phone,
                    addressLine,
                    city,
                    district,
                    ward,
                    isDefault: isDefault || addressCount === 0, // First address is default
                }
            });

            res.status(201).json(address);
        } catch (error) {
            console.error('Create address error:', error);
            res.status(500).json({ error: 'Failed to create address' });
        }
    }
);

// Update address
router.put('/:id',
    authenticate,
    async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const { id } = req.params;
            const { label, fullName, phone, addressLine, city, district, ward, isDefault } = req.body;

            // Check if address belongs to user
            const existingAddress = await prisma.address.findFirst({
                where: { id, userId }
            });

            if (!existingAddress) {
                return res.status(404).json({ error: 'Address not found' });
            }

            // If setting as default, unset other defaults
            if (isDefault) {
                await prisma.address.updateMany({
                    where: { userId, isDefault: true, id: { not: id } },
                    data: { isDefault: false }
                });
            }

            const address = await prisma.address.update({
                where: { id },
                data: {
                    label,
                    fullName,
                    phone,
                    addressLine,
                    city,
                    district,
                    ward,
                    isDefault,
                }
            });

            res.json(address);
        } catch (error) {
            console.error('Update address error:', error);
            res.status(500).json({ error: 'Failed to update address' });
        }
    }
);

// Set address as default
router.put('/:id/default',
    authenticate,
    async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const { id } = req.params;

            // Check if address belongs to user
            const existingAddress = await prisma.address.findFirst({
                where: { id, userId }
            });

            if (!existingAddress) {
                return res.status(404).json({ error: 'Address not found' });
            }

            // Unset other defaults
            await prisma.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false }
            });

            // Set this as default
            const address = await prisma.address.update({
                where: { id },
                data: { isDefault: true }
            });

            res.json(address);
        } catch (error) {
            console.error('Set default address error:', error);
            res.status(500).json({ error: 'Failed to set default address' });
        }
    }
);

// Delete address
router.delete('/:id',
    authenticate,
    async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const { id } = req.params;

            // Check if address belongs to user
            const existingAddress = await prisma.address.findFirst({
                where: { id, userId }
            });

            if (!existingAddress) {
                return res.status(404).json({ error: 'Address not found' });
            }

            await prisma.address.delete({
                where: { id }
            });

            // If deleted address was default, set another as default
            if (existingAddress.isDefault) {
                const firstAddress = await prisma.address.findFirst({
                    where: { userId },
                    orderBy: { createdAt: 'asc' }
                });

                if (firstAddress) {
                    await prisma.address.update({
                        where: { id: firstAddress.id },
                        data: { isDefault: true }
                    });
                }
            }

            res.json({ message: 'Address deleted successfully' });
        } catch (error) {
            console.error('Delete address error:', error);
            res.status(500).json({ error: 'Failed to delete address' });
        }
    }
);

export default router;
