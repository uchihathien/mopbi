import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthTokens } from '../types';
import * as WebBrowser from 'expo-web-browser';
import 'react-native-url-polyfill/auto'; // Ensure URL polyfill is available if needed

export const authService = {
    async register(email: string, password: string, fullName: string, phone?: string) {
        const response = await api.post('/auth/register', {
            email,
            password,
            fullName,
            phone,
        });

        const { user, accessToken, refreshToken } = response.data;
        await this.saveTokens(accessToken, refreshToken);
        await AsyncStorage.setItem('user', JSON.stringify(user));

        return { user, accessToken, refreshToken };
    },

    async login(email: string, password: string) {
        const response = await api.post('/auth/login', {
            email,
            password,
        });

        const { user, accessToken, refreshToken } = response.data;
        await this.saveTokens(accessToken, refreshToken);
        await AsyncStorage.setItem('user', JSON.stringify(user));

        return { user, accessToken, refreshToken };
    },

    async loginWithGoogleBackend() {
        // Open backend Google auth URL in browser
        // Backend will redirect back to mechanicalshop://auth-callback
        const result = await WebBrowser.openAuthSessionAsync(
            `${api.defaults.baseURL}/auth/google`,
            'mechanicalshop://auth-callback'
        );

        if (result.type === 'success' && result.url) {
            // Parse URL to get tokens
            const url = new URL(result.url);
            const accessToken = url.searchParams.get('accessToken');
            const refreshToken = url.searchParams.get('refreshToken');
            const userStr = url.searchParams.get('user');

            if (accessToken && refreshToken && userStr) {
                const user = JSON.parse(decodeURIComponent(userStr));
                await this.saveTokens(accessToken, refreshToken);
                await AsyncStorage.setItem('user', JSON.stringify(user));
                return { user, accessToken, refreshToken };
            }
        }

        throw new Error('Google login failed or cancelled');
    },

    async logout() {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    },

    async saveTokens(accessToken: string, refreshToken: string) {
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);
    },

    async getStoredUser(): Promise<User | null> {
        const userStr = await AsyncStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    async isAuthenticated(): Promise<boolean> {
        const token = await AsyncStorage.getItem('accessToken');
        return !!token;
    },
};
