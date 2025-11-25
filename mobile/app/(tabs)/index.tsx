import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { productService } from '../../services/product.service';
import { Product } from '../../types';

export default function HomeScreen() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const router = useRouter();

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await productService.getProducts({ page: 1, limit: 20 });
            setProducts(data.products);
        } catch (error) {
            console.error('Load products error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const data = await productService.getProducts({ search, page: 1, limit: 20 });
            setProducts(data.products);
        } catch (error) {
            console.error('Search error:', error);
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
                    {item.price.toLocaleString('vi-VN')} ₫
                </Text>
                {item.stockQuantity > 0 ? (
                    <Text style={styles.inStock}>Còn hàng</Text>
                ) : (
                    <Text style={styles.outOfStock}>Hết hàng</Text>
                )}
            </View>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={20} color="#999" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm sản phẩm..."
                        value={search}
                        onChangeText={setSearch}
                        onSubmitEditing={handleSearch}
                    />
                </View>
            </View>

            <FlatList
                data={products}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.productList}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={loadProducts} />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
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
    searchContainer: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 44,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
    },
    productList: {
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
        backgroundColor: '#f0f0f0',
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        color: '#1a1a1a',
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 4,
    },
    inStock: {
        fontSize: 12,
        color: '#34C759',
    },
    outOfStock: {
        fontSize: 12,
        color: '#FF3B30',
    },
    empty: {
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
});
