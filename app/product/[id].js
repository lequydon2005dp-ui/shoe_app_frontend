import { useLocalSearchParams, router, Link } from 'expo-router';
// Thêm useState ở đây
import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
    SafeAreaView, View, Text, StyleSheet, Image, ScrollView,
    ActivityIndicator, TouchableOpacity, Dimensions, Alert, FlatList,
} from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
import { CartContext } from '../../context/CartContext';
import ProductService from '../../services/ProductService';
import { FontAwesome } from '@expo/vector-icons';

// ... (Các hằng số, formatCurrency, RelatedProductCard giữ nguyên) ...
// --- Hằng số & Cấu hình ---
const BASE_URL = 'http://192.168.100.128/LaravelApp/public/storage/';

const { width } = Dimensions.get('window');
const SPACING = 24;
// Tính toán kích thước cho lưới sản phẩm liên quan
const RELATED_ITEM_SIZE = (width - SPACING * 3) / 2;


const formatCurrency = (value) => {
    if (typeof value !== 'number') return '';
    // Cập nhật định dạng tiền tệ sang VND
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(value);
};

// --- Dữ liệu Mock cho Giao diện ---
const SIZES = ['38', '39', '40', '41', '42', '43'];

// --- Component con cho Sản phẩm liên quan ---
const RelatedProductCard = ({ item, styles }) => (
    <Link href={`/product/${item.id}`} asChild>
        <TouchableOpacity style={styles.relatedCard}>
            <Image
                source={{ uri: item.image_url ? BASE_URL + item.image_url : `https://placehold.co/150x150/f0f0f0/333?text=Ảnh` }}
                style={styles.relatedImage}
            />
            <View style={styles.relatedTextContainer}>
                <Text style={styles.relatedName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.relatedPrice}>{formatCurrency(item.price_discount || item.price)}</Text>
            </View>
        </TouchableOpacity>
    </Link>
);


// --- Component chính ---
export default function ProductDetails() {
    const { id } = useLocalSearchParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSize, setSelectedSize] = useState('40'); // Kích cỡ mặc định

    // 1. THÊM STATE CHO MÔ TẢ
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    // Lấy trạng thái từ Context
    const { colors } = useContext(ThemeContext);
    const { addToCart } = useContext(CartContext);
    const styles = dynamicStyles(colors);

    // ... (fetchDetail, useEffect, handleAddToCart giữ nguyên) ...
    const fetchDetail = useCallback(async () => {
        setLoading(true);
        setProduct(null);
        setError(null);
        setIsDescriptionExpanded(false); // Reset trạng thái mô tả khi load sản phẩm mới
        try {
            const response = await ProductService.getDetail(id);
            setProduct(response);
        } catch (err) {
            setError(err.response?.status === 404 ? "Sản phẩm không tồn tại." : "Không thể kết nối máy chủ.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        setProduct(null);
        setLoading(true);
        if (id) {
            fetchDetail();
        }
    }, [id]);

    const handleAddToCart = () => {
        if (product) {
            addToCart({ ...product, selectedSize });
            Alert.alert('Thành công', `${product.name} (size ${selectedSize}) đã được thêm vào giỏ hàng.`);
        }
    };

    const galleryImages = product ? [
        product.image_url,
        ...(product.related?.slice(0, 2).map(p => p.image_url) || [])
    ] : [];
    const [mainImage, setMainImage] = useState(null);

    useEffect(() => {
        if (product) {
            setMainImage(product.image_url);
        }
    }, [product]);

    // 2. HÀM TOGGLE MÔ TẢ
    const toggleDescription = () => {
        setIsDescriptionExpanded(!isDescriptionExpanded);
    };

    // ... (Phần render loading, error giữ nguyên) ...
    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: SPACING }]}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.button} onPress={() => router.back()}>
                    <Text style={styles.buttonText}>Quay lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!product) return null;


    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header tùy chỉnh */}
            {/* ... (Giữ nguyên header) ... */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <FontAwesome name="chevron-left" size={18} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{product.category?.name || "Men's Shoes"}</Text>
                <TouchableOpacity onPress={() => router.push('(tabs)/Cart')} style={styles.headerButton}>
                    <FontAwesome name="shopping-bag" size={20} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }} // Thêm khoảng đệm ở dưới
            >
                {/* Vùng ảnh sản phẩm */}
                {/* ... (Giữ nguyên vùng ảnh) ... */}
                <View style={styles.imageContainer}>
                    <View style={styles.imageBackgroundCircle} />
                    <Image
                        source={{ uri: mainImage ? BASE_URL + mainImage : 'https://placehold.co/400x400/f0f0f0/333?text=Ảnh' }}
                        style={styles.mainImage}
                        resizeMode="contain"
                    />
                    <View style={styles.rotateIconContainer}>
                        <FontAwesome name="rotate-right" size={16} color={colors.primary} />
                    </View>
                </View>

                {/* Vùng thông tin chi tiết */}
                <View style={styles.detailsContainer}>
                    <Text style={styles.bestSeller}>BEST SELLER</Text>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>

                    {/* 3. CẬP NHẬT PHẦN MÔ TẢ */}
                    <Text
                        style={styles.descriptionText}
                        // Hiển thị 3 dòng nếu chưa mở rộng
                        numberOfLines={isDescriptionExpanded ? undefined : 3}
                    >
                        {product.content || 'Air Jordan is an American brand of basketball shoes athletic, casual, and style clothing produced by Nike.'}
                    </Text>
                    {/* Nút Xem thêm/Thu gọn (chỉ hiển thị nếu text dài) */}
                    {/* Bạn có thể thêm điều kiện kiểm tra độ dài text nếu muốn */}
                    <TouchableOpacity onPress={toggleDescription} style={styles.readMoreButton}>
                        <Text style={styles.readMoreText}>
                            {isDescriptionExpanded ? 'Thu gọn' : 'Xem thêm'}
                        </Text>
                    </TouchableOpacity>


                    {/* Gallery */}
                    {/* ... (Giữ nguyên Gallery) ... */}
                    <Text style={styles.sectionTitle}>Gallery</Text>
                    <View style={styles.galleryContainer}>
                        {galleryImages.map((img, index) => (
                            <TouchableOpacity key={index} onPress={() => setMainImage(img)}>
                                <Image
                                    source={{ uri: BASE_URL + img }}
                                    style={[styles.galleryImage, mainImage === img && styles.galleryImageActive]}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Size */}
                    {/* ... (Giữ nguyên Size) ... */}
                    <Text style={styles.sectionTitle}>Size</Text>
                    <View style={styles.sizeContainer}>
                        {SIZES.map(size => {
                            const isSelected = selectedSize === size;
                            return (
                                <TouchableOpacity
                                    key={size}
                                    style={[styles.sizeCircle, isSelected && styles.sizeCircleActive]}
                                    onPress={() => setSelectedSize(size)}
                                >
                                    <Text style={[styles.sizeText, isSelected && styles.sizeTextActive]}>{size}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>

                    {/* --- SẢN PHẨM LIÊN QUAN --- */}
                    {/* ... (Giữ nguyên Sản phẩm liên quan) ... */}
                    {product.related && product.related.length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>Related Products</Text>
                            <FlatList
                                data={product.related}
                                renderItem={({ item }) => <RelatedProductCard item={item} styles={styles} />}
                                keyExtractor={(item) => item.id.toString()}
                                numColumns={2}
                                scrollEnabled={false}
                                columnWrapperStyle={{ justifyContent: 'space-between' }}
                            />
                        </>
                    )}
                </View>
            </ScrollView>

            {/* Footer */}
            {/* ... (Giữ nguyên Footer) ... */}
            <View style={styles.footer}>
                <View>
                    <Text style={styles.footerPriceLabel}>Price</Text>
                    <Text style={styles.footerPriceValue}>{formatCurrency(product.price_discount || product.price)}</Text>
                </View>
                <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                    <Text style={styles.addToCartButtonText}>Add To Cart</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// Stylesheet động
const dynamicStyles = (colors) => StyleSheet.create({
    // ... (Các styles khác giữ nguyên) ...
    safeArea: { flex: 1, backgroundColor: colors.background, paddingTop: 20 },
    container: { flex: 1, backgroundColor: colors.background },
    errorText: { color: colors.danger, fontSize: 16, textAlign: 'center', marginBottom: 20 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING,
        paddingTop: 10,
        backgroundColor: colors.background,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.card,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
    imageContainer: {
        height: width * 0.8,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        marginVertical: 20,
    },
    imageBackgroundCircle: {
        position: 'absolute',
        width: width * 0.7,
        height: width * 0.7,
        borderRadius: (width * 0.7) / 2,
        backgroundColor: colors.card,
    },
    mainImage: { width: '80%', height: '80%' },
    rotateIconContainer: {
        position: 'absolute',
        bottom: 40,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.card,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
    },
    detailsContainer: {
        backgroundColor: colors.card,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: SPACING,
        paddingTop: 30,
    },
    bestSeller: { color: colors.primary, fontWeight: 'bold', fontSize: 12, marginBottom: 8 },
    productName: { color: colors.text, fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
    productPrice: { color: colors.text, fontSize: 20, fontWeight: 'bold', marginBottom: 16 }, // Sửa lại style giá nếu cần
    descriptionText: { color: colors.subtleText, fontSize: 15, lineHeight: 22 },

    // 4. THÊM STYLE CHO NÚT "XEM THÊM"
    readMoreButton: {
        alignSelf: 'flex-start', // Căn nút sang trái
        marginTop: 8, // Khoảng cách với text mô tả
        paddingVertical: 4, // Thêm padding để dễ bấm
    },
    readMoreText: {
        color: colors.primary, // Màu của link
        fontWeight: '600',
        fontSize: 15,
    },

    sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '600', marginTop: 24, marginBottom: 12 },
    galleryContainer: { flexDirection: 'row', gap: 12 },
    galleryImage: {
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: colors.background,
    },
    galleryImageActive: { borderWidth: 2, borderColor: colors.primary },
    sizeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    sizeCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    sizeCircleActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    sizeText: { color: colors.text, fontSize: 16, fontWeight: '500' },
    sizeTextActive: { color: colors.buttonText },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING,
        paddingVertical: 12,
        backgroundColor: colors.card,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingBottom: 30,
    },
    footerPriceLabel: { color: colors.subtleText, fontSize: 14 },
    footerPriceValue: { color: colors.text, fontSize: 22, fontWeight: 'bold' },
    addToCartButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 14,
    },
    addToCartButtonText: { color: colors.buttonText, fontSize: 16, fontWeight: 'bold' },
    button: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8 },
    buttonText: { color: colors.buttonText, fontSize: 16, fontWeight: 'bold' },

    // --- STYLES CHO SẢN PHẨM LIÊN QUAN ---
    relatedCard: {
        width: RELATED_ITEM_SIZE,
        backgroundColor: colors.background,
        borderRadius: 16,
        marginBottom: SPACING,
        padding: 10,
    },
    relatedImage: {
        width: '100%',
        height: RELATED_ITEM_SIZE - 60,
        borderRadius: 12,
        backgroundColor: colors.placeholder || '#eee', // Sửa placeholder
    },
    relatedTextContainer: {
        marginTop: 8,
    },
    relatedName: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
        marginBottom: 4,
    },
    relatedPrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.primary,
    },
});