import api from './api';

export const paymentService = {
    async createSepayPayment(orderId: string) {
        const response = await api.post('/payment/sepay/create', { orderId });
        return response.data;
    },

    async checkPaymentStatus(orderId: string) {
        const response = await api.get(`/payment/sepay/status/${orderId}`);
        return response.data;
    },
};
