import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { ThemeContext } from '../../context/ThemeContext';
// *** THAY ĐỔI 1: Import thêm cartItems và clearCart ***
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/Authentication';

// --- Hàm tiện ích ---
const formatCurrency = (value) => {
  if (typeof value !== 'number') return '';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// --- Component Modal Sửa Thông Tin (Giữ nguyên) ---
const InfoModal = ({ visible, onClose, onSave, title, initialValue, keyboardType = 'default', colors }) => {
  const [value, setValue] = useState(initialValue);
  const styles = dynamicStyles(colors);

  useEffect(() => {
    if (visible) setValue(initialValue);
  }, [visible, initialValue]);

  const handleSave = () => {
    if (value.trim() === '') {
      Alert.alert('Lỗi', `${title} không được để trống.`);
      return;
    }
    onSave(value);
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPress={() => { }}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TextInput
            style={styles.addressInput}
            value={value}
            onChangeText={setValue}
            placeholder={`Nhập ${title.toLowerCase()} của bạn`}
            placeholderTextColor={colors.subtleText}
            keyboardType={keyboardType}
            autoCapitalize="none"
          />
          <View style={styles.modalFooter}>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onClose}>
              <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSave}>
              <Text style={styles.modalButtonText}>Lưu</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// --- Component Modal Bản Đồ (Giữ nguyên) ---
const MapModal = ({ visible, onClose, onSelectLocation, initialRegion, colors }) => {
  const [markerPosition, setMarkerPosition] = useState(initialRegion);
  const mapRef = useRef(null);
  const styles = dynamicStyles(colors);

  useEffect(() => {
    if (visible) setMarkerPosition(initialRegion);
  }, [visible, initialRegion]);

  const handleConfirm = () => {
    // Giả lập reverse geocoding đơn giản
    const newAddress = `Vị trí tại Lat: ${markerPosition.latitude.toFixed(4)}, Lng: ${markerPosition.longitude.toFixed(4)}`;
    onSelectLocation(markerPosition, newAddress);
  };

  const handleMapPress = (e) => {
    setMarkerPosition(e.nativeEvent.coordinate);
  };

  const handleZoom = async (type) => {
    if (!mapRef.current) return;
    const camera = await mapRef.current.getCamera();
    camera.zoom += type === 'in' ? 1 : -1;
    mapRef.current.animateCamera(camera, { duration: 250 });
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.mapModalContainer}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={initialRegion}
          showsUserLocation={true}
          onPress={handleMapPress}
        >
          <Marker
            coordinate={markerPosition}
            draggable
            onDragEnd={(e) => setMarkerPosition(e.nativeEvent.coordinate)}
          />
        </MapView>

        <View style={styles.zoomControls}>
          <TouchableOpacity style={styles.zoomButton} onPress={() => handleZoom('in')}>
            <Ionicons name="add" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomButton} onPress={() => handleZoom('out')}>
            <Ionicons name="remove" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.mapHeader}>
          <TouchableOpacity onPress={onClose} style={styles.mapCloseButton}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.mapFooter}>
          <TouchableOpacity style={styles.paymentButton} onPress={handleConfirm}>
            <Text style={styles.paymentButtonText}>Xác nhận vị trí này</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};


