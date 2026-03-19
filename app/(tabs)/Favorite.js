import React, { useContext, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
} from "react-native";
import { ThemeContext } from "../../context/ThemeContext";
import { FavoritesContext } from "../../context/FavoritesContext";
import { AuthContext } from "../../context/Authentication";
import { useRouter, Link } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";

// --- Cấu hình (Đảm bảo giống file context) ---
const BASE_URL = 'http://192.168.100.128/LaravelApp/public/storage/';
const PLACEHOLDER_IMAGE = "https://placehold.co/120x120/f0f0f0/333?text=No+Image";

// --- Hàm định dạng tiền ---
const formatCurrency = (value) => {
    if (value === null || value === undefined) return '';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(value);
};

// --- Component Chính ---
export default function FavoriteScreen() {
    const { colors } = useContext(ThemeContext);
    const {
        favoriteItems,
        loading,
        error,
        refetchFavorites,
        toggleFavorite,
    } = useContext(FavoritesContext);

    // Code của bạn đã lấy isAuthenticated đúng
    const { isAuthenticated } = useContext(AuthContext);

    const router = useRouter();
    const styles = dynamicStyles(colors);

    // --- Xử lý lỗi ---
    useEffect(() => {
        if (error) {
            Alert.alert("Lỗi", error, [
                { text: "Thử lại", onPress: refetchFavorites },
                { text: "Hủy", style: "cancel" },
            ]);
        }
    }, [error]);

    // --- Trạng thái 1: Yêu cầu đăng nhập ---
    if (!isAuthenticated && favoriteItems.length === 0) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.emptyContainer}>
                    <FontAwesome name="lock" size={80} color={colors.subtleText} />
                    <Text style={styles.title}>Yêu cầu đăng nhập</Text>
                    <Text style={styles.subtitle}>
                        Đăng nhập để xem và lưu sản phẩm yêu thích.
                    </Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.push("/Auth/login")}
                    >
                        <Text style={styles.buttonText}>Đăng nhập ngay</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // --- Trạng thái 2: Đang tải ---
    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Đang tải...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // --- Trạng thái 3: Danh sách rỗng ---
    if (favoriteItems.length === 0) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.emptyContainer}>
                    <FontAwesome name="heart-o" size={80} color={colors.subtleText} />
                    <Text style={styles.title}>Chưa có sản phẩm yêu thích</Text>
                    <Text style={styles.subtitle}>
                        Nhấn vào biểu tượng trái tim để thêm.
                    </Text>
                    <Link href="/(tabs)/" asChild>
                        <TouchableOpacity style={styles.button}>
                            <Text style={styles.buttonText}>Khám phá ngay</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </SafeAreaView>
        );
    }

    // --- Trạng thái 4: Hiển thị danh sách ---
    return (
        <SafeAreaView style={styles.safeArea}>
            <Text style={styles.pageTitle}>
                {/* Dòng này đã đúng. Khi "isAuthenticated" là true, nó sẽ chỉ hiển thị "Sản phẩm yêu thích" */}
                Sản phẩm yêu thích {isAuthenticated ? "" : "(Tạm thời)"}
            </Text>

            <FlatList
                data={favoriteItems}
                numColumns={2}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Link href={`/product/${item.id}`} asChild>
                            <TouchableOpacity activeOpacity={0.8}>
                                <Image
                                    source={{
                                        uri: item.image_url
                                            ? `${BASE_URL}${item.image_url}`
                                            : PLACEHOLDER_IMAGE,
                                    }}
                                    style={styles.image}
                                    resizeMode="cover"
                                />
                                <Text style={styles.name} numberOfLines={2}>
                                    {item.name}
                                </Text>
                                <Text style={styles.price}>{formatCurrency(item.price_discount || item.price)}</Text>
                            </TouchableOpacity>
                        </Link>

                        <TouchableOpacity
                            style={styles.heartButton}
                            onPress={() => toggleFavorite(item)} // Gọi hàm toggle để xóa
                            activeOpacity={0.7}
                        >
                            <FontAwesome name="heart" size={18} color="#FF4C4C" />
                        </TouchableOpacity>
                    </View>
                )}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.grid}
                showsVerticalScrollIndicator={false}
                columnWrapperStyle={{ justifyContent: "space-between" }}
            />
        </SafeAreaView>
    );
}

// --- Styles ---
const dynamicStyles = (colors) =>
    StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: colors.background,
            paddingTop: 35,
        },
        pageTitle: {
            fontSize: 24,
            fontWeight: "bold",
            color: colors.text,
            textAlign: "center",
            paddingHorizontal: 16,
            marginBottom: 16,
        },
        grid: {
            paddingHorizontal: 16,
            paddingBottom: 100,
        },
        card: {
            backgroundColor: colors.card,
            borderRadius: 12,
            width: "48%",
            marginBottom: 16,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
        },
        image: {
            width: "100%",
            height: 120,
            backgroundColor: "#f0f0f0",
        },
        name: {
            fontSize: 14,
            fontWeight: "600",
            color: colors.text,
            marginTop: 8,
            marginHorizontal: 10,
            minHeight: 34, // Đảm bảo 2 dòng
        },
        price: {
            fontSize: 15,
            fontWeight: "bold",
            color: colors.primary,
            marginHorizontal: 10,
            marginBottom: 12,
            marginTop: 4,
        },
        heartButton: {
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: "center",
            alignItems: "center",
        },
        tag: {
            position: "absolute",
            top: 8,
            left: 8,
            backgroundColor: "rgba(0,0,0,0.5)",
            color: "#fff",
            fontSize: 10,
            fontWeight: "bold",
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
        },
        // --- Các trạng thái (Loading, Empty) ---
        loadingContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.background,
        },
        loadingText: {
            marginTop: 10,
            color: colors.subtleText,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
            backgroundColor: colors.background,
        },
        title: {
            fontSize: 22,
            fontWeight: "bold",
            color: colors.text,
            marginTop: 20,
            textAlign: "center",
        },
        subtitle: {
            fontSize: 16,
            color: colors.subtleText,
            textAlign: "center",
            marginTop: 8,
            lineHeight: 22,
        },
        button: {
            backgroundColor: colors.primary,
            paddingVertical: 14,
            paddingHorizontal: 32,
            borderRadius: 12,
            marginTop: 24,
        },
        buttonText: {
            color: colors.buttonText || "#fff",
            fontSize: 16,
            fontWeight: "bold",
        },
    });