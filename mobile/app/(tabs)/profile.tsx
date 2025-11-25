import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';

export default function ProfileScreen() {
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.replace('/(auth)/login');
    };

    const menuItems = [
        {
            icon: 'receipt-outline',
            title: 'Đơn hàng của tôi',
            onPress: () => router.push('/orders'),
        },
        {
            icon: 'location-outline',
            title: 'Địa chỉ giao hàng',
            onPress: () => router.push('/address'),
        },
        {
            icon: 'settings-outline',
            title: 'Cài đặt',
            onPress: () => { },
        },
        {
            icon: 'help-circle-outline',
            title: 'Trợ giúp',
            onPress: () => { },
        },
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    {user?.avatarUrl ? (
                        <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Ionicons name="person" size={48} color="#007AFF" />
                        </View>
                    )}
                </View>
                <Text style={styles.name}>{user?.fullName || 'Người dùng'}</Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>

            <View style={styles.menu}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.menuItem}
                        onPress={item.onPress}
                    >
                        <Ionicons name={item.icon as any} size={24} color="#666" />
                        <Text style={styles.menuText}>{item.title}</Text>
                        <Ionicons name="chevron-forward" size={24} color="#ccc" />
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
                <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>

            <Text style={styles.version}>Version 1.0.0</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        padding: 24,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#1a1a1a',
    },
    email: {
        fontSize: 14,
        color: '#666',
    },
    menu: {
        backgroundColor: '#fff',
        marginTop: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuText: {
        flex: 1,
        marginLeft: 16,
        fontSize: 16,
        color: '#1a1a1a',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        margin: 16,
        padding: 16,
        borderRadius: 8,
    },
    logoutText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#FF3B30',
    },
    version: {
        textAlign: 'center',
        color: '#999',
        fontSize: 12,
        marginBottom: 32,
    },
});
