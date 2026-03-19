import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Image
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/Authentication';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native';

// Lấy IP từ file khác (nếu có) hoặc định nghĩa ở đây
const API_BASE_URL = 'http://192.168.100.128:8000'; // Đảm bảo đây là IP server Laravel
const BASE_URL = 'http://192.168.100.128';
const PLACEHOLDER_IMAGE = 'https://placehold.co/100x100/f0f0f0/333?text=No+Image';

const formatCurrency = (value) => {
    // 1. Chuyển đổi giá trị (có thể là string "150000" hoặc null) sang số
    const numericValue = parseFloat(value);

    // 2. Kiểm tra nếu kết quả không phải là một số hợp lệ (ví dụ: null, undefined, "abc")
    if (isNaN(numericValue)) {
        // Trả về 0 VNĐ. Bạn có thể trả về 0 nếu không muốn có ký hiệu tiền tệ
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(0);
    }

    // 3. Nếu là số hợp lệ, tiến hành định dạng
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numericValue);
};

const formatDate = (dateString) => {
    try {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    } catch (e) {
        return 'N/A';
    }
};

const getStatusStyle = (status, colors) => {
    switch (status) {
        case 'pending':
            return {
                text: 'Chờ xử lý',
                color: colors.warning || '#ffe100ff',
                backgroundColor: (colors.warning || '#FFA500') + '1A',
            };
        case 'processing':
            return {
                text: 'Đã xác thực',
                color: colors.processing || '#0080ffff',
                backgroundColor: (colors.processing || '#28A745') + '1A',
            };
        case 'shipping':
            return {
                text: 'Đang giao hàng',
                color: colors.shipping || '#8800ffff',
                backgroundColor: (colors.shipping || '#28A745') + '1A',
            };
        case 'delivered':
            return {
                text: 'Đã giao hàng',
                color: colors.delivered || '#28A745',
                backgroundColor: (colors.delivered || '#28A745') + '1A',
            };
        case 'completed':
            return {
                text: 'Hoàn Tất',
                color: colors.completed || '#ff00d4ff',
                backgroundColor: (colors.completed || '#ff00f2ff') + '1A',
            };
        case 'cancelled':
            return {
                text: 'Đã hủy',
                color: colors.danger || '#DC3545',
                backgroundColor: (colors.danger || '#DC3545') + '1A',
            };
        default:
            return {
                text: status,
                color: colors.subtleText,
                backgroundColor: colors.background,
            };
    }
};

// --- Component Card Đơn Hàng ---
const OrderCard = ({ item, colors, styles, onPress }) => {
    const statusStyle = getStatusStyle(item.status, colors);
    const firstItemImage = item.items?.[0]?.product?.image_url;

    // Xử lý URL ảnh (nếu server không trả về full URL)
    const getImageUrl = (imagePath) => {
        if (!imagePath) return PLACEHOLDER_IMAGE;
        if (imagePath.startsWith('http')) return imagePath;
        // Cần khớp với cấu hình 'storage' của bạn, ví dụ:
        return `${BASE_URL}/LaravelApp/public/storage/${imagePath.replace('public/', '')}`;
    };

    const imageUrl = getImageUrl(firstItemImage);

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            {/* Header Card */}
            <View style={styles.cardHeader}>
                <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
                <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
            </View>

            {/* Body Card */}
            <View style={styles.cardBody}>
                <Image source={{ uri: imageUrl }} style={styles.productImage} />
                <View style={styles.itemDetails}>
                    <Text style={styles.itemCount}>
                        {item.items_count || item.items?.length || 0} sản phẩm
                    </Text>
                    <Text style={styles.itemPreview} numberOfLines={1}>
                        {item.items?.[0]?.product?.name || 'Chi tiết đơn hàng'}
                        {item.items?.length > 1 && ` và ${item.items.length - 1} sản phẩm khác...`}
                    </Text>
                </View>
            </View>

            {/* Footer Card */}
            <View style={styles.cardFooter}>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                    <Text style={[styles.statusText, { color: statusStyle.color }]}>
                        {statusStyle.text}
                    </Text>
                </View>
                <Text style={styles.totalPrice}>{formatCurrency(item.total_amount)}</Text>
            </View>
        </TouchableOpacity>
    );
};


// --- Màn hình chính ---
export default function OrdersScreen() {
    const router = useRouter();
    const { colors } = useContext(ThemeContext);
    const { userInfo } = useContext(AuthContext);
    const styles = dynamicStyles(colors);

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!userInfo || !userInfo.token) {
                setError('Bạn cần đăng nhập để xem đơn hàng.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/api/orders`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${userInfo.token}`,
                    },
                });

                const text = await response.text(); // lấy toàn bộ phản hồi thô

                if (!response.ok) {
                    throw new Error(`Lỗi HTTP ${response.status}`);
                }

                const data = JSON.parse(text);
                setOrders(data.orders || []);
            } catch (err) {
                console.error("🔥 Lỗi fetchOrders:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [userInfo]); // Chạy lại nếu userInfo thay đổi

    // --- Component Nội dung ---
    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            );
        }

        if (orders.length === 0) {
            return (
                <View style={styles.centerContainer}>
                    <Ionicons name="receipt-outline" size={60} color={colors.subtleText} />
                    <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào.</Text>
                </View>
            );
        }

        return (
            <FlatList
                data={orders}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <OrderCard
                        item={item}
                        colors={colors}
                        styles={styles}
                        onPress={() => router.push(`/orders/${item.id}`)} // 👉 chuyển tới chi tiết đơn hàng
                    />
                )}
                contentContainerStyle={styles.listContainer}
            />
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header tùy chỉnh */}
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Nội dung */}
            {renderContent()}
        </SafeAreaView>
    );
}

// --- Styles ---
const dynamicStyles = (colors) =>
    StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: colors.background, paddingTop: 30 },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.card,
        },
        headerButton: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
        },
        centerContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
        },
        errorText: {
            fontSize: 16,
            color: colors.danger || '#DC3545',
            textAlign: 'center',
        },
        emptyText: {
            fontSize: 16,
            color: colors.subtleText,
            marginTop: 16,
        },
        listContainer: {
            padding: 16,
        },
        // Card Styles
        card: {
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowOffset: { width: 0, height: 3 },
            shadowRadius: 4,
            elevation: 2,
        },
        cardHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            paddingBottom: 12,
            marginBottom: 12,
        },
        orderId: {
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.text,
        },
        orderDate: {
            fontSize: 14,
            color: colors.subtleText,
        },
        cardBody: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
        },
        productImage: {
            width: 60,
            height: 60,
            borderRadius: 8,
            backgroundColor: colors.background,
            marginRight: 12,
        },
        itemDetails: {
            flex: 1,
        },
        itemCount: {
            fontSize: 14,
            color: colors.subtleText,
            marginBottom: 4,
        },
        itemPreview: {
            fontSize: 15,
            fontWeight: '500',
            color: colors.text,
        },
        cardFooter: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 8,
        },
        statusBadge: {
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 20,
        },
        statusText: {
            fontSize: 12,
            fontWeight: 'bold',
        },
        totalPrice: {
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.primary,
        },
    });
