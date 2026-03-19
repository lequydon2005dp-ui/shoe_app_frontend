import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router'; // THÊM DÒNG NÀY

// 1. Tạo Context
export const AuthContext = createContext();

// IP của server
const API_URL = 'http://192.168.100.128:8000/api';

// Cấu hình Axios Interceptor
axios.interceptors.request.use(
    async config => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

// 2. Tạo Provider
export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter(); // DÙNG ROUTER Ở ĐÂY

    // Hàm đăng ký
    const register = async (name, email, phone, password, password_confirmation) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/register`, {
                name, email, phone, password, password_confirmation
            });
            setIsLoading(false);
            return response.data;
        } catch (e) {
            setIsLoading(false);
            console.error("Lỗi đăng ký:", e.response?.data);
            return {
                error: true,
                message: e.response?.data?.message || 'Lỗi server.',
                errors: e.response?.data?.errors
            };
        }
    };

    // Hàm đăng nhập
    const login = async (email, password) => {
        setIsLoading(true);
        try {
            // 1. GỌI API LOGIN
            const loginResponse = await axios.post(`${API_URL}/login`, { email, password });
            const { access_token } = loginResponse.data;

            // 2. LƯU TOKEN
            await AsyncStorage.setItem('userToken', access_token);
            setUserToken(access_token);

            // 3. GỌI /api/user ĐỂ LẤY DỮ LIỆU MỚI NHẤT
            const userResponse = await axios.get(`${API_URL}/user`);
            const user = userResponse.data.user;

            // 4. GỘP TOKEN VÀO USER, SAU ĐÓ LƯU VÀO ASYNCSTORAGE + STATE
            const userInfoWithToken = {
                ...user, // Lấy tất cả thuộc tính của user (id, email, phone...)
                token: access_token // Thêm thuộc tính 'token' vào
            };

            await AsyncStorage.setItem('userInfo', JSON.stringify(userInfoWithToken));
            setUserInfo(userInfoWithToken); // <-- Lưu đối tượng đã gộp

            setIsAuthenticated(true);

            setIsLoading(false);
            console.log('Đăng nhập thành công, isAuthenticated = true');

            setIsLoading(false);
            console.log('Đồng bộ user thành công:', user);

            return { success: true };
        } catch (e) {
            setIsLoading(false);
            setIsAuthenticated(false);
            const error = e.response?.data?.message || 'Đăng nhập thất bại';
            console.error('Lỗi login:', error);
            return { success: false, error };
        }
    };
    // === QUÊN MẬT KHẨU - GỬI EMAIL ===
    const forgotPassword = async (email) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/forgot-password`, { email });
            setIsLoading(false);
            return { success: true, message: response.data.message };
        } catch (e) {
            setIsLoading(false);
            const error = e.response?.data?.message || 'Gửi thất bại';
            return { success: false, error };
        }
    };

    // === ĐẶT LẠI MẬT KHẨU ===
    const resetPassword = async (token, email, password, password_confirmation) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/reset-password`, {
                token,
                email,
                password,
                password_confirmation
            });
            setIsLoading(false);
            return { success: true, message: response.data.message };
        } catch (e) {
            setIsLoading(false);
            const error = e.response?.data?.message || 'Đặt lại thất bại';
            return { success: false, error };
        }
    };

    // HÀM ĐĂNG XUẤT - KHÔNG CÓ router.replace()
    const logout = async () => {
        const token = await AsyncStorage.getItem('userToken');
        setIsLoading(true);

        if (token) {
            try {
                await axios.post(`${API_URL}/logout`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('Đăng xuất thành công trên server');
            } catch (e) {
                if (e.response?.status === 401) {
                    console.log('Token hết hạn - bỏ qua');
                } else {
                    console.error('Lỗi API logout:', e.response?.data);
                }
            }
        }

        await AsyncStorage.multiRemove(['userToken', 'userInfo']);
        setUserToken(null);
        setUserInfo(null);
        setIsAuthenticated(false);
        setIsLoading(false);

        console.log('Xóa dữ liệu local thành công');
        // KHÔNG CÓ router.replace() Ở ĐÂY
    };

    // Kiểm tra đăng nhập khi mở app
    const checkLoginStatus = async () => {
        try {
            setIsLoading(true);
            const token = await AsyncStorage.getItem('userToken');
            const user = await AsyncStorage.getItem('userInfo');

            if (token && user) {
                setUserToken(token);
                setUserInfo(JSON.parse(user));
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false); // Đảm bảo là false nếu không có
            }
        } catch (e) {
            console.log('Lỗi kiểm tra đăng nhập:', e);
        } finally {
            setIsLoading(false);
        }
    };
    const updateUserInfo = async (newInfo) => {
        try {
            // Lấy token hiện có để gộp lại (nếu chưa có)
            const token = await AsyncStorage.getItem('userToken');
            const userWithToken = { ...newInfo, token };

            // Lưu vào AsyncStorage
            await AsyncStorage.setItem('userInfo', JSON.stringify(userWithToken));

            // Cập nhật vào state để trigger re-render
            setUserInfo(userWithToken);

            // console.log('✅ Cập nhật userInfo trong context:', userWithToken);
        } catch (error) {
            // console.error('❌ Lỗi khi updateUserInfo:', error);
        }
    };

    // CHỈ CHẠY 1 LẦN KHI MỞ APP
    useEffect(() => {
        checkLoginStatus();
    }, []);
    return (
        <AuthContext.Provider value={{
            login,
            logout,
            register,
            forgotPassword,
            resetPassword,
            updateUserInfo,
            isLoading,
            userToken,
            userInfo,
            isAuthenticated
        }}>
            {children}
        </AuthContext.Provider>
    );
};