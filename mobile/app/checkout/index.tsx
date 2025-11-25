import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../stores/cartStore';
import { addressService, Address } from '../../services/address.service';
import { orderService } from '../../services/order.service';

export default function CheckoutScreen() {
    const router = useRouter();
    const { items, total, clearCart } = useCartStore();

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank_transfer'>('cod');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingAddresses, setLoadingAddresses] = useState(true);

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        try {
            setLoadingAddresses(true);
            const data = await addressService.getAddresses();
            setAddresses(data);

            // Auto-select default address
            const defaultAddr = data.find(a => a.isDefault);
            if (defaultAddr) {
                setSelectedAddress(defaultAddr);
            } else if (data.length > 0) {
                setSelectedAddress(data[0]);
            }
        } catch (error) {
            console.error('Load addresses error:', error);
            Alert.alert('Lỗi', 'Không thể tải địa chỉ giao hàng');
        } finally {
            setLoadingAddresses(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            Alert.alert('Lỗi', 'Vui lòng chọn địa chỉ giao hàng');
            return;
        }

        if (items.length === 0) {
            Alert.alert('Lỗi', 'Giỏ hàng trống');
            return;
        }

        try {
            setLoading(true);

            const order = await orderService.createOrder({
                shippingAddress: {
                    fullName: selectedAddress.fullName,
                    phone: selectedAddress.phone,
                    addressLine: selectedAddress.addressLine,
                    ward: selectedAddress.ward,
                    district: selectedAddress.district,
                    city: selectedAddress.city,
                },
                paymentMethod,
                notes,
                items: items.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                })),
            });

            // Clear cart after successful order
            clearCart();

            Alert.alert('Thành công', 'Đặt hàng thành công!', [
                {
                    text: 'OK',
                    onPress: () => router.replace(`/order/success/${order.id}`),
                },
            ]);
        } catch (error: any) {
            console.error('Place order error:', error);
            const errorMessage = error.response?.data?.error || 'Không thể đặt hàng';
            Alert.alert('Lỗi', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (loadingAddresses) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (addresses.length === 0) {
        return (
            <View style={styles.centered}>
                <Ionicons name="location-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>Chưa có địa chỉ giao hàng</Text>
                <TouchableOpacity
                    style={styles.addAddressButton}
                    onPress={() => router.push('/address/add')}
                >
                    <Text style={styles.addAddressButtonText}>Thêm địa chỉ</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Shipping Address */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="location" size={24} color="#007AFF" />
                    <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
                </View>

                {selectedAddress && (
                    <View style={styles.addressCard}>
                        <Text style={styles.addressName}>{selectedAddress.fullName}</Text>
                        <Text style={styles.addressPhone}>{selectedAddress.phone}</Text>
                        <Text style={styles.addressText}>
                            {selectedAddress.addressLine}, {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.city}
                        </Text>
                        <TouchableOpacity
                            style={styles.changeButton}
                            onPress={() => router.push('/address')}
                        >
                            <Text style={styles.changeButtonText}>Thay đổi</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Payment Method */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="card" size={24} color="#007AFF" />
                    <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
                </View>

                <TouchableOpacity
                    style={styles.paymentOption}
                    onPress={() => setPaymentMethod('cod')}
                >
                    <View style={styles.radio}>
                        {paymentMethod === 'cod' && <View style={styles.radioSelected} />}
                    </View>
                    <View style={styles.paymentInfo}>
                        <Text style={styles.paymentTitle}>COD - Ship COD</Text>
                        <Text style={styles.paymentDesc}>Thanh toán khi nhận hàng</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.paymentOption}
                    onPress={() => setPaymentMethod('bank_transfer')}
                >
                    <View style={styles.radio}>
                        {paymentMethod === 'bank_transfer' && <View style={styles.radioSelected} />}
                    </View>
                    <View style={styles.paymentInfo}>
                        <Text style={styles.paymentTitle}>Chuyển khoản ngân hàng</Text>
                        <Text style={styles.paymentDesc}>Chuyển khoản sau khi đặt hàng</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Order Summary */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="receipt" size={24} color="#007AFF" />
                    <Text style={styles.sectionTitle}>Đơn hàng ({items.length} sản phẩm)</Text>
                </View>

                {items.map((item) => (
                    <View key={item.id} style={styles.orderItem}>
                        <Text style={styles.itemName}>{item.product.name}</Text>
                        <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                        <Text style={styles.itemPrice}>
                            {(Number(item.product.price) * item.quantity).toLocaleString()} ₫
                        </Text>
                    </View>
                ))}

                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Tổng cộng:</Text>
                    <Text style={styles.totalAmount}>{total.toLocaleString()} ₫</Text>
                </View>
            </View>

            {/* Place Order Button */}
            <TouchableOpacity
                style={[styles.placeOrderButton, loading && styles.placeOrderButtonDisabled]}
                onPress={handlePlaceOrder}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.placeOrderButtonText}>Đặt hàng</Text>
                )}
            </TouchableOpacity>
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
    addAddressButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    addAddressButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    section: {
        backgroundColor: '#fff',
        marginBottom: 12,
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
    addressCard: {
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    addressName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    addressPhone: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    addressText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    changeButton: {
        marginTop: 12,
        alignSelf: 'flex-start',
    },
    changeButtonText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        marginBottom: 12,
    },
    radio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#007AFF',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioSelected: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#007AFF',
    },
    paymentInfo: {
        flex: 1,
    },
    paymentTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 2,
    },
    paymentDesc: {
        fontSize: 14,
        color: '#666',
    },
    orderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    itemName: {
        flex: 1,
        fontSize: 14,
        color: '#1a1a1a',
    },
    itemQuantity: {
        fontSize: 14,
        color: '#666',
        marginRight: 12,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 2,
        borderTopColor: '#007AFF',
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    totalAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    placeOrderButton: {
        backgroundColor: '#007AFF',
        margin: 16,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    placeOrderButtonDisabled: {
        opacity: 0.6,
    },
    placeOrderButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});
