import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { productService } from '../../services/product.service';
import { useCartStore } from '../../stores/cartStore';
import { Product } from '../../types';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const { addItem } = useCartStore();

    useEffect(() => {
        loadProduct();
    }, [id]);

    const loadProduct = async () => {
        try {
            const data = await productService.getProductById(id as string);
            setProduct(data);
        } catch (error) {
            console.error('Load product error:', error);
            Alert.alert('Lỗi', 'Không thể tải thông tin sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (!product) {
            console.log('❌ No product');
            return;
        }

        console.log('🛒 Adding to cart:', product.name, 'quantity:', quantity);

        const cartItem = {
            id: `temp-${Date.now()}`,
            productId: product.id,
            userId: '',
            quantity,
            product: {
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                images: product.images,
                stockQuantity: product.stockQuantity,
                isActive: product.isActive,
                categoryId: product.categoryId,
                specifications: product.specifications,
            },
        };

        console.log('📦 Calling addItem...');
        addItem(cartItem);
        console.log('✅ addItem called');

        Alert.alert('Thành công', 'Đã thêm vào giỏ hàng', [
            { text: 'Tiếp tục mua', style: 'cancel' },
            { text: 'Xem giỏ hàng', onPress: () => router.push('/(tabs)/cart') },
        ]);
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (!product) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Không tìm thấy sản phẩm</Text>
            </View>
        );
    }

    const images = product.images && product.images.length > 0
        ? product.images
        : ['https://via.placeholder.com/400'];

    return (
        <View style={styles.container}>
            <ScrollView>
                {/* Image Carousel */}
                <View style={styles.carouselContainer}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(event) => {
                            const index = Math.round(
                                event.nativeEvent.contentOffset.x / width
                            );
                            setCurrentImageIndex(index);
                        }}
                    >
                        {images.map((image, index) => (
                            <Image
                                key={index}
                                source={{ uri: image }}
                                style={styles.productImage}
                                resizeMode="cover"
                            />
                        ))}
                    </ScrollView>

                    {/* Image Indicators */}
                    {images.length > 1 && (
                        <View style={styles.indicators}>
                            {images.map((_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.indicator,
                                        index === currentImageIndex && styles.activeIndicator,
                                    ]}
                                />
                            ))}
                        </View>
                    )}
                </View>

                {/* Product Info */}
                <View style={styles.infoContainer}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>
                        {Number(product.price).toLocaleString('vi-VN')} ₫
                    </Text>

                    {product.stockQuantity > 0 ? (
                        <View style={styles.stockBadge}>
                            <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                            <Text style={styles.inStock}>
                                Còn {product.stockQuantity} sản phẩm
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.stockBadge}>
                            <Ionicons name="close-circle" size={16} color="#FF3B30" />
                            <Text style={styles.outOfStock}>Hết hàng</Text>
                        </View>
                    )}

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
                        <Text style={styles.description}>
                            {product.description || 'Chưa có mô tả'}
                        </Text>
                    </View>

                    {/* Quantity Selector */}
                    {product.stockQuantity > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Số lượng</Text>
                            <View style={styles.quantitySelector}>
                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                                >
                                    <Ionicons name="remove" size={20} color="#007AFF" />
                                </TouchableOpacity>
                                <Text style={styles.quantityText}>{quantity}</Text>
                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() =>
                                        setQuantity(Math.min(product.stockQuantity, quantity + 1))
                                    }
                                >
                                    <Ionicons name="add" size={20} color="#007AFF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Add to Cart Button */}
            {product.stockQuantity > 0 && (
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.addToCartButton}
                        onPress={handleAddToCart}
                    >
                        <Ionicons name="cart" size={20} color="#fff" />
                        <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#999',
    },
    carouselContainer: {
        position: 'relative',
    },
    productImage: {
        width,
        height: width,
        backgroundColor: '#f0f0f0',
    },
    indicators: {
        position: 'absolute',
        bottom: 16,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    activeIndicator: {
        backgroundColor: '#fff',
    },
    infoContainer: {
        padding: 16,
    },
    productName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    productPrice: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 12,
    },
    stockBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 24,
    },
    inStock: {
        fontSize: 14,
        color: '#34C759',
        fontWeight: '500',
    },
    outOfStock: {
        fontSize: 14,
        color: '#FF3B30',
        fontWeight: '500',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
    },
    quantitySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    quantityButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1a1a1a',
        minWidth: 40,
        textAlign: 'center',
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#fff',
    },
    addToCartButton: {
        flexDirection: 'row',
        backgroundColor: '#007AFF',
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    addToCartText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
