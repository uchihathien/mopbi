import api from './api';

export const cartService = {
    async getCart() {
        const response = await api.get('/cart');
        return response.data;
    },

    async addToCart(productId: string, quantity: number) {
        const response = await api.post('/cart', { productId, quantity });
        return response.data;
    },

    async updateCartItem(itemId: string, quantity: number) {
        const response = await api.put(`/cart/${itemId}`, { quantity });
        return response.data;
    },

    async removeFromCart(itemId: string) {
        const response = await api.delete(`/cart/${itemId}`);
        return response.data;
    },

    async clearCart() {
        const response = await api.delete('/cart');
        return response.data;
    },
};
