import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { orderService, Order } from '../../../services/order.service';

export default function OrderSuccessScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

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
        } finally {
            setLoading(false);
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
                <Text>Không tìm thấy đơn hàng</Text>
            </View>
        );
    }

    const isBankTransfer = order.paymentMethod === 'bank_transfer';

    return (
        <ScrollView style={styles.container}>
            {/* Success Icon */}
            <View style={styles.successHeader}>
                <View style={styles.successIcon}>
                    <Ionicons name="checkmark-circle" size={80} color="#34C759" />
                </View>
                <Text style={styles.successTitle}>Đặt hàng thành công!</Text>
                <Text style={styles.orderNumber}>Mã đơn hàng: #{order.id.slice(0, 8)}</Text>
            </View>

            {/* Bank Transfer Info */}
            {isBankTransfer && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="card" size={24} color="#007AFF" />
                        <Text style={styles.sectionTitle}>Thông tin chuyển khoản</Text>
                    </View>

                    <View style={styles.bankInfo}>
                        <View style={styles.bankRow}>
                            <Text style={styles.bankLabel}>Ngân hàng:</Text>
                            <Text style={styles.bankValue}>Vietcombank</Text>
                        </View>
                        <View style={styles.bankRow}>
                            <Text style={styles.bankLabel}>Số tài khoản:</Text>
                            <Text style={styles.bankValue}>1234567890</Text>
                        </View>
                        <View style={styles.bankRow}>
                            <Text style={styles.bankLabel}>Chủ tài khoản:</Text>
                            <Text style={styles.bankValue}>NGUYEN VAN A</Text>
                        </View>
                        <View style={styles.bankRow}>
                            <Text style={styles.bankLabel}>Nội dung:</Text>
                            <Text style={[styles.bankValue, styles.bankValueHighlight]}>
                                ORDER {order.id.slice(0, 8)}
                            </Text>
                        </View>
                        <View style={styles.bankRow}>
                            <Text style={styles.bankLabel}>Số tiền:</Text>
                            <Text style={[styles.bankValue, styles.bankValueAmount]}>
                                {Number(order.totalAmount).toLocaleString()} ₫
                            </Text>
                        </View>
                    </View>

                    <View style={styles.noteBox}>
                        <Ionicons name="information-circle" size={20} color="#FF9500" />
                        <Text style={styles.noteText}>
                            Vui lòng chuyển khoản với nội dung chính xác để đơn hàng được xác nhận nhanh chóng
                        </Text>
                    </View>
                </View>
            )}

            {/* COD Info */}
            {!isBankTransfer && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="cash" size={24} color="#34C759" />
                        <Text style={styles.sectionTitle}>Thanh toán khi nhận hàng</Text>
                    </View>

                    <Text style={styles.codText}>
                        Bạn sẽ thanh toán {Number(order.totalAmount).toLocaleString()} ₫ khi nhận hàng
                    </Text>

                    <View style={styles.noteBox}>
                        <Ionicons name="information-circle" size={20} color="#007AFF" />
                        <Text style={styles.noteText}>
                            Đơn hàng sẽ được giao trong vòng 3-5 ngày làm việc
                        </Text>
                    </View>
                </View>
            )}

            {/* Order Info */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="receipt" size={24} color="#007AFF" />
                    <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Tổng tiền:</Text>
                    <Text style={styles.infoValue}>
                        {Number(order.totalAmount).toLocaleString()} ₫
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Trạng thái:</Text>
                    <Text style={styles.infoValue}>Chờ xác nhận</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Phương thức:</Text>
                    <Text style={styles.infoValue}>
                        {isBankTransfer ? 'Chuyển khoản' : 'COD'}
                    </Text>
                </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => router.push('/orders')}
                >
                    <Text style={styles.primaryButtonText}>Xem đơn hàng</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => router.push('/(tabs)')}
                >
                    <Text style={styles.secondaryButtonText}>Về trang chủ</Text>
                </TouchableOpacity>
            </View>
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
    },
    successHeader: {
        backgroundColor: '#fff',
        padding: 32,
        alignItems: 'center',
    },
    successIcon: {
        marginBottom: 16,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    orderNumber: {
        fontSize: 16,
        color: '#666',
    },
    section: {
        backgroundColor: '#fff',
        marginTop: 12,
        padding: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        marginLeft: 8,
    },
    bankInfo: {
        backgroundColor: '#f9f9f9',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    bankRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    bankLabel: {
        fontSize: 14,
        color: '#666',
    },
    bankValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    bankValueHighlight: {
        color: '#007AFF',
        fontFamily: 'monospace',
    },
    bankValueAmount: {
        color: '#34C759',
        fontSize: 16,
    },
    noteBox: {
        flexDirection: 'row',
        backgroundColor: '#FFF3CD',
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
        gap: 8,
    },
    noteText: {
        flex: 1,
        fontSize: 14,
        color: '#856404',
        lineHeight: 20,
    },
    codText: {
        fontSize: 16,
        color: '#1a1a1a',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    actions: {
        padding: 16,
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    secondaryButtonText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
