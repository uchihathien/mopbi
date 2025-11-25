import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { orderService, Order } from '../../services/order.service';

export default function OrdersScreen() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async (refresh = false) => {
        try {
            if (refresh) {
                setRefreshing(true);
                setPage(1);
            } else {
                setLoading(true);
            }

            const data = await orderService.getOrders(refresh ? 1 : page, 10);

            if (refresh) {
                setOrders(data.orders);
            } else {
                setOrders([...orders, ...data.orders]);
            }

            setHasMore(data.pagination.page < data.pagination.totalPages);
        } catch (error) {
            console.error('Load orders error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        loadOrders(true);
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

    const renderOrder = ({ item }: { item: Order }) => (
        <TouchableOpacity
            style={styles.orderCard}
            onPress={() => router.push(`/orders/${item.id}`)}
        >
            <View style={styles.orderHeader}>
                <Text style={styles.orderId}>#{item.id.slice(0, 8)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                </View>
            </View>

            <Text style={styles.orderDate}>
                {new Date(item.createdAt).toLocaleDateString('vi-VN')}
            </Text>

            <View style={styles.orderItems}>
                {item.orderItems.slice(0, 2).map((orderItem, index) => (
                    <Text key={index} style={styles.itemText}>
                        • {orderItem.product.name} x{orderItem.quantity}
                    </Text>
                ))}
                {item.orderItems.length > 2 && (
                    <Text style={styles.moreItems}>
                        +{item.orderItems.length - 2} sản phẩm khác
                    </Text>
                )}
            </View>

            <View style={styles.orderFooter}>
                <View>
                    <Text style={styles.paymentMethod}>
                        {item.paymentMethod === 'cod' ? 'COD' : 'Chuyển khoản'}
                    </Text>
                </View>
                <Text style={styles.orderTotal}>
                    {Number(item.totalAmount).toLocaleString()} ₫
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (loading && orders.length === 0) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={orders}
                renderItem={renderOrder}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="receipt-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
                    </View>
                }
            />
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
    list: {
        padding: 16,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderId: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '600',
    },
    orderDate: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    orderItems: {
        marginBottom: 12,
    },
    itemText: {
        fontSize: 14,
        color: '#1a1a1a',
        marginBottom: 4,
    },
    moreItems: {
        fontSize: 14,
        color: '#007AFF',
        fontStyle: 'italic',
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    paymentMethod: {
        fontSize: 14,
        color: '#666',
    },
    orderTotal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    empty: {
        alignItems: 'center',
        paddingVertical: 64,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 16,
    },
});
