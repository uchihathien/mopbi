import axios from 'axios';
import { ChatMessageRequest } from '../types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const AI_PROVIDER = process.env.AI_PROVIDER || 'openai';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export class AIService {
    /**
     * Process chat message and generate AI response
     */
    async processMessage(userId: string, data: ChatMessageRequest) {
        try {
            // Build conversation context
            const messages = [
                {
                    role: 'system',
                    content: `Bạn là trợ lý AI thông minh cho cửa hàng bán sản phẩm cơ khí. 
          Nhiệm vụ của bạn là:
          1. Tư vấn sản phẩm cơ khí cho khách hàng
          2. Giúp khách hàng tìm sản phẩm phù hợp
          3. Trả lời thắc mắc về đơn hàng
          4. Cung cấp thông tin về chính sách bảo hành, đổi trả
          Luôn trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp.`,
                },
                ...(data.conversationHistory || []),
                {
                    role: 'user',
                    content: data.message,
                },
            ];

            let aiResponse: string;

            if (AI_PROVIDER === 'openai') {
                aiResponse = await this.getOpenAIResponse(messages);
            } else if (AI_PROVIDER === 'gemini') {
                aiResponse = await this.getGeminiResponse(messages);
            } else {
                throw new Error('Invalid AI provider');
            }

            // Check if message is about products and fetch recommendations
            const productRecommendations = await this.getProductRecommendations(
                data.message
            );

            return {
                success: true,
                data: {
                    message: aiResponse,
                    recommendations: productRecommendations,
                },
            };
        } catch (error: any) {
            console.error('AI processing error:', error);
            return {
                success: false,
                error: error.message || 'Failed to process message',
            };
        }
    }

    /**
     * Get response from OpenAI GPT
     */
    private async getOpenAIResponse(messages: any[]): Promise<string> {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4',
                messages: messages,
                temperature: 0.7,
                max_tokens: 500,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                },
            }
        );

        return response.data.choices[0].message.content;
    }

    /**
     * Get response from Google Gemini
     */
    private async getGeminiResponse(messages: any[]): Promise<string> {
        // Convert messages to Gemini format
        const prompt = messages
            .map((msg) => `${msg.role}: ${msg.content}`)
            .join('\n\n');

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [
                    {
                        parts: [{ text: prompt }],
                    },
                ],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data.candidates[0].content.parts[0].text;
    }

    /**
     * Get product recommendations based on message content
     */
    private async getProductRecommendations(message: string) {
        try {
            // Simple keyword search for product recommendations
            const keywords = message.toLowerCase().split(' ');

            const products = await prisma.product.findMany({
                where: {
                    OR: [
                        {
                            name: {
                                contains: keywords.join(' '),
                                mode: 'insensitive',
                            },
                        },
                        {
                            description: {
                                contains: keywords.join(' '),
                                mode: 'insensitive',
                            },
                        },
                    ],
                    isActive: true,
                },
                take: 5,
                select: {
                    id: true,
                    name: true,
                    price: true,
                    images: true,
                },
            });

            return products;
        } catch (error) {
            console.error('Product recommendation error:', error);
            return [];
        }
    }

    /**
     * Get user's order status
     */
    async getUserOrders(userId: string) {
        const orders = await prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                orderItems: {
                    include: {
                        product: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        return orders;
    }
}

export default new AIService();
