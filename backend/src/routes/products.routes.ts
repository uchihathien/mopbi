import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { ProductFilter } from '../types';

const router = Router();
const prisma = new PrismaClient();

// Get all products with filters
router.get('/', async (req, res) => {
    try {
        const {
            categoryId,
            minPrice,
            maxPrice,
            search,
            page = '1',
            limit = '20',
        } = req.query as any;

        const filters: any = {
            isActive: true,
        };

        if (categoryId) {
            filters.categoryId = categoryId;
        }

        if (minPrice || maxPrice) {
            filters.price = {};
            if (minPrice) filters.price.gte = parseFloat(minPrice);
            if (maxPrice) filters.price.lte = parseFloat(maxPrice);
        }

        if (search) {
            filters.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where: filters,
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.product.count({ where: filters }),
        ]);

        res.json({
            products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get product by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                reviews: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Calculate average rating
        const avgRating =
            product.reviews.length > 0
                ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
                product.reviews.length
                : 0;

        res.json({
            ...product,
            averageRating: avgRating,
            reviewCount: product.reviews.length,
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Get all categories
router.get('/categories/all', async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                children: true,
                _count: {
                    select: { products: true },
                },
            },
        });

        res.json(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

export default router;
