import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { addressService, Address } from '../../services/address.service';

export default function AddressesScreen() {
    const router = useRouter();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        try {
            setLoading(true);
            const data = await addressService.getAddresses();
            setAddresses(data);
        } catch (error) {
            console.error('Load addresses error:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách địa chỉ');
        } finally {
            setLoading(false);
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            await addressService.setDefaultAddress(id);
            await loadAddresses();
            Alert.alert('Thành công', 'Đã đặt làm địa chỉ mặc định');
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể đặt địa chỉ mặc định');
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert(
            'Xác nhận',
            'Bạn muốn xóa địa chỉ này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await addressService.deleteAddress(id);
                            await loadAddresses();
                            Alert.alert('Thành công', 'Đã xóa địa chỉ');
                        } catch (error) {
                            Alert.alert('Lỗi', 'Không thể xóa địa chỉ');
                        }
                    },
                },
            ]
        );
    };

    const renderAddress = ({ item }: { item: Address }) => (
        <View style={[styles.addressCard, item.isDefault && styles.defaultCard]}>
            {/* Header with badges */}
            <View style={styles.addressHeader}>
                <View style={styles.labelContainer}>
                    {item.label && (
                        <View style={styles.labelBadge}>
                            <Ionicons
                                name={item.label === 'Nhà' ? 'home' : 'business'}
                                size={14}
                                color="#007AFF"
                            />
                            <Text style={styles.labelText}>{item.label}</Text>
                        </View>
                    )}
                    {item.isDefault && (
                        <View style={styles.defaultBadge}>
                            <Ionicons name="checkmark-circle" size={14} color="#fff" />
                            <Text style={styles.defaultText}>Mặc định</Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => router.push(`/address/edit/${item.id}`)}
                >
                    <Ionicons name="create" size={20} color="#007AFF" />
                </TouchableOpacity>
            </View>

            {/* Address info */}
            <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                    <Ionicons name="person" size={18} color="#666" />
                    <Text style={styles.fullName}>{item.fullName}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="call" size={18} color="#666" />
                    <Text style={styles.phone}>{item.phone}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="location" size={18} color="#666" />
                    <Text style={styles.address}>
                        {item.addressLine}, {item.ward}, {item.district}, {item.city}
                    </Text>
                </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                {!item.isDefault && (
                    <TouchableOpacity
                        style={styles.defaultButton}
                        onPress={() => handleSetDefault(item.id)}
                    >
                        <Ionicons name="star-outline" size={18} color="#007AFF" />
                        <Text style={styles.defaultButtonText}>Đặt làm mặc định</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(item.id)}
                >
                    <Ionicons name="trash" size={18} color="#FF3B30" />
                    <Text style={styles.deleteButtonText}>Xóa</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Địa chỉ của tôi</Text>
                <Text style={styles.headerSubtitle}>
                    {addresses.length}/3 địa chỉ
                </Text>
            </View>

            <FlatList
                data={addresses}
                renderItem={renderAddress}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="location-outline" size={80} color="#007AFF" />
                        </View>
                        <Text style={styles.emptyTitle}>Chưa có địa chỉ nào</Text>
                        <Text style={styles.emptySubtitle}>
                            Thêm địa chỉ để giao hàng nhanh hơn
                        </Text>
                    </View>
                }
            />

            {/* FAB - Floating Action Button */}
            {addresses.length < 3 && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => router.push('/address/add')}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add" size={28} color="#fff" />
                </TouchableOpacity>
            )}

            {/* Limit warning */}
            {addresses.length >= 3 && (
                <View style={styles.limitInfo}>
                    <Ionicons name="information-circle" size={20} color="#FF9500" />
                    <Text style={styles.limitText}>
                        Bạn đã đạt giới hạn 3 địa chỉ. Xóa địa chỉ cũ để thêm mới.
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    list: {
        padding: 16,
        paddingBottom: 100,
    },
    addressCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    defaultCard: {
        borderColor: '#34C759',
        backgroundColor: '#F0FFF4',
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    labelContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    labelBadge: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        alignItems: 'center',
        gap: 4,
    },
    labelText: {
        fontSize: 12,
        color: '#007AFF',
        fontWeight: '600',
    },
    defaultBadge: {
        flexDirection: 'row',
        backgroundColor: '#34C759',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        alignItems: 'center',
        gap: 4,
    },
    defaultText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '600',
    },
    editButton: {
        padding: 8,
        backgroundColor: '#E3F2FD',
        borderRadius: 8,
    },
    infoSection: {
        gap: 12,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    fullName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    phone: {
        flex: 1,
        fontSize: 15,
        color: '#666',
    },
    address: {
        flex: 1,
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    defaultButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#E3F2FD',
        gap: 6,
    },
    defaultButtonText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#FFEBEE',
        gap: 6,
    },
    deleteButtonText: {
        fontSize: 14,
        color: '#FF3B30',
        fontWeight: '600',
    },
    empty: {
        alignItems: 'center',
        paddingVertical: 64,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    limitInfo: {
        flexDirection: 'row',
        backgroundColor: '#FFF3CD',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        gap: 12,
    },
    limitText: {
        fontSize: 14,
        color: '#856404',
        flex: 1,
        lineHeight: 20,
    },
});
