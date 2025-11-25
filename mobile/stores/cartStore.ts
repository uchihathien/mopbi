import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem } from '../types';

interface CartState {
    items: CartItem[];
    total: number;
    itemCount: number;
    isLoading: boolean;
    currentUserId: string | null;
    addItem: (item: CartItem) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    removeItem: (itemId: string) => void;
    clearCart: () => void;
    switchUser: (userId: string | null) => Promise<void>;
}

// Helper to get storage key for specific user
const getStorageKey = (userId: string | null) => {
    return userId ? `cart-storage-${userId}` : 'cart-storage-guest';
};

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            total: 0,
            itemCount: 0,
            isLoading: false,
            currentUserId: null,

            addItem: (item) => {
                console.log('🛒 Adding item to cart:', item.product.name, 'x', item.quantity);
                const { items } = get();
                const existingItem = items.find((i) => i.productId === item.productId);

                if (existingItem) {
                    console.log('📝 Item exists, updating quantity');
                    const updatedItems = items.map((i) =>
                        i.productId === item.productId
                            ? { ...i, quantity: i.quantity + item.quantity }
                            : i
                    );
                    const total = updatedItems.reduce(
                        (sum, i) => sum + Number(i.product.price) * i.quantity,
                        0
                    );
                    set({
                        items: updatedItems,
                        total,
                        itemCount: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
                    });
                    console.log('✅ Cart updated. Total items:', updatedItems.length);
                } else {
                    console.log('➕ Adding new item');
                    const updatedItems = [...items, item];
                    const total = updatedItems.reduce(
                        (sum, i) => sum + Number(i.product.price) * i.quantity,
                        0
                    );
                    set({
                        items: updatedItems,
                        total,
                        itemCount: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
                    });
                    console.log('✅ Item added. Total items:', updatedItems.length);
                }
            },

            updateQuantity: (itemId, quantity) => {
                console.log('🔄 Updating quantity:', itemId, quantity);
                const { items } = get();

                if (quantity < 1) {
                    get().removeItem(itemId);
                    return;
                }

                const updatedItems = items.map((i) =>
                    i.id === itemId ? { ...i, quantity } : i
                );
                const total = updatedItems.reduce(
                    (sum, i) => sum + Number(i.product.price) * i.quantity,
                    0
                );
                set({
                    items: updatedItems,
                    total,
                    itemCount: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
                });
                console.log('✅ Quantity updated');
            },

            removeItem: (itemId) => {
                console.log('🗑️ Removing item:', itemId);
                const { items } = get();
                const updatedItems = items.filter((i) => i.id !== itemId);
                const total = updatedItems.reduce(
                    (sum, i) => sum + Number(i.product.price) * i.quantity,
                    0
                );
                set({
                    items: updatedItems,
                    total,
                    itemCount: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
                });
                console.log('✅ Item removed');
            },

            clearCart: () => {
                console.log('🧹 Clearing cart');
                set({ items: [], total: 0, itemCount: 0 });
            },

            switchUser: async (userId) => {
                console.log('👤 Switching user cart:', userId || 'guest');
                const { currentUserId } = get();

                if (currentUserId === userId) {
                    console.log('⚠️ Same user, no need to switch');
                    return;
                }

                // Save current cart before switching
                const currentState = get();
                const currentKey = getStorageKey(currentUserId);
                await AsyncStorage.setItem(
                    currentKey,
                    JSON.stringify({
                        state: {
                            items: currentState.items,
                            total: currentState.total,
                            itemCount: currentState.itemCount,
                        },
                    })
                );
                console.log('💾 Saved cart for user:', currentUserId || 'guest');

                // Load cart for new user
                const newKey = getStorageKey(userId);
                try {
                    const savedCart = await AsyncStorage.getItem(newKey);
                    if (savedCart) {
                        const parsed = JSON.parse(savedCart);
                        set({
                            items: parsed.state.items || [],
                            total: parsed.state.total || 0,
                            itemCount: parsed.state.itemCount || 0,
                            currentUserId: userId,
                        });
                        console.log('✅ Loaded cart for user:', userId || 'guest', '- Items:', parsed.state.items?.length || 0);
                    } else {
                        // No saved cart for this user, start fresh
                        set({
                            items: [],
                            total: 0,
                            itemCount: 0,
                            currentUserId: userId,
                        });
                        console.log('✅ Started fresh cart for user:', userId || 'guest');
                    }
                } catch (error) {
                    console.error('❌ Error loading cart:', error);
                    set({
                        items: [],
                        total: 0,
                        itemCount: 0,
                        currentUserId: userId,
                    });
                }
            },
        }),
        {
            name: 'cart-storage-guest', // Default storage key for guest
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => (state) => {
                console.log('💾 Cart rehydrated from storage:', state?.items.length || 0, 'items');
                console.log('👤 Current user:', state?.currentUserId || 'guest');
            },
            partialize: (state) => ({
                items: state.items,
                total: state.total,
                itemCount: state.itemCount,
                currentUserId: state.currentUserId,
            }),
        }
    )
);
