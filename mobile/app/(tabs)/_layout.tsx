import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#8E8E93',
                headerShown: true,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Trang chủ',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="categories"
                options={{
                    title: 'Danh mục',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="grid" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="cart"
                options={{
                    title: 'Giỏ hàng',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="cart" size={size} color={color} />
                    ),
                }}
            />
            {/* Chat tab temporarily disabled due to react-native-gifted-chat React 19 incompatibility
            <Tabs.Screen
                name="chat"
                options={{
                    title: 'Trợ lý AI',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="chatbubbles" size={size} color={color} />
                    ),
                }}
            />
            */}
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Tài khoản',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
