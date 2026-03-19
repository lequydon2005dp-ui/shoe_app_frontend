import { createContext, useContext, useState, useEffect } from "react";
import { AuthContext } from "./Authentication";
import axios from "axios";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// --- Cấu hình ---
const BASE_URL = 'http://192.168.100.128:8000/api';
const STORAGE_KEY = "offline_favorites";

// --- Tạo Context ---
export const FavoritesContext = createContext();

// --- Tạo Provider ---
export const FavoritesProvider = ({ children }) => {
    const { userInfo, isAuthenticated } = useContext(AuthContext);
    const [favoriteItems, setFavoriteItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- Hàm lưu trữ Offline (AsyncStorage) ---
    const saveOffline = async (items) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch (e) {
            console.error("Lỗi lưu offline favorites:", e);
        }
    };

    // --- Hàm tải Offline (AsyncStorage) ---
    const loadOffline = async () => {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Lỗi tải offline favorites:", e);
            return [];
        }
    };

    // --- HÀM TẢI YÊU THÍCH (Quan trọng: Đã bao gồm logic đồng bộ) ---
    const fetchFavorites = async () => {
        setLoading(true);
        setError(null);

        if (isAuthenticated) {
            // --- ĐÃ ĐĂNG NHẬP: Đồng bộ & Tải từ Server ---
            try {
                // 1. Tải danh sách offline
                const offlineItems = await loadOffline();

                // 2. Nếu có offline, gửi lên server để đồng bộ
                if (offlineItems.length > 0) {
                    const productIds = offlineItems.map((p) => p.id);

                    // ❗ YÊU CẦU API MỚI: /api/favorites/sync
                    await axios.post(
                        `${BASE_URL}/favorites/sync`,
                        { product_ids: productIds },
                        { headers: { Authorization: `Bearer ${userInfo.token}` } }
                    );

                    // 3. Xóa offline sau khi đồng bộ thành công
                    await AsyncStorage.removeItem(STORAGE_KEY);
                }

                // 4. Tải danh sách MỚI NHẤT từ server (đã bao gồm list cũ + list vừa sync)
                const res = await axios.get(`${BASE_URL}/favorites`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                });

                const serverItems = res.data.favorites || [];
                setFavoriteItems(serverItems);

            } catch (err) {
                console.error("Lỗi sync/fetch favorites:", err.response ? err.response.data : err.message);
                setError("Không thể tải danh sách yêu thích.");
            } finally {
                setLoading(false);
            }
        } else {
            // --- CHƯA ĐĂNG NHẬP: Tải từ Offline ---
            const offlineItems = await loadOffline();
            setFavoriteItems(offlineItems);
            setLoading(false);
        }
    };

    // --- Hàm Thêm/Xóa yêu thích ---
    const toggleFavorite = async (product) => {
        if (!product || !product.id) {
            console.error("Sản phẩm không hợp lệ:", product);
            return;
        }

        if (isAuthenticated) {
            // --- ĐÃ ĐĂNG NHẬP: Gọi API ---
            try {
                const res = await axios.post(
                    `${BASE_URL}/favorites/toggle`,
                    { product_id: product.id },
                    { headers: { Authorization: `Bearer ${userInfo.token}` } }
                );

                if (res.data.action === "added") {
                    // Thêm sản phẩm (lấy dữ liệu chuẩn từ server nếu có)
                    setFavoriteItems((prev) => [...prev, res.data.favorite || product]);
                } else {
                    // Xóa sản phẩm
                    setFavoriteItems((prev) => prev.filter((p) => p.id !== product.id));
                }
            } catch (err) {
                console.error("Lỗi toggle favorite:", err.response ? err.response.data : err.message);
                Alert.alert("Lỗi", "Không thể cập nhật yêu thích. Vui lòng thử lại.");
            }
        } else {
            // --- CHƯA ĐĂNG NHẬP: Lưu tạm (Offline) ---
            const exists = favoriteItems.some((p) => p.id === product.id);
            let newItems;
            if (exists) {
                newItems = favoriteItems.filter((p) => p.id !== product.id);
            } else {
                newItems = [...favoriteItems, product];
                Alert.alert("Đã thêm (Tạm thời)", "Sản phẩm được lưu tạm. Đăng nhập để đồng bộ!", [
                    { text: "OK" },
                ]);
            }
            setFavoriteItems(newItems);
            await saveOffline(newItems);
        }
    };

    // --- Hàm kiểm tra yêu thích ---
    const isFavorite = (productId) => {
        return favoriteItems.some((item) => item.id === productId);
    };

    // --- Tự động tải lại khi trạng thái đăng nhập thay đổi ---
    useEffect(() => {
        // console.log("Trạng thái Auth thay đổi, đang fetch favorites...");
        fetchFavorites();
    }, [isAuthenticated]); // Chỉ phụ thuộc vào isAuthenticated

    return (
        <FavoritesContext.Provider
            value={{
                favoriteItems,
                loading,
                error,
                refetchFavorites: fetchFavorites, // Dùng cho nút "Thử lại"
                toggleFavorite,
                isFavorite,
            }}
        >
            {children}
        </FavoritesContext.Provider>
    );
};