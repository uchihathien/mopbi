import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { orderService, Order } from '../../services/order.service';

export default function OrderDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        loadOrder();
    }, [id]);

    const loadOrder = async () => {
        try {
            setLoading(true);
            const data = await orderService.getOrderById(id as string);
            setOrder(data);
        } catch (error) {
            console.error('Load order error:', error);
            Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = () => {
        Alert.alert(
            'Xác nhận hủy đơn',
            'Bạn có chắc muốn hủy đơn hàng này?',
            [
                { text: 'Không', style: 'cancel' },
                {
                    text: 'Hủy đơn',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setCancelling(true);
                            await orderService.cancelOrder(id as string);
                            Alert.alert('Thành công', 'Đơn hàng đã được hủy', [
                                {
                                    text: 'OK',
                                    onPress: () => loadOrder(),
                                },
                            ]);
                        } catch (error: any) {
                            const errorMessage = error.response?.data?.error || 'Không thể hủy đơn hàng';
                            Alert.alert('Lỗi', errorMessage);
                        } finally {
                            setCancelling(false);
                        }
                    },
                },
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#FF9500';
            case 'confirmed': return '#34C759';
            case 'processing': return '#007AFF';
            case 'shipped': return '#5856D6';
            case 'delivered': return '#34C759';
            case 'cancelled': return '#FF3B30';
            default: return '#999';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Chờ xác nhận';
            case 'confirmed': return 'Đã xác nhận';
            case 'processing': return 'Đang xử lý';
            case 'shipped': return 'Đang giao';
            case 'delivered': return 'Đã giao';
            case 'cancelled': return 'Đã hủy';
            default: return status;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return 'time';
            case 'confirmed': return 'checkmark-circle';
            case 'processing': return 'sync';
            case 'shipped': return 'car';
            case 'delivered': return 'checkmark-done-circle';
            case 'cancelled': return 'close-circle';
            default: return 'help-circle';
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={styles.centered}>
                <Ionicons name="alert-circle-outline" size={80} color="#ccc" />
                <Text style={styles.emptyText}>Không tìm thấy đơn hàng</Text>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>Quay lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const canCancel = ['pending', 'confirmed'].includes(order.status);
    const statusColor = getStatusColor(order.status);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Status Header */}
            <View style={[styles.statusHeader, { backgroundColor: statusColor }]}>
                <Ionicons name={getStatusIcon(order.status) as any} size={48} color="#fff" />
                <Text style={styles.statusTitle}>{getStatusText(order.status)}</Text>
                <Text style={styles.orderIdText}>Mã đơn: #{order.id.slice(0, 8)}</Text>
                <Text style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </Text>
            </View>

            {/* Shipping Address */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="location" size={24} color="#007AFF" />
                    <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
                </View>
                <View style={styles.addressBox}>
                    <View style={styles.addressRow}>
                        <Ionicons name="person" size={18} color="#666" />
                        <Text style={styles.addressName}>{order.shippingAddress.fullName}</Text>
                    </View>
                    <View style={styles.addressRow}>
                        <Ionicons name="call" size={18} color="#666" />
                        <Text style={styles.addressPhone}>{order.shippingAddress.phone}</Text>
                    </View>
                    <View style={styles.addressRow}>
                        <Ionicons name="navigate" size={18} color="#666" />
                        <Text style={styles.addressText}>
                            {order.shippingAddress.addressLine}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.city}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Products */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="cube" size={24} color="#007AFF" />
                    <Text style={styles.sectionTitle}>Sản phẩm ({order.orderItems.length})</Text>
                </View>
                {order.orderItems.map((item) => (
                    <View key={item.id} style={styles.productCard}>
                        <Image
                            source={{ uri: item.product.images?.[0] || 'https://via.placeholder.com/80' }}
                            style={styles.productImage}
                        />
                        <View style={styles.productInfo}>
                            <Text style={styles.productName} numberOfLines={2}>
                                {item.product.name}
                            </Text>
                            <Text style={styles.productPrice}>
                                {Number(item.unitPrice).toLocaleString()} ₫
                            </Text>
                            <Text style={styles.productQuantity}>Số lượng: {item.quantity}</Text>
                        </View>
                        <View style={styles.productTotal}>
                            <Text style={styles.productTotalText}>
                                {Number(item.subtotal).toLocaleString()} ₫
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Payment Info */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="card" size={24} color="#007AFF" />
                    <Text style={styles.sectionTitle}>Thanh toán</Text>
                </View>
                <View style={styles.paymentBox}>
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Phương thức:</Text>
                        <Text style={styles.paymentValue}>
                            {order.paymentMethod === 'cod' ? 'COD - Ship COD' : 'Chuyển khoản'}
                        </Text>
                    </View>
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Trạng thái:</Text>
                        <Text style={[
                            styles.paymentValue,
                            { color: order.paymentStatus === 'completed' ? '#34C759' : '#FF9500' }
                        ]}>
                            {order.paymentStatus === 'completed' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Total */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="calculator" size={24} color="#007AFF" />
                    <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
                </View>
                <View style={styles.totalBox}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Tạm tính:</Text>
                        <Text style={styles.totalValue}>
                            {Number(order.totalAmount).toLocaleString()} ₫
                        </Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Phí vận chuyển:</Text>
                        <Text style={[styles.totalValue, { color: '#34C759' }]}>Miễn phí</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.grandTotalRow}>
                        <Text style={styles.grandTotalLabel}>Tổng cộng:</Text>
                        <Text style={styles.grandTotalValue}>
                            {Number(order.totalAmount).toLocaleString()} ₫
                        </Text>
                    </View>
                </View>
            </View>

            {/* Notes */}
            {order.notes && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="document-text" size={24} color="#007AFF" />
                        <Text style={styles.sectionTitle}>Ghi chú</Text>
                    </View>
                    <Text style={styles.notesText}>{order.notes}</Text>
                </View>
            )}

            {/* Cancel Button */}
            {canCancel && (
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.cancelButton, cancelling && styles.cancelButtonDisabled]}
                        onPress={handleCancelOrder}
                        disabled={cancelling}
                    >
                        {cancelling ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="close-circle" size={22} color="#fff" />
                                <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.bottomPadding} />
        </ScrollView>
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
        padding: 24,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 16,
        marginBottom: 24,
    },
    backButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    statusHeader: {
        padding: 32,
        alignItems: 'center',
        marginBottom: 16,
    },
    statusTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 12,
        marginBottom: 8,
    },
    orderIdText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 4,
    },
    orderDate: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
    },
    section: {
        backgroundColor: '#fff',
        marginBottom: 16,
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    addressBox: {
        backgroundColor: '#f9f9f9',
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    addressName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    addressPhone: {
        flex: 1,
        fontSize: 15,
        color: '#666',
    },
    addressText: {
        flex: 1,
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    productCard: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        marginBottom: 12,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#e0e0e0',
    },
    productInfo: {
        flex: 1,
        marginLeft: 12,
    },
    productName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 6,
    },
    productPrice: {
        fontSize: 14,
        color: '#007AFF',
        marginBottom: 4,
    },
    productQuantity: {
        fontSize: 13,
        color: '#666',
    },
    productTotal: {
        justifyContent: 'center',
        marginLeft: 8,
    },
    productTotalText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    paymentBox: {
        backgroundColor: '#f9f9f9',
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    paymentLabel: {
        fontSize: 15,
        color: '#666',
    },
    paymentValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    totalBox: {
        backgroundColor: '#f9f9f9',
        padding: 16,
        borderRadius: 12,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    totalLabel: {
        fontSize: 15,
        color: '#666',
    },
    totalValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 12,
    },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    grandTotalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    grandTotalValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    notesText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        backgroundColor: '#f9f9f9',
        padding: 16,
        borderRadius: 12,
    },
    actions: {
        padding: 20,
    },
    cancelButton: {
        flexDirection: 'row',
        backgroundColor: '#FF3B30',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
        shadowColor: '#FF3B30',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    cancelButtonDisabled: {
        opacity: 0.6,
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    bottomPadding: {
        height: 24,
    },
});