// --- Component chính ---
export default function CheckoutScreen() {
  const router = useRouter();
  const { colors } = useContext(ThemeContext);

  // *** THAY ĐỔI 2: Lấy cartItems và clearCart từ Context ***
  const { totalPrice, cartItems, clearCart } = useContext(CartContext);

  const { userInfo } = useContext(AuthContext);
  const styles = dynamicStyles(colors);

  const [contactInfo, setContactInfo] = useState({ email: '', phone: '' });
  const [address, setAddress] = useState('');
  const [region, setRegion] = useState({
    latitude: 10.7769,
    longitude: 106.7009,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [isInfoModalVisible, setInfoModalVisible] = useState(false);
  const [editingInfo, setEditingInfo] = useState({ field: '', title: '', keyboardType: 'default' });
  const [isMapModalVisible, setMapModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('paypal');

  // State để quản lý trạng thái loading của nút thanh toán
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (userInfo) {
      setContactInfo({
        email: userInfo.email || '',
        phone: userInfo.phone || '',
      });
      // Giả sử userInfo.address lưu địa chỉ dạng text
      setAddress(userInfo.address || 'Vui lòng cập nhật địa chỉ');
      // TODO: Nếu userInfo có lưu lat/lng, cập nhật 'region' ở đây
    }
  }, [userInfo]);

  const shippingCost = 50000;
  const finalTotal = totalPrice + shippingCost;

  const handleEditInfo = (field, title, keyboardType = 'default') => {
    setEditingInfo({ field, title, keyboardType });
    setInfoModalVisible(true);
  };

  const handleSaveInfo = (newValue) => {
    if (editingInfo.field === 'address') {
      setAddress(newValue);
    } else {
      setContactInfo((prev) => ({ ...prev, [editingInfo.field]: newValue }));
    }
    setInfoModalVisible(false);
  };

  const handleSelectLocation = (newCoordinate, newAddress) => {
    setRegion((prev) => ({
      ...prev,
      latitude: newCoordinate.latitude,
      longitude: newCoordinate.longitude,
    }));
    setAddress(newAddress); // Cập nhật địa chỉ text từ bản đồ
    setMapModalVisible(false);
  };

  // *** THAY ĐỔI 3: CẬP NHẬT HOÀN TOÀN HÀM XỬ LÝ THANH TOÁN ***
  const handlePayment = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    // 1. Kiểm tra thông tin
    if (!address || address === 'Vui lòng cập nhật địa chỉ' || !contactInfo.phone || !contactInfo.email) {
      Alert.alert('Thiếu thông tin', 'Vui lòng cập nhật đầy đủ thông tin liên hệ và địa chỉ.');
      setIsProcessing(false);
      return;
    }
    if (!cartItems || cartItems.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Bạn không có sản phẩm nào để thanh toán.');
      setIsProcessing(false);
      return;
    }

    const itemsPayload = cartItems.map(item => ({
      product_id: Number(item.id),
      quantity: Number(item.quantity) || 1,
      price: Number(item.price_discount || item.price || 0),
    }));

    const finalTotal = Number(totalPrice) + Number(shippingCost);

    console.log('Gửi đi:', { finalTotal, itemsPayload }); // DEBUG

    const orderData = {
      name: userInfo.name,
      address: address.trim(),
      phone: contactInfo.phone.trim(),
      email: contactInfo.email.trim(),
      payment_method: selectedPayment,
      shipping_cost: Number(shippingCost),
      total_amount: finalTotal,
      items: itemsPayload,
    };

    try {
      // !!! QUAN TRỌNG: Thay thế URL này bằng URL API thật của bạn
      const API_URL = 'http://192.168.100.128:8000/api/order';

      // 4. Lấy token
      if (!userInfo || !userInfo.token) {
        throw new Error('Bạn chưa đăng nhập hoặc phiên đã hết hạn.');
      }

      // 5. Gửi request đến API
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`, // Gửi token
        },
        body: JSON.stringify(orderData),
      });

      // 6. Xử lý kết quả
      if (response.ok) { // Status 200-299 (API trả về 201)
        // const result = await response.json(); // Lấy data nếu cần
        // console.log('Đặt hàng thành công:', result.order_id);

        // Hiển thị thông báo thành công
        Alert.alert(
          'Đặt hàng thành công!',
          'Cảm ơn bạn đã mua hàng. Đơn hàng đang được xử lý.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Xóa giỏ hàng (API đã tự xóa, ta xóa ở local)
                clearCart();
                // Điều hướng về trang chủ
                router.replace('/(tabs)');
              },
            },
          ]
        );
      } else if (response.status === 422) {
        const errorData = await response.json();
        const errors = errorData.errors || [];
        const firstError = Array.isArray(errors) ? errors[0] : Object.values(errors)[0]?.[0];
        Alert.alert('Lỗi dữ liệu', firstError || 'Vui lòng kiểm tra lại thông tin.');
        setIsProcessing(false);
        return;
      } else {
        // Lỗi 500 hoặc lỗi server khác
        throw new Error('Lỗi máy chủ, không thể đặt hàng.');
      }
    } catch (error) {
      console.error('Lỗi khi thanh toán:', error);
      Alert.alert(
        'Thanh toán thất bại',
        error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.'
      );
    } finally {
      setIsProcessing(false); // Dừng loading trong mọi trường hợp
    }
  };


  // Danh sách phương thức thanh toán (Giữ nguyên)
  const paymentMethods = [
    {
      id: 'paypal',
      title: 'PayPal',
      icon: () => <FontAwesome5 name="paypal" size={24} color="#00457C" />,
      desc: '**** **** 0696 4629',
    },
    {
      id: 'momo',
      title: 'Momo',
      icon: () => <MaterialCommunityIcons name="wallet" size={28} color="#C41E3A" />,
      desc: 'Liên kết ví điện tử',
    },
    {
      id: 'zalopay',
      title: 'ZaloPay',
      icon: () => <Ionicons name="phone-portrait-outline" size={28} color="#0068FF" />,
      desc: 'Thanh toán qua Zalo',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* InfoModal (giữ nguyên) */}
      <InfoModal
        visible={isInfoModalVisible}
        onClose={() => setInfoModalVisible(false)}
        onSave={handleSaveInfo}
        title={editingInfo.title}
        initialValue={
          editingInfo.field === 'address'
            ? address
            : contactInfo[editingInfo.field] || ''
        }
        keyboardType={editingInfo.keyboardType}
        colors={colors}
      />

      {/* MapModal (giữ nguyên) */}
      <MapModal
        visible={isMapModalVisible}
        onClose={() => setMapModalVisible(false)}
        onSelectLocation={handleSelectLocation}
        initialRegion={region}
        colors={colors}
      />

      {/* Header (giữ nguyên) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Thông tin liên hệ (giữ nguyên) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={22} color={colors.subtleText} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{contactInfo.email}</Text>
            </View>
            <TouchableOpacity onPress={() => handleEditInfo('email', 'Chỉnh sửa Email', 'email-address')}>
              <FontAwesome5 name="pencil-alt" size={16} color={colors.subtleText} />
            </TouchableOpacity>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={22} color={colors.subtleText} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{contactInfo.phone}</Text>
            </View>
            <TouchableOpacity onPress={() => handleEditInfo('phone', 'Chỉnh sửa SĐT', 'phone-pad')}>
              <FontAwesome5 name="pencil-alt" size={16} color={colors.subtleText} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Địa chỉ + Mini Map (giữ nguyên) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          {/* Cập nhật để mở modal sửa address dạng text */}
          <TouchableOpacity style={styles.addressRow} onPress={() => handleEditInfo('address', 'Chỉnh sửa địa chỉ')}>
            <Text style={styles.infoValue} numberOfLines={2}>{address}</Text>
            <FontAwesome5 name="pencil-alt" size={16} color={colors.subtleText} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.mapContainer} onPress={() => setMapModalVisible(true)}>
            <MapView
              style={styles.mapView}
              region={region}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
              pointerEvents="none"
            >
              <Marker coordinate={region}>
                <View style={styles.customMarkerContainer}>
                  <View style={styles.customMarkerOuter} />
                  <View style={styles.customMarkerInner} />
                </View>
              </Marker>
            </MapView>
            <View style={styles.mapOverlay}>
              <View style={styles.accuracyCircle} />
              <Ionicons name="location-sharp" size={28} color={colors.primary} />
              <Text style={styles.accuracyText}>Chọn vị trí trên bản đồ</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Phương thức thanh toán (giữ nguyên) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentOption,
                selectedPayment === method.id && styles.paymentOptionSelected,
              ]}
              onPress={() => setSelectedPayment(method.id)}
            >
              <View style={styles.paymentLeft}>
                {method.icon()}
                <View style={styles.paymentTextContainer}>
                  <Text style={styles.paymentTitle}>{method.title}</Text>
                  <Text style={styles.paymentDesc}>{method.desc}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.radioOuter,
                  selectedPayment === method.id && styles.radioOuterSelected,
                ]}
              >
                {selectedPayment === method.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Footer (giữ nguyên) */}
      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalPrice)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>{formatCurrency(shippingCost)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.summaryTotalLabel}>Total Cost</Text>
          <Text style={styles.summaryTotalValue}>{formatCurrency(finalTotal)}</Text>
        </View>

        {/* *** THAY ĐỔI 4: CẬP NHẬT NÚT THANH TOÁN *** */}
        <TouchableOpacity
          style={[styles.paymentButton, isProcessing && styles.paymentButtonDisabled]} // Thêm style khi đang xử lý
          onPress={handlePayment} // Gắn hàm xử lý đã cập nhật
          disabled={isProcessing}  // Vô hiệu hóa nút khi đang xử lý
        >
          <Text style={styles.paymentButtonText}>
            {isProcessing
              ? 'Đang xử lý...'
              : `Thanh toán ${finalTotal > 0 ? formatCurrency(finalTotal) : ''}`
            }
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- Styles ---
const dynamicStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background, paddingTop: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.card,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 20,
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  infoLabel: {
    color: colors.subtleText,
    fontSize: 14,
    marginBottom: 2,
  },
  infoValue: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
    marginRight: 10,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapContainer: {
    height: 140,
    borderRadius: 12,
    marginTop: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  mapView: {
    ...StyleSheet.absoluteFillObject,
  },
  customMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  customMarkerOuter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '40',
    position: 'absolute',
  },
  customMarkerInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  accuracyCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.primary + '60',
    opacity: 0.6,
  },
  accuracyText: {
    position: 'absolute',
    bottom: 16,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    textAlign: 'center',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: colors.card,
    marginBottom: 10,
  },
  paymentOptionSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  paymentDesc: {
    fontSize: 13,
    color: colors.subtleText,
    marginTop: 2,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.subtleText,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.subtleText,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  totalRow: {
    marginTop: 10,
  },
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  summaryTotalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
  },
  paymentButton: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  // *** THAY ĐỔI 5: THÊM STYLE CHO NÚT KHI BỊ VÔ HIỆU HÓA ***
  paymentButtonDisabled: {
    backgroundColor: colors.subtleText, // Màu xám nhạt
    opacity: 0.7,
  },
  paymentButtonText: {
    color: colors.buttonText,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  addressInput: {
    backgroundColor: colors.background,
    color: colors.text,
    borderRadius: 12,
    padding: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.buttonText,
  },
  cancelButton: {
    backgroundColor: colors.background,
  },
  cancelButtonText: {
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapHeader: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  mapCloseButton: {
    backgroundColor: colors.card,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  mapFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
  },
  zoomControls: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  zoomButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
