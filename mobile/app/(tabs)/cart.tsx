import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../stores/cartStore';
import { CartItem } from '../../types';

export default function CartScreen() {
    const { items, total, itemCount, isLoading, updateQuantity, removeItem } = useCartStore();
    const router = useRouter();

    const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        try {
            await updateQuantity(itemId, newQuantity);
        } catch (error: any) {
            Alert.alert('Lỗi', error.response?.data?.error || 'Không thể cập nhật');
        }
    };

    const handleRemove = async (itemId: string) => {
        Alert.alert('Xác nhận', 'Bạn muốn xóa sản phẩm này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await removeItem(itemId);
                    } catch (error) {
                        Alert.alert('Lỗi', 'Không thể xóa sản phẩm');
                    }
                },
            },
        ]);
    };

    const renderItem = ({ item }: { item: CartItem }) => (
        <View style={styles.cartItem}>
            <Image
                source={{ uri: item.product.images?.[0] || 'https://via.placeholder.com/100' }}
                style={styles.productImage}
            />
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                    {item.product.name}
                </Text>
                <Text style={styles.productPrice}>
                    {Number(item.product.price).toLocaleString('vi-VN')} ₫
                </Text>
                <View style={styles.quantityRow}>
                    <View style={styles.quantityContainer}>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                        >
                            <Ionicons
                                name="remove-circle"
                                size={32}
                                color={item.quantity <= 1 ? '#ccc' : '#007AFF'}
                            />
                        </TouchableOpacity>
                        <Text style={styles.quantity}>{item.quantity}</Text>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        >
                            <Ionicons name="add-circle" size={32} color="#007AFF" />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemove(item.id)}
                    >
                        <Ionicons name="trash" size={20} color="#FF3B30" />
                        <Text style={styles.removeText}>Xóa</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.subtotalRow}>
                    <Text style={styles.subtotalLabel}>Thành tiền:</Text>
                    <Text style={styles.subtotalAmount}>
                        {(Number(item.product.price) * item.quantity).toLocaleString('vi-VN')} ₫
                    </Text>
                </View>
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (items.length === 0) {
        return (
            <View style={styles.empty}>
                <View style={styles.emptyIconContainer}>
                    <Ionicons name="cart-outline" size={80} color="#007AFF" />
                </View>
                <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
                <Text style={styles.emptySubtitle}>
                    Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
                </Text>
                <TouchableOpacity
                    style={styles.shopButton}
                    onPress={() => router.push('/(tabs)')}
                >
                    <Ionicons name="storefront" size={20} color="#fff" />
                    <Text style={styles.shopButtonText}>Mua sắm ngay</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header with item count */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Giỏ hàng của bạn</Text>
                <View style={styles.itemCountBadge}>
                    <Text style={styles.itemCountText}>{itemCount} sản phẩm</Text>
                </View>
            </View>

            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />

            {/* Sticky Footer */}
            <View style={styles.footer}>
                <View style={styles.totalSection}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Tạm tính ({itemCount} sản phẩm):</Text>
                        <Text style={styles.totalAmount}>
                            {total.toLocaleString('vi-VN')} ₫
                        </Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Phí vận chuyển:</Text>
                        <Text style={styles.freeShipping}>Miễn phí</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.totalRow}>
                        <Text style={styles.grandTotalLabel}>Tổng cộng:</Text>
                        <Text style={styles.grandTotalAmount}>
                            {total.toLocaleString('vi-VN')} ₫
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.checkoutButton}
                    onPress={() => router.push('/checkout')}
                >
                    <Text style={styles.checkoutButtonText}>Tiến hành thanh toán</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
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
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    itemCountBadge: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    itemCountText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#fff',
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
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    shopButton: {
        flexDirection: 'row',
        backgroundColor: '#007AFF',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        gap: 8,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    shopButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    list: {
        padding: 16,
        paddingBottom: 200, // Space for footer
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    productImage: {
        width: 100,
        height: 100,
        borderRadius: 12,
        backgroundColor: '#e0e0e0',
    },
    productInfo: {
        flex: 1,
        marginLeft: 16,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 8,
        lineHeight: 22,
    },
    productPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 12,
    },
    quantityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 24,
        padding: 4,
    },
    quantityButton: {
        padding: 4,
    },
    quantity: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        marginHorizontal: 16,
        minWidth: 30,
        textAlign: 'center',
    },
    removeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4,
    },
    removeText: {
        color: '#FF3B30',
        fontSize: 14,
        fontWeight: '600',
    },
    subtotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    subtotalLabel: {
        fontSize: 14,
        color: '#666',
    },
    subtotalAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    totalSection: {
        marginBottom: 16,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    totalLabel: {
        fontSize: 14,
        color: '#666',
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    freeShipping: {
        fontSize: 16,
        fontWeight: '600',
        color: '#34C759',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 12,
    },
    grandTotalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    grandTotalAmount: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    checkoutButton: {
        flexDirection: 'row',
        backgroundColor: '#007AFF',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
