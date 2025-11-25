import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { productService } from '../../services/product.service';
import { Product } from '../../types';

export default function CategoryProductsScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [categoryName, setCategoryName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProducts();
    }, [id]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await productService.getProducts({ categoryId: id as string });
            setProducts(data.products);

            // Get category name from first product or fetch separately
            if (data.products.length > 0) {
                setCategoryName(data.products[0].category?.name || 'Danh mục');
            }
        } catch (error) {
            console.error('Load products error:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderProduct = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => router.push(`/product/${item.id}`)}
        >
            <Image
                source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }}
                style={styles.productImage}
            />
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                    {item.name}
                </Text>
                <Text style={styles.productPrice}>
                    {Number(item.price).toLocaleString()} ₫
                </Text>
                {item.stockQuantity > 0 ? (
                    <View style={styles.stockBadge}>
                        <Text style={styles.stockText}>Còn hàng</Text>
                    </View>
                ) : (
                    <View style={[styles.stockBadge, styles.outOfStock]}>
                        <Text style={[styles.stockText, styles.outOfStockText]}>Hết hàng</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
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
            <FlatList
                data={products}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="cube-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>Chưa có sản phẩm nào</Text>
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
        padding: 8,
    },
    productCard: {
        flex: 1,
        margin: 8,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    productImage: {
        width: '100%',
        height: 150,
        backgroundColor: '#e0e0e0',
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 8,
        minHeight: 40,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 8,
    },
    stockBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        backgroundColor: '#E8F5E9',
    },
    stockText: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '600',
    },
    outOfStock: {
        backgroundColor: '#FFEBEE',
    },
    outOfStockText: {
        color: '#F44336',
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 64,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 16,
    },
});
