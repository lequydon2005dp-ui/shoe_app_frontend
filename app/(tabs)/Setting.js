import React, { useContext, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    ScrollView,
    Alert,
    SafeAreaView,
    ActivityIndicator // THÊM ĐỂ HIỂN THỊ LOADING
} from "react-native";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/Authentication";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Setting() {
    const { theme, toggleTheme, colors } = useContext(ThemeContext);
    const { logout, userInfo, isLoading } = useContext(AuthContext); // LẤY isLoading TỪ CONTEXT
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const router = useRouter();
    const styles = dynamicStyles(colors);

    const handleLogout = () => {
        Alert.alert(
            "Đăng xuất",
            "Bạn có chắc muốn đăng xuất?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Đăng xuất",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await logout(); // logout() tự set isLoading = true
                            console.log("Đăng xuất thành công!");
                        } catch (error) {
                            console.error("Lỗi đăng xuất:", error);
                        }
                    },
                },
            ]
        );
    };

    const handleLogin = () => {
        router.push('/Auth/login');
    };

    const handleProfilePress = () => {
        router.push('/account/profile');
    };
    const handleSupportPress = () => {
        router.push('/support/Support');
    }
    const handleOrdersPress = () => {
        router.push('/account/orders'); // Chuyển đến màn hình Đơn hàng
    };
    const handleChangePasswordPress = () => {
        router.push('/account/change-password');
    };
    const handlePolicyPress = () => {
        router.push('/support/policy'); 
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView style={styles.container}>
                <Text style={styles.header}>Cài đặt</Text>

                {/* LOADING KHI ĐĂNG XUẤT */}
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={styles.loadingText}>Đang đăng xuất...</Text>
                    </View>
                )}

                {/* Thông tin tài khoản */}
                {userInfo && (
                    <TouchableOpacity style={styles.item} onPress={handleProfilePress}>
                        <Ionicons name="person-outline" size={22} color={colors.primary} />
                        <Text style={styles.itemText}>Thông tin tài khoản</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.subtleText} />
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.item} onPress={handleChangePasswordPress}>
                    <Ionicons name="lock-closed-outline" size={22} color={colors.primary} />
                    <Text style={styles.itemText}>Đổi mật khẩu</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.subtleText} />
                </TouchableOpacity>
                {/* ✅ Xem đơn hàng */}
                <TouchableOpacity style={styles.item} onPress={handleOrdersPress}>
                    <Ionicons name="receipt-outline" size={22} color={colors.primary} />
                    <Text style={styles.itemText}>Đơn hàng của tôi</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.subtleText} />
                </TouchableOpacity>

                {/* Thông báo */}
                <View style={styles.item}>
                    <Ionicons name="notifications-outline" size={22} color={colors.primary} />
                    <Text style={[styles.itemText, { flex: 1 }]}>Bật thông báo</Text>
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={setNotificationsEnabled}
                        trackColor={{ false: "#ccc", true: colors.primary }}
                        thumbColor="#fff"
                    />
                </View>

                {/* Giao diện */}
                <View style={styles.item}>
                    <Ionicons name="moon-outline" size={22} color={colors.primary} />
                    <Text style={[styles.itemText, { flex: 1 }]}>
                        Giao diện: {theme === "light" ? "Sáng" : "Tối"}
                    </Text>
                    <TouchableOpacity onPress={toggleTheme} style={styles.switchBtn}>
                        <Ionicons name="swap-horizontal" size={22} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Hỗ trợ */}
                <TouchableOpacity style={styles.item} onPress={handleSupportPress}>
                    <Ionicons name="help-circle-outline" size={22} color={colors.primary} />
                    <Text style={styles.itemText}>Trung tâm hỗ trợ</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.subtleText} />
                </TouchableOpacity>

                {/* Chính sách */}
                <TouchableOpacity style={styles.item} onPress={handlePolicyPress}>
                    <Ionicons name="document-text-outline" size={22} color={colors.primary} />
                    <Text style={styles.itemText}>Chính sách & Điều khoản</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.subtleText} />
                </TouchableOpacity>

                {/* NÚT ĐĂNG NHẬP / ĐĂNG XUẤT */}
                {userInfo ? (
                    <TouchableOpacity style={[styles.item, { marginTop: 20 }]} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={22} color={colors.danger || "#FF4C4C"} />
                        <Text style={[styles.itemText, { color: colors.danger || "#FF4C4C" }]}>Đăng xuất</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={[styles.item, { marginTop: 20 }]} onPress={handleLogin}>
                        <Ionicons name="log-in-outline" size={22} color={colors.primary} />
                        <Text style={[styles.itemText, { color: colors.primary }]}>Đăng nhập</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const dynamicStyles = (colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            paddingHorizontal: 16,
            paddingTop: 20,
        },
        header: {
            fontSize: 28,
            fontWeight: "bold",
            color: colors.text,
            marginBottom: 40,
            textAlign: "center",
        },
        item: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.card,
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderRadius: 12,
            marginBottom: 12,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowOffset: { width: 0, height: 3 },
            shadowRadius: 4,
            elevation: 2,
        },
        itemText: {
            flex: 1,
            marginLeft: 12,
            fontSize: 16,
            color: colors.text,
            fontWeight: "500",
        },
        switchBtn: {
            padding: 8,
        },
        // LOADING OVERLAY
        loadingOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
        },
        loadingText: {
            marginTop: 12,
            color: '#fff',
            fontSize: 16,
            fontWeight: '600',
        },
    });