import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
    const { isAuthenticated, isLoading, loadUser } = useAuthStore();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        loadUser();
    }, []);

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!isAuthenticated && !inAuthGroup) {
            router.replace('/(auth)/login');
        } else if (isAuthenticated && inAuthGroup) {
            router.replace('/(tabs)');
        }
    }, [isAuthenticated, isLoading, segments]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return <Slot />;
}
