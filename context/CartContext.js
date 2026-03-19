import React, { createContext, useState, useMemo, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
// 1. Import AuthContext để biết người dùng đã đăng nhập hay chưa
import { AuthContext } from './Authentication';
import { Alert } from 'react-native'; // Thêm Alert cho thông báo

// 2. Tạo Context
export const CartContext = createContext();

// 3. Định nghĩa API_URL (Hãy đảm bảo nó giống hệt AuthContext)
const API_URL = 'http://192.168.100.128:8000/api';

// 4. Tạo Provider Component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Thêm state loading

  // 5. Lấy thông tin đăng nhập từ AuthContext
  const { userInfo, userToken, logout } = useContext(AuthContext); // Thêm logout vào đây

  // 6. Hàm tải giỏ hàng từ Server khi người dùng đăng nhập
  const fetchUserCart = useCallback(async () => {
    if (!userToken) return; // Không có token, không làm gì cả
    setIsLoading(true);
    try {
      // (Axios interceptor trong AuthContext sẽ tự động đính kèm token)
      const response = await axios.get(`${API_URL}/cart`);
      // Giả sử server trả về { data: { items: [...] } } hoặc mảng trực tiếp
      setCartItems(response.data.items || response.data || []);
    } catch (e) {
      // Xử lý lỗi 401 khi dùng Axios (token hết hạn)
      if (e.response && e.response.status === 401) {
        if (logout) logout();
        setCartItems([]);
        return;
      }
      console.error("Lỗi khi tải giỏ hàng từ server:", e.response?.data);
    } finally {
      setIsLoading(false);
    }
  }, [userToken, logout]); // Thêm logout và userToken vào dependencies

  // 7. Tự động tải giỏ hàng (khi đăng nhập) hoặc xóa giỏ hàng (khi đăng xuất)
  useEffect(() => {
    if (userInfo) {
      // Đã đăng nhập -> Tải giỏ hàng từ server
      fetchUserCart();
    } else {
      // Đã đăng xuất -> Xóa giỏ hàng local
      setCartItems([]);
    }
  }, [userInfo, fetchUserCart]); // Thêm fetchUserCart vào dependencies


  // --- CÁC HÀM XỬ LÝ GIỎ HÀNG (ĐÃ CẬP NHẬT) ---

  const addToCart = async (product) => {
    // (product object phải chứa 'id' và 'selectedSize')
    if (userToken) {
      // --- 8a. LOGIC KHI ĐÃ ĐĂNG NHẬP (GỌI API) ---
      try {
        // Gửi yêu cầu thêm lên server
        const response = await axios.post(`${API_URL}/cart/add`, {
          product_id: product.id,
          size: product.selectedSize,
          quantity: 1
        });
        // Cập nhật state bằng giỏ hàng mới nhất từ server
        setCartItems(response.data.items || response.data || []);
      } catch (e) {
        console.error("Lỗi API (addToCart):", e.response?.data);
        // Thêm xử lý lỗi 401 nếu cần
        if (e.response && e.response.status === 401 && logout) {
          Alert.alert('Lỗi', 'Phiên hết hạn. Vui lòng đăng nhập lại.');
          logout();
        }
      }
    } else {
      // 🔴 Thêm cảnh báo khi chưa đăng nhập
      Alert.alert(
        "Yêu cầu Đăng nhập",
        "Vui lòng đăng nhập để lưu và đồng bộ giỏ hàng của bạn trên server."
      );

      // --- 8b. LOGIC KHI CHƯA ĐĂNG NHẬP (LOCAL STATE) ---
      // SỬA LỖI LOGIC: Kiểm tra cả ID và Size
      setCartItems(prevItems => {
        const existingItem = prevItems.find(
          item => item.id === product.id && item.selectedSize === product.selectedSize
        );
        if (existingItem) {
          return prevItems.map(item =>
            (item.id === product.id && item.selectedSize === product.selectedSize)
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prevItems, { ...product, quantity: 1 }];
      });
    }
  };

  // SỬA LOGIC: Cần `product` (chứa cả id và size) thay vì chỉ `productId`
  const decreaseQuantity = async (product) => {
    if (userToken) {
      // --- 9a. LOGIC KHI ĐÃ ĐĂNG NHẬP (GỌI API) ---
      try {
        const response = await axios.post(`${API_URL}/cart/decrease`, {
          product_id: product.id,
          size: product.selectedSize,
        });
        setCartItems(response.data.items || response.data || []);
      } catch (e) {
        console.error("Lỗi API (decreaseQuantity):", e.response?.data);
      }
    } else {
      // --- 9b. LOGIC KHI CHƯA ĐĂNG NHẬP (LOCAL STATE) ---
      setCartItems(prevItems => {
        return prevItems.map(item => {
          if (item.id === product.id && item.selectedSize === product.selectedSize) {
            const newQuantity = item.quantity - 1;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        }).filter(Boolean); // Lọc bỏ item bị null (hết hàng)
      });
    }
  };

  // SỬA LOGIC: Cần `product` (chứa cả id và size) thay vì chỉ `productId`
  const removeFromCart = async (product) => {
    if (userToken) {
      // --- 10a. LOGIC KHI ĐÃ ĐĂNG NHẬP (GỌI API) ---
      try {
        const response = await axios.post(`${API_URL}/cart/remove`, {
          product_id: product.id,
          size: product.selectedSize,
        });
        setCartItems(response.data.items || response.data || []);
      } catch (e) {
        console.error("Lỗi API (removeFromCart):", e.response?.data);
      }
    } else {
      // --- 10b. LOGIC KHI CHƯA ĐĂNG NHẬP (LOCAL STATE) ---
      setCartItems(prevItems =>
        prevItems.filter(item =>
          !(item.id === product.id && item.selectedSize === product.selectedSize)
        )
      );
    }
  };
  const clearCart = () => {
    setCartItems([]);
  };

  // --- Tính toán (Giữ nguyên, không đổi) ---
  const { totalItems, totalPrice } = useMemo(() => {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum, item) => {
      const price = item.price_discount || item.price;
      return sum + price * item.quantity;
    }, 0);
    return { totalItems, totalPrice };
  }, [cartItems]);

  // --- Cung cấp giá trị ---
  const value = {
    cartItems,
    addToCart,
    decreaseQuantity,
    removeFromCart,
    totalItems,
    totalPrice,
    isLoading,
    clearCart, // Thêm isLoading để CartScreen có thể hiển thị
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
