import { create } from 'zustand';
import { User } from '../types';
import { authService } from '../services/auth.service';
import { useCartStore } from './cartStore';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isLoading: true,
    isAuthenticated: false,

    login: async (email, password) => {
        const { user } = await authService.login(email, password);
        set({ user, isAuthenticated: true });

        // Switch to user's cart
        console.log('🔄 Switching to user cart after login');
        await useCartStore.getState().switchUser(user.id);
    },

    register: async (email, password, fullName, phone) => {
        const { user } = await authService.register(email, password, fullName, phone);
        set({ user, isAuthenticated: true });

        // Switch to user's cart
        console.log('🔄 Switching to user cart after register');
        await useCartStore.getState().switchUser(user.id);
    },

    loginWithGoogle: async () => {
        const { user } = await authService.loginWithGoogleBackend();
        set({ user, isAuthenticated: true });

        // Switch to user's cart
        console.log('🔄 Switching to user cart after Google login');
        await useCartStore.getState().switchUser(user.id);
    },

    logout: async () => {
        await authService.logout();
        set({ user: null, isAuthenticated: false });

        // Switch to guest cart
        console.log('🔄 Switching to guest cart after logout');
        await useCartStore.getState().switchUser(null);
    },

    loadUser: async () => {
        set({ isLoading: true });
        const user = await authService.getStoredUser();
        const isAuthenticated = await authService.isAuthenticated();
        set({ user, isAuthenticated, isLoading: false });

        // Switch to appropriate cart on app start
        if (user && isAuthenticated) {
            console.log('🔄 Loading user cart on app start');
            await useCartStore.getState().switchUser(user.id);
        } else {
            console.log('🔄 Loading guest cart on app start');
            await useCartStore.getState().switchUser(null);
        }
    },
}));
