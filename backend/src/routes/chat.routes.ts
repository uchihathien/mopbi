import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware';
import { AuthRequest } from '../types';
import aiService from '../services/ai.service';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Send message to AI chatbox
router.post('/message', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const { message } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ error: 'Message cannot be empty' });
        }

        // Get recent conversation history
        const recentMessages = await prisma.chatMessage.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        // Convert to conversation format
        const conversationHistory = recentMessages.reverse().map((msg) => ({
            role: msg.isUser ? ('user' as const) : ('assistant' as const),
            content: msg.message,
        }));

        // Save user message
        await prisma.chatMessage.create({
            data: {
                userId,
                message: message.trim(),
                isUser: true,
            },
        });

        // Get AI response
        const aiResponse = await aiService.processMessage(userId, {
            message: message.trim(),
            conversationHistory,
        });

        if (!aiResponse.success) {
            return res.status(500).json({ error: aiResponse.error });
        }

        // Save AI message
        const aiMessage = await prisma.chatMessage.create({
            data: {
                userId,
                message: aiResponse.data!.message,
                isUser: false,
                metadata: {
                    recommendations: aiResponse.data!.recommendations,
                },
            },
        });

        res.json({
            message: aiResponse.data!.message,
            recommendations: aiResponse.data!.recommendations,
            messageId: aiMessage.id,
        });
    } catch (error) {
        console.error('Chat message error:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
});

// Get chat history
router.get('/history', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const { page = '1', limit = '50' } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const [messages, total] = await Promise.all([
            prisma.chatMessage.findMany({
                where: { userId },
                orderBy: { createdAt: 'asc' },
                skip,
                take: limitNum,
            }),
            prisma.chatMessage.count({ where: { userId } }),
        ]);

        res.json({
            messages,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('Get chat history error:', error);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
});

export default router;
