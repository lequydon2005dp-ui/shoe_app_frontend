import {
    SafeAreaView, View, Text, StyleSheet, Image, TextInput,
    ActivityIndicator, FlatList, TouchableOpacity, Alert
} from 'react-native';
import React, { useState, useEffect, useMemo, useContext, useCallback } from 'react';
import { Stack, Link, router } from 'expo-router';
import { ThemeContext } from '../../context/ThemeContext';
import { CartContext } from '../../context/CartContext';
import { FavoritesContext } from '../../context/FavoritesContext';
import ProductService from '../../services/ProductService';
import CategoryService from '../../services/CategoryService';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// --- Hằng số & Cấu hình ---
const BASE_URL = 'http://192.168.100.128/LaravelApp/public/storage/';
const PAGE_SIZE = 4;

const formatCurrency = (value) => {
    if (value === null || value === undefined) return '';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(value);
};

// --- Component Card Sản phẩm ---
const ProductGridCard = ({ item, styles, onAddToCart, onToggleFavorite, isFavorite }) => (
    <View style={styles.gridCard}>
        <View style={styles.popularCardHeader}>
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={() => onToggleFavorite(item)}>
                <FontAwesome
                    name={isFavorite ? "heart" : "heart-o"}
                    size={18}
                    color={isFavorite ? styles.danger.color : styles.subtleText.color}
                />
            </TouchableOpacity>
        </View>
        <Link href={`/product/${item.id}`} asChild>
            <TouchableOpacity activeOpacity={0.8} style={styles.gridCardContent}>
                <Image
                    source={{ uri: item.image_url ? BASE_URL + item.image_url : `https://placehold.co/150x150/f0f0f0/333?text=Ảnh` }}
                    style={styles.gridImage}
                    resizeMode="contain"
                />
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
            </TouchableOpacity>
        </Link>
        <View style={styles.popularCardFooter}>
            <Text style={styles.productPrice}>{formatCurrency(item.price_discount || item.price)}</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => onAddToCart(item)}>
                <FontAwesome name="plus" size={14} color="#FFF" />
            </TouchableOpacity>
        </View>
    </View>
);

// --- Component chính ---
export default function AllProductsScreen() {
    const [allProducts, setAllProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    const { colors } = useContext(ThemeContext);
    const { addToCart } = useContext(CartContext);
    const { toggleFavorite, isFavorite } = useContext(FavoritesContext);
    const styles = dynamicStyles(colors);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, catRes] = await Promise.all([
                    ProductService.getList(),
                    CategoryService.getList(),
                ]);
                setAllProducts(Array.isArray(prodRes) ? prodRes : (prodRes?.data || []));
                setCategories(Array.isArray(catRes) ? catRes : (catRes?.data || []));
            } catch (error) {
                console.error('Lỗi khi gọi API:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredProducts = useMemo(() => {
        return allProducts.filter(p => {
            const matchSearch = p.name.toLowerCase().includes(searchText.toLowerCase());
            const matchCategory = activeCategory === 'all' ? true : String(p.category_id) === String(activeCategory);
            return matchSearch && matchCategory;
        });
    }, [allProducts, searchText, activeCategory]);

    const displayedProducts = useMemo(() => {
        return filteredProducts.slice(0, visibleCount);
    }, [filteredProducts, visibleCount]);

    const gridData = useMemo(() => {
        const data = [...displayedProducts];
        if (data.length > 0 && data.length % 2 === 1) {
            data.push({ id: `placeholder-${data.length}`, empty: true });
        }
        return data;
    }, [displayedProducts]);

    useEffect(() => {
        setVisibleCount(PAGE_SIZE);
    }, [filteredProducts]);

    const handleAddToCart = useCallback((item) => {
        addToCart(item);
        Alert.alert('Thành công', `Đã thêm ${item.name} vào giỏ hàng.`);
    }, [addToCart]);

    const handleLoadMore = useCallback(() => {
        setVisibleCount(prevCount => prevCount + PAGE_SIZE);
    }, []);

    const ListFooter = useMemo(() => {
        if (displayedProducts.length < filteredProducts.length) {
            return (
                <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore}>
                    <Text style={styles.loadMoreButtonText}>Xem thêm</Text>
                </TouchableOpacity>
            );
        }
        return null;
    }, [displayedProducts.length, filteredProducts.length, handleLoadMore, styles]);


    if (loading) {
        return (
            <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <FontAwesome name="chevron-left" size={18} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tất cả sản phẩm</Text>
            </View>

            <FlatList
                data={gridData}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
                ListHeaderComponent={
                    <View style={styles.container}>
                        <View style={styles.searchContainer}>
                            <View style={styles.searchInputWrapper}>
                                <FontAwesome name="search" size={18} color={colors.subtleText} style={{ marginRight: 8 }} />
                                <TextInput
                                    placeholder="Tìm kiếm giày"
                                    placeholderTextColor={colors.subtleText}
                                    style={styles.searchInput}
                                    value={searchText}
                                    onChangeText={setSearchText}
                                />
                            </View>
                        </View>

                        <FlatList
                            horizontal
                            data={[{ id: 'all', name: 'All' }, ...categories]}
                            keyExtractor={(item) => item.id.toString()}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ marginVertical: 10 }}
                            renderItem={({ item }) => {
                                const isActive = activeCategory === item.id.toString();
                                return (
                                    <TouchableOpacity
                                        style={[styles.brandButton, isActive && styles.activeBrandButton]}
                                        onPress={() => setActiveCategory(item.id.toString())}
                                    >
                                        <View style={styles.brandLogoContainer}>
                                            {item.id === 'all' ? (
                                                <FontAwesome name="th" size={20} color={isActive ? '#FFF' : colors.text} />
                                            ) : (
                                                <Image source={{ uri: BASE_URL + item.image_url }} style={styles.brandLogo} resizeMode="contain" />
                                            )}
                                        </View>
                                        {isActive && <Text style={styles.brandName}>{item.name}</Text>}
                                    </TouchableOpacity>
                                )
                            }}
                        />
                    </View>
                }
                renderItem={({ item }) => {
                    if (item.empty) {
                        return <View style={[styles.gridCard, styles.emptyGridCard]} />;
                    }
                    return (
                        <ProductGridCard
                            item={item}
                            styles={styles}
                            onAddToCart={handleAddToCart}
                            onToggleFavorite={toggleFavorite}
                            isFavorite={isFavorite(item.id)}
                        />
                    );
                }}
                ListEmptyComponent={
                    <Text style={styles.noProductsText}>Không tìm thấy sản phẩm nào.</Text>
                }
                ListFooterComponent={ListFooter}
            />
        </SafeAreaView>
    );
}

// --- Styles ---
const dynamicStyles = (colors) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background, paddingTop: 20, },
    container: { paddingHorizontal: 24, paddingTop: 10 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: colors.background,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.card,
        justifyContent: 'center',
        marginLeft: 10,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        justifyContent: 'center',
        flex: 1,
        textAlign: 'center',
    },
    searchContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 10, gap: 12 },
    searchInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 14, paddingHorizontal: 16, height: 50 },
    searchInput: { flex: 1, color: colors.text, fontSize: 16 },
    brandButton: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10,
        borderRadius: 12, marginRight: 10, backgroundColor: colors.card
    },
    activeBrandButton: { backgroundColor: colors.primary },
    brandLogoContainer: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
    brandLogo: { width: 24, height: 24 },
    brandName: { marginLeft: 8, color: '#FFF', fontWeight: '600' },
    gridCard: {
        flex: 1, backgroundColor: colors.card, borderRadius: 16,
        padding: 12, margin: 8, minHeight: 220,
    },
    emptyGridCard: {
        backgroundColor: 'transparent',
        shadowColor: 'transparent',
        elevation: 0,
        borderColor: 'transparent'
    },
    gridCardContent: { alignItems: 'center' },
    popularCardHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    gridImage: { width: '100%', height: 100, marginVertical: 8 },
    productName: { color: colors.text, fontWeight: '600', marginTop: 4, textAlign: 'left', width: '100%' },
    popularCardFooter: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 'auto', paddingTop: 8,
    },
    productPrice: { color: colors.text, fontWeight: 'bold', fontSize: 16 },
    addButton: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
    subtleText: { color: colors.subtleText },
    danger: { color: colors.danger || 'red' },
    noProductsText: { textAlign: 'center', color: colors.subtleText, marginTop: 40, fontSize: 16 },
    loadMoreButton: {
        backgroundColor: colors.primary, padding: 16, borderRadius: 12,
        alignItems: 'center', marginHorizontal: 8, marginTop: 16,
    },
    loadMoreButtonText: {
        color: colors.buttonText || '#FFF', fontSize: 16, fontWeight: 'bold',
    },
});

