import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { productService } from '../../services/product.service';
import { Category } from '../../types';
import { Ionicons } from '@expo/vector-icons';

// Category icon mapping
const categoryIcons: { [key: string]: string } = {
    'phụ tùng': 'construct',
    'dầu nhớt': 'water',
    'lốp xe': 'disc',
    'phụ kiện': 'sparkles',
    'đồ chơi': 'game-controller',
    'mũ bảo hiểm': 'shield-checkmark',
    default: 'cube',
};

// Gradient colors for categories
const gradients = [
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140'],
    ['#30cfd0', '#330867'],
    ['#a8edea', '#fed6e3'],
    ['#ff9a9e', '#fecfef'],
];

export default function CategoriesScreen() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await productService.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Load categories error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryIcon = (name: string): any => {
        const lowerName = name.toLowerCase();
        for (const key in categoryIcons) {
            if (lowerName.includes(key)) {
                return categoryIcons[key];
            }
        }
        return categoryIcons.default;
    };

    const handleCategoryPress = (category: Category) => {
        router.push(`/category/${category.id}`);
    };

    const renderCategory = ({ item, index }: { item: Category; index: number }) => {
        const gradient = gradients[index % gradients.length];
        const icon = getCategoryIcon(item.name);

        return (
            <TouchableOpacity
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(item)}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientCard}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons name={icon as any} size={40} color="#fff" />
                    </View>
                    <Text style={styles.categoryName}>{item.name}</Text>
                    <View style={styles.arrowContainer}>
                        <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.8)" />
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        );
    };

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
                <Text style={styles.headerTitle}>Danh mục sản phẩm</Text>
                <Text style={styles.headerSubtitle}>
                    Khám phá {categories.length} danh mục
                </Text>
            </View>

            <FlatList
                data={categories}
                renderItem={renderCategory}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="grid-outline" size={80} color="#ccc" />
                        <Text style={styles.emptyText}>Chưa có danh mục nào</Text>
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
    header: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    list: {
        padding: 12,
    },
    categoryCard: {
        flex: 1,
        margin: 8,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    gradientCard: {
        padding: 20,
        minHeight: 160,
        justifyContent: 'space-between',
    },
    iconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    arrowContainer: {
        alignSelf: 'flex-end',
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
