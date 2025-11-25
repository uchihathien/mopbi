import api from './api';

export interface Order {
    id: string;
    userId: string;
    totalAmount: number;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    paymentProof?: string;
    shippingAddress: any;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    orderItems: OrderItem[];
}

export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    product: {
        id: string;
        name: string;
        images?: any;
    };
}

export interface CreateOrderDto {
    shippingAddress: any;
    paymentMethod: 'cod' | 'bank_transfer';
    notes?: string;
    items: Array<{
        productId: string;
        quantity: number;
    }>;
}

class OrderService {
    async createOrder(data: CreateOrderDto): Promise<Order> {
        const response = await api.post('/orders', data);
        return response.data;
    }

    async getOrders(page = 1, limit = 10) {
        const response = await api.get(`/orders?page=${page}&limit=${limit}`);
        return response.data;
    }

    async getOrderById(id: string): Promise<Order> {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    }

    async uploadPaymentProof(orderId: string, proofUrl: string): Promise<Order> {
        const response = await api.post(`/orders/${orderId}/payment-proof`, {
            paymentProof: proofUrl,
        });
        return response.data;
    }

    async cancelOrder(orderId: string): Promise<void> {
        await api.put(`/orders/${orderId}/cancel`);
    }
}

export const orderService = new OrderService();
