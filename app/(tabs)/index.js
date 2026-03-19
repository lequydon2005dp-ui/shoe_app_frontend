import {
    SafeAreaView, View, Text, StyleSheet, Image, TextInput,
    ActivityIndicator, FlatList, TouchableOpacity, ScrollView, Alert, Modal, TouchableWithoutFeedback, Keyboard, Linking
} from 'react-native';
import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Link, router } from 'expo-router';
import { ThemeContext } from '../../context/ThemeContext';
import { CartContext } from '../../context/CartContext';
import { FavoritesContext } from '../../context/FavoritesContext';
import ProductService from '../../services/ProductService';
import CategoryService from '../../services/CategoryService';
import BannerService from '../../services/BannerService';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// --- Hằng số ---
const BASE_URL_STORAGE = 'http://192.168.100.128/LaravelApp/public/storage/';
const PLACEHOLDER_IMAGE = 'https://placehold.co/150x150/f0f0f0/333?text=No+Image';

const formatCurrency = (value) => {
    if (value === null || value === undefined) return '';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(value);
};

const PRICE_RANGES = [
    { id: '', label: 'Mọi mức giá' },
    { id: '1', label: '< 1.000.000đ' },
    { id: '2', label: '1 - 5 triệu' },
    { id: '3', label: '> 5 triệu' },
];

// --- Xử lý ảnh an toàn ---
const getImageUri = (imageUrl) => {
    if (!imageUrl) return PLACEHOLDER_IMAGE;
    if (typeof imageUrl !== 'string') return PLACEHOLDER_IMAGE;

    // Nếu là full URL → dùng luôn
    if (imageUrl.startsWith('http')) return imageUrl;

    // Nếu là path → thêm storage
    const cleanPath = imageUrl.trim().replace(/^\/+/, '');
    return `${BASE_URL_STORAGE}${cleanPath}`;
};

// --- Component: Sản phẩm phổ biến ---
const PopularProductCard = ({ item, styles, onAddToCart, onToggleFavorite, isFavorite }) => {
    const imageUri = getImageUri(item.image_url);

    return (
        <View style={styles.popularCard}>
            <View style={styles.popularCardHeader}>
                <Text style={styles.bestSeller}>BEST SELLER</Text>
                <TouchableOpacity onPress={() => onToggleFavorite(item)}>
                    <FontAwesome
                        name={isFavorite ? "heart" : "heart-o"}
                        size={18}
                        color={isFavorite ? styles.danger.color : styles.subtleText.color}
                    />
                </TouchableOpacity>
            </View>
            <Link href={`/product/${item.id}`} asChild>
                <TouchableOpacity activeOpacity={0.8}>
                    <Image source={{ uri: imageUri }} style={styles.popularImage} />
                    <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
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
};

// --- Component: Sản phẩm mới ---
const NewArrivalCard = ({ item, styles, onAddToCart }) => {
    const imageUri = getImageUri(item.image_url);

    return (
        <Link href={`/product/${item.id}`} asChild>
            <TouchableOpacity style={styles.arrivalCard} activeOpacity={0.8}>
                <View style={styles.newArrivalInfo}>
                    <Text style={styles.bestChoice}>BEST CHOICE</Text>
                    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.productPrice}>{formatCurrency(item.price_discount || item.price)}</Text>
                </View>
                <Image source={{ uri: imageUri }} style={styles.arrivalImage} />
            </TouchableOpacity>
        </Link>
    );
};

// --- Component: Banner Carousel ---
const BannerCarousel = ({ banners, styles }) => {
    if (!banners || banners.length === 0) return null;

    return (
        <View style={styles.bannerContainer}>
            <FlatList
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                data={banners}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                    const imageUri = getImageUri(item.image_url);
                    return (
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => {
                                if (item.link) {
                                    Alert.alert('Banner', `Mở link: ${item.link}`, [
                                        { text: 'Hủy' },
                                        { text: 'Mở', onPress: () => Linking.openURL(item.link).catch(() => {}) }
                                    ]);
                                }
                            }}
                            style={styles.bannerItem}
                        >
                            <Image
                                source={{ uri: imageUri }}
                                style={styles.bannerImage}
                                resizeMode="cover"
                            />
                            {item.title && (
                                <View style={styles.bannerOverlay}>
                                    <Text style={styles.bannerTitle}>{item.title}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                }}
            />
            <View style={styles.bannerDots}>
                {banners.map((_, index) => (
                    <View key={index} style={styles.bannerDot} />
                ))}
            </View>
        </View>
    );
};

// --- Component: Modal Lọc ---
const FilterModal = ({ visible, onClose, onApply, categories, initialFilters, styles }) => {
    const [tempCategory, setTempCategory] = useState(initialFilters.category);
    const [tempPrice, setTempPrice] = useState(initialFilters.price);

    useEffect(() => {
        if (visible) {
            setTempCategory(initialFilters.category);
            setTempPrice(initialFilters.price);
        }
    }, [visible, initialFilters]);

    const handleApply = () => onApply(tempCategory, tempPrice);
    const handleReset = () => {
        setTempCategory('all');
        setTempPrice('');
        onApply('all', '');
    };

    return (
        <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
                <TouchableOpacity style={styles.modalContainer} activeOpacity={1}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Filter Options</Text>
                        <TouchableOpacity onPress={onClose}>
                            <FontAwesome name="close" size={24} color={styles.subtleText.color} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.filterTitle}>Category</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {[{ id: 'all', name: 'All' }, ...categories].map(cat => {
                            const isSelected = tempCategory === cat.id.toString();
                            return (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[styles.modalChip, isSelected && styles.modalChipActive]}
                                    onPress={() => setTempCategory(cat.id.toString())}
                                >
                                    <Text style={[styles.modalChipText, isSelected && styles.modalChipTextActive]}>
                                        {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <Text style={styles.filterTitle}>Price Range</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {PRICE_RANGES.map(range => {
                            const isSelected = tempPrice === range.id;
                            return (
                                <TouchableOpacity
                                    key={range.id}
                                    style={[styles.modalChip, isSelected && styles.modalChipActive]}
                                    onPress={() => setTempPrice(range.id)}
                                >
                                    <Text style={[styles.modalChipText, isSelected && styles.modalChipTextActive]}>
                                        {range.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={[styles.modalButton, styles.resetButton]} onPress={handleReset}>
                            <Text style={[styles.modalButtonText, styles.resetButtonText]}>Reset</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, styles.applyButton]} onPress={handleApply}>
                            <Text style={styles.modalButtonText}>Apply</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

// --- Component: Gợi ý tìm kiếm ---
const SearchSuggestions = ({ suggestions, styles, onSelect, onAddToCart }) => {
    if (suggestions.length === 0) return null;

    return (
        <View style={styles.suggestionsContainer}>
            {suggestions.map(item => {
                const imageUri = getImageUri(item.image_url);
                return (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.suggestionItem}
                        onPress={() => onSelect(item)}
                    >
                        <Image source={{ uri: imageUri }} style={styles.suggestionImage} />
                        <View style={styles.suggestionInfo}>
                            <Text style={styles.suggestionName} numberOfLines={2}>{item.name}</Text>
                            <Text style={styles.suggestionPrice}>
                                {formatCurrency(item.price_discount || item.price)}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.suggestionAddButton}
                            onPress={(e) => {
                                e.stopPropagation();
                                onAddToCart(item);
                            }}
                        >
                            <FontAwesome name="plus" size={14} color="#FFF" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

// --- Component chính ---
export default function Index() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeCategory, setActiveCategory] = useState('all');
    const [priceRange, setPriceRange] = useState('');
    const [searchText, setSearchText] = useState('');
    const [isFilterVisible, setFilterVisible] = useState(false);

    const { colors } = useContext(ThemeContext);
    const { addToCart } = useContext(CartContext);
    const { toggleFavorite, isFavorite } = useContext(FavoritesContext);
    const styles = dynamicStyles(colors);

    // --- Fetch dữ liệu ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // console.log('Bắt đầu fetch data...');
                const [prodRes, catRes, bannerRes] = await Promise.all([
                    ProductService.getList().catch(() => []),
                    CategoryService.getList().catch(() => []),
                    BannerService.getList(5).catch(() => [])
                ]);

                setProducts(Array.isArray(prodRes) ? prodRes : []);
                setCategories(Array.isArray(catRes) ? catRes : []);
                setBanners(Array.isArray(bannerRes) ? bannerRes : []);

                // console.log('Data loaded:', { products: products.length, categories: categories.length, banners: banners.length });
            } catch (error) {
                console.error('Lỗi fetch:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- Lọc sản phẩm ---
    const filteredProducts = useMemo(() => {
        if (!Array.isArray(products)) return [];
        return products.filter(p => {
            const price = p.price_discount || p.price;
            const matchSearch = p.name.toLowerCase().includes(searchText.toLowerCase());
            const matchCategory = activeCategory === 'all' ? true : String(p.category_id) === String(activeCategory);
            let matchPrice = true;
            if (priceRange === '1') matchPrice = price < 1000000;
            if (priceRange === '2') matchPrice = price >= 1000000 && price < 5000000;
            if (priceRange === '3') matchPrice = price >= 5000000;
            return matchSearch && matchCategory && matchPrice;
        });
    }, [products, activeCategory, priceRange, searchText]);

    const popularProducts = useMemo(() => filteredProducts.slice(0, 6), [filteredProducts]);
    const newArrivals = useMemo(() => filteredProducts.slice(4, 8), [filteredProducts]);

    // --- Xử lý ---
    const handleAddToCart = (item) => {
        addToCart(item);
        Alert.alert('Thành công', `Đã thêm ${item.name} vào giỏ hàng.`);
    };

    const handleApplyFilters = (category, price) => {
        setActiveCategory(category);
        setPriceRange(price);
        setFilterVisible(false);
    };

    if (loading) {
        return (
            <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: 10, color: colors.text }}>Đang tải...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <FilterModal
                visible={isFilterVisible}
                onClose={() => setFilterVisible(false)}
                onApply={handleApplyFilters}
                categories={categories}
                initialFilters={{ category: activeCategory, price: priceRange }}
                styles={styles}
            />

            <TouchableWithoutFeedback onPress={() => { setSearchText(''); Keyboard.dismiss(); }}>
                <View style={{ flex: 1 }}>
                    <ScrollView
                        style={styles.container}
                        showsVertiCallingScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        onScrollBeginDrag={() => searchText && setSearchText('')}
                    >
                        {/* === HEADER === */}
                        <View style={styles.header}>
                            <TouchableOpacity style={styles.headerButton}>
                                <FontAwesome name="th-large" size={20} color={colors.text} />
                            </TouchableOpacity>
                            <View style={styles.locationContainer}>
                                <Text style={styles.locationLabel}>Store Location</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <FontAwesome name="map-marker" size={16} color={colors.primary} />
                                    <Text style={styles.locationText}>Mondolibug, Sylhet</Text>
                                </View>
                            </View>
                            <Link href="notification/Notification" asChild>
                                <TouchableOpacity style={[styles.headerButton, { position: 'relative' }]}>
                                    <FontAwesome name="bell-o" size={20} color={colors.text} />
                                    <View style={styles.notificationDot} />
                                </TouchableOpacity>
                            </Link>
                        </View>

                        {/* === THANH TÌM KIẾM === */}
                        <View style={styles.searchContainer}>
                            <View style={styles.searchInputWrapper}>
                                <FontAwesome name="search" size={18} color={colors.subtleText} style={{ marginRight: 8 }} />
                                <TextInput
                                    placeholder="Looking for shoes"
                                    placeholderTextColor={colors.subtleText}
                                    style={styles.searchInput}
                                    value={searchText}
                                    onChangeText={setSearchText}
                                    autoCapitalize="none"
                                />
                            </View>
                            <TouchableOpacity style={styles.filterButton} onPress={() => setFilterVisible(true)}>
                                <FontAwesome name="sliders" size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        {/* === BANNER CAROUSEL === */}
                        <BannerCarousel banners={banners} styles={styles} />

                        {/* === GỢI Ý TÌM KIẾM === */}
                        {searchText.trim().length > 0 && (
                            <SearchSuggestions
                                suggestions={filteredProducts.slice(0, 5)}
                                styles={styles}
                                onSelect={(item) => {
                                    setSearchText('');
                                    Keyboard.dismiss();
                                    router.push(`/product/${item.id}`);
                                }}
                                onAddToCart={handleAddToCart}
                            />
                        )}

                        {/* === DANH MỤC === */}
                        <FlatList
                            horizontal
                            data={[{ id: 'all', name: 'All' }, ...categories]}
                            keyExtractor={(item) => item.id.toString()}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ marginVertical: 10 }}
                            renderItem={({ item }) => {
                                const isActive = activeCategory === item.id.toString();
                                const logoUri = item.id === 'all' ? null : getImageUri(item.image_url);
                                return (
                                    <TouchableOpacity
                                        style={[styles.brandButton, isActive && styles.activeBrandButton]}
                                        onPress={() => {
                                            setActiveCategory(item.id.toString());
                                            setPriceRange('');
                                        }}
                                    >
                                        <View style={styles.brandLogoContainer}>
                                            {item.id === 'all' ? (
                                                <FontAwesome name="th" size={20} color={isActive ? '#FFF' : colors.text} />
                                            ) : (
                                                <Image source={{ uri: logoUri }} style={styles.brandLogo} resizeMode="contain" />
                                            )}
                                        </View>
                                        {isActive && <Text style={styles.brandName}>{item.name}</Text>}
                                    </TouchableOpacity>
                                );
                            }}
                        />

                        {/* === SẢN PHẨM === */}
                        {filteredProducts.length > 0 ? (
                            <>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Popular Shoes</Text>
                                    <Link href="/Product" asChild><Text style={styles.seeAll}>See all</Text></Link>
                                </View>
                                <FlatList
                                    horizontal
                                    data={popularProducts}
                                    keyExtractor={(item) => item.id.toString()}
                                    showsHorizontalScrollIndicator={false}
                                    renderItem={({ item }) => (
                                        <PopularProductCard
                                            item={item}
                                            styles={styles}
                                            onAddToCart={handleAddToCart}
                                            onToggleFavorite={toggleFavorite}
                                            isFavorite={isFavorite(item.id)}
                                        />
                                    )}
                                />

                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>New Arrivals</Text>
                                    <Link href="/Product" asChild><Text style={styles.seeAll}>See all</Text></Link>
                                </View>
                                {newArrivals.map(item => (
                                    <NewArrivalCard key={item.id} item={item} styles={styles} onAddToCart={handleAddToCart} />
                                ))}
                            </>
                        ) : (
                            <Text style={styles.noProductsText}>No products found.</Text>
                        )}
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}

// --- Styles ---
const dynamicStyles = (colors) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background, paddingTop: 20 },
    container: { flex: 1, paddingHorizontal: 24 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    headerButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center' },
    locationContainer: { alignItems: 'center' },
    locationLabel: { color: colors.subtleText, fontSize: 12, marginBottom: 4 },
    locationText: { marginLeft: 8, color: colors.text, fontWeight: '600' },
    notificationDot: { position: 'absolute', right: 2, top: 0, width: 8, height: 8, borderRadius: 4, backgroundColor: 'red' },
    searchContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 },
    searchInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 14, paddingHorizontal: 16, height: 50 },
    searchInput: { flex: 1, color: colors.text, fontSize: 16 },
    filterButton: { width: 50, height: 50, borderRadius: 14, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },

    // Banner
    bannerContainer: { marginVertical: 16 },
    bannerItem: { width: 360, height: 140, marginRight: 12, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.card },
    bannerImage: { width: '100%', height: '100%' },
    bannerOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 12, backgroundColor: 'rgba(0,0,0,0.3)' },
    bannerTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    bannerDots: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
    bannerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary + '60', marginHorizontal: 4 },

    // Danh mục
    brandButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginRight: 10 },
    activeBrandButton: { backgroundColor: colors.primary },
    brandLogoContainer: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
    brandLogo: { width: 42, height: 42 },
    brandName: { color: '#FFF', fontWeight: 'bold', marginLeft: 8 },

    // Section
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
    seeAll: { color: colors.primary, fontWeight: '500' },

    // Popular
    popularCard: { width: 175, height: 220, backgroundColor: colors.card, borderRadius: 16, padding: 12, marginRight: 10, marginBottom: 10 },
    popularCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    bestSeller: { fontSize: 10, color: colors.primary, fontWeight: 'bold' },
    popularImage: { width: 120, height: 120, borderRadius: 12, resizeMode: 'cover' },
    productName: { color: colors.text, fontWeight: '600', marginTop: 4 },
    popularCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    productPrice: { color: colors.text, fontWeight: 'bold', fontSize: 16 },
    addButton: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },

    // New Arrival
    arrivalCard: { height: 120, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 16, padding: 12, marginBottom: 16 },
    newArrivalInfo: { width: '60%' },
    arrivalImage: { width: 120, height: 120, marginTop: 20 },
    bestChoice: { fontSize: 10, color: colors.primary, fontWeight: 'bold', marginBottom: 6 },

    // Gợi ý tìm kiếm
    suggestionsContainer: { position: 'absolute', top: 110, left: 24, right: 24, backgroundColor: colors.card, borderRadius: 16, padding: 12, elevation: 8, zIndex: 1000, maxHeight: 400 },
    suggestionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border || '#eee' },
    suggestionImage: { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
    suggestionInfo: { flex: 1 },
    suggestionName: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 4 },
    suggestionPrice: { fontSize: 13, fontWeight: 'bold', color: colors.primary },
    suggestionAddButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },

    // Modal
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContainer: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
    filterTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginTop: 16, marginBottom: 12 },
    modalChip: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: colors.background, borderRadius: 20, marginRight: 10, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
    modalChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    modalChipText: { color: colors.text, fontWeight: '500' },
    modalChipTextActive: { color: '#FFF' },
    modalFooter: { flexDirection: 'row', marginTop: 30, gap: 12 },
    modalButton: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
    modalButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
    resetButton: { backgroundColor: colors.card, borderWidth: 1 },
    resetButtonText: { color: colors.primary },
    applyButton: { backgroundColor: colors.primary },

    // Khác
    subtleText: { color: colors.subtleText },
    danger: { color: colors.danger || 'red' },
    noProductsText: { textAlign: 'center', color: colors.subtleText, marginTop: 40, fontSize: 16 },
});