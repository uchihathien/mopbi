import api from './api';
import { Product, Category } from '../types';

export const productService = {
    async getProducts(params?: {
        categoryId?: string;
        minPrice?: number;
        maxPrice?: number;
        search?: string;
        page?: number;
        limit?: number;
    }) {
        const response = await api.get('/products', { params });
        return response.data;
    },

    async getProductById(id: string) {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    async getCategories() {
        const response = await api.get('/products/categories/all');
        return response.data;
    },
};
