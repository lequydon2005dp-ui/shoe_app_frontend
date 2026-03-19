import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { CartContext } from '../../context/CartContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/Authentication';

const BASE_URL = 'http://192.168.100.128/LaravelApp/public/storage/';

const formatCurrency = (value) => {
  if (typeof value !== 'number') return '';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// === COMPONENT: MỖI SẢN PHẨM TRONG GIỎ ===
const CartItem = ({ item, styles }) => {
  const { addToCart, decreaseQuantity, removeFromCart } = useContext(CartContext);
  const price = item.price_discount || item.price;

  return (
    <View style={styles.itemContainer}>
      <Image
        source={{ uri: item.image_url ? BASE_URL + item.image_url : 'https://placehold.co/120x120/f0f0f0/333?text=Ảnh' }}
        style={styles.itemImage}
        resizeMode="cover"
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        {item.selectedSize && <Text style={styles.itemSize}>Size: {item.selectedSize}</Text>}
        <Text style={styles.itemPrice}>{formatCurrency(price)}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={() => decreaseQuantity(item)} style={styles.quantityButton}>
            <FontAwesome name="minus" size={12} color={styles.quantityButtonText.color} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => addToCart(item)} style={styles.quantityButton}>
            <FontAwesome name="plus" size={12} color={styles.quantityButtonText.color} />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={() => removeFromCart(item)} style={styles.removeButton}>
        <FontAwesome name="trash-o" size={22} color={styles.removeButtonText.color} />
      </TouchableOpacity>
    </View>
  );
};

// === MÀN HÌNH CHÍNH ===
export default function CartScreen() {
  const { colors } = useContext(ThemeContext);
  const { cartItems, totalPrice, isLoading } = useContext(CartContext);
  const { userInfo } = useContext(AuthContext);
  const router = useRouter();
  const styles = dynamicStyles(colors);

  // === CHỈ BẮT LOGIN KHI NHẤN THANH TOÁN ===
  const handleCheckout = () => {
    if (!userInfo) {
      Alert.alert(
        "Yêu cầu đăng nhập",
        "Bạn cần đăng nhập để tiến hành thanh toán.",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Đăng nhập", onPress: () => router.push('/Auth/login') }
        ]
      );
      return;
    }
    router.push('/checkout/Checkout');
  };

  // === TRỐNG HOẶC ĐANG TẢI ===
  if (cartItems.length === 0) {
    if (isLoading) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.emptyText}>Đang tải giỏ hàng...</Text>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <FontAwesome name="shopping-cart" size={80} color={colors.subtleText} />
          <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống</Text>
          <Link href="/(tabs)/" asChild>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Tiếp tục mua sắm</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  // === FOOTER: TỔNG TIỀN + NÚT THANH TOÁN ===
  const ListFooter = () => (
    <View style={styles.footer}>
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Tổng cộng:</Text>
        <Text style={styles.totalPrice}>{formatCurrency(totalPrice)}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleCheckout}>
        <Text style={styles.buttonText}>Tiến hành thanh toán</Text>
      </TouchableOpacity>
    </View>
  );

  // === GIAO DIỆN CHÍNH ===
  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.header}>Giỏ Hàng</Text>
      <FlatList
        data={cartItems}
        renderItem={({ item }) => <CartItem item={item} styles={styles} />}
        keyExtractor={(item) => `${item.id}-${item.selectedSize || ''}`}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={ListFooter}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// === STYLES ĐẸP NHƯ SHOPEE ===
const dynamicStyles = (colors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginVertical: 20,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: colors.placeholder,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 22,
  },
  itemSize: {
    fontSize: 14,
    color: colors.subtleText,
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 6,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  quantityButton: {
    width: 34,
    height: 34,
    backgroundColor: colors.background,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  quantityButtonText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 18,
    fontWeight: '600',
    color: colors.text,
  },
  removeButton: {
    padding: 10,
  },
  removeButtonText: {
    color: colors.danger || '#FF4C4C',
  },
  footer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    color: colors.subtleText,
    fontWeight: '500',
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: colors.buttonText || '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: colors.subtleText,
    marginTop: 16,
    textAlign: 'center',
  },
});