import api from './api';

export const chatService = {
    async sendMessage(message: string) {
        const response = await api.post('/chat/message', { message });
        return response.data;
    },

    async getChatHistory(page = 1, limit = 50) {
        const response = await api.get('/chat/history', {
            params: { page, limit },
        });
        return response.data;
    },

    async clearHistory() {
        const response = await api.delete('/chat/history');
        return response.data;
    },
};
