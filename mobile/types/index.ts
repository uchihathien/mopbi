export interface User {
    id: string;
    email: string;
    fullName: string | null;
    phone: string | null;
    avatarUrl: string | null;
    role: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface Product {
    id: string;
    name: string;
    description: string | null;
    categoryId: string;
    price: number;
    stockQuantity: number;
    images: string[] | null;
    specifications: any;
    isActive: boolean;
    category?: Category;
    averageRating?: number;
    reviewCount?: number;
}

export interface Category {
    id: string;
    name: string;
    parentId: string | null;
    iconUrl: string | null;
}

export interface CartItem {
    id: string;
    userId: string;
    productId: string;
    quantity: number;
    product: Product;
}

export interface Order {
    id: string;
    userId: string;
    totalAmount: number;
    status: string;
    paymentMethod: string | null;
    paymentStatus: string | null;
    sepayTransactionId: string | null;
    shippingAddress: any;
    notes: string | null;
    createdAt: string;
    orderItems: OrderItem[];
}

export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    product: Product;
}

export interface ChatMessage {
    id: string;
    userId: string;
    message: string;
    isUser: boolean;
    metadata: any;
    createdAt: string;
}

export interface Address {
    id: string;
    userId: string;
    label: string | null;
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    district: string;
    ward: string;
    isDefault: boolean;
}
