import { Request } from 'express';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}

export interface JWTPayload {
    id: string;
    email: string;
    role: string;
}

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

export interface SepayPaymentRequest {
    orderId: string;
    amount: number;
    description: string;
}

export interface SepayWebhookPayload {
    transactionId: string;
    orderId: string;
    amount: number;
    status: string;
    signature: string;
}

export interface ChatMessageRequest {
    message: string;
    conversationHistory?: Array<{
        role: 'user' | 'assistant';
        content: string;
    }>;
}

export interface ProductFilter {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    page?: number;
    limit?: number;
}
