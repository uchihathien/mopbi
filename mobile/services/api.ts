import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.6:3000/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await AsyncStorage.getItem('refreshToken');

                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                const response = await axios.post(`${API_URL}/auth/refresh`, {
                    refreshToken,
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data;

                await AsyncStorage.setItem('accessToken', accessToken);
                await AsyncStorage.setItem('refreshToken', newRefreshToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Clear tokens and redirect to login
                await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
