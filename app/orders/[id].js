import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/Authentication';
import { Ionicons } from '@expo/vector-icons';

const API_BASE_URL = 'http://192.168.100.128:8000';
const BASE_URL = 'http://192.168.100.128';
const PLACEHOLDER_IMAGE = 'https://placehold.co/100x100/f0f0f0/333?text=No+Image';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors } = useContext(ThemeContext);
  const { userInfo } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const styles = dynamicStyles(colors);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
          headers: {
            'Authorization': `Bearer ${userInfo.token}`,
            'Accept': 'application/json',
          },
        });
        const data = await res.json();
        setOrder(data.order);
      } catch (err) {
        console.error('Lỗi khi tải chi tiết đơn hàng:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetail();
  }, [id]);

  // Hàm mở modal hủy
  const handleCancelOrder = () => {
    setCancelModalVisible(true);
  };

  // Hàm xác nhận hủy
  const confirmCancel = async () => {
    if (!cancelReason.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập lý do hủy đơn hàng.');
      return;
    }

    setCancelling(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userInfo.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ reason: cancelReason }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert('Thành công', 'Đơn hàng đã được hủy thành công.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Lỗi', data.message || 'Không thể hủy đơn hàng.');
      }
    } catch (err) {
      Alert.alert('Lỗi kết nối', 'Đã xảy ra lỗi khi gửi yêu cầu hủy.');
    } finally {
      setCancelling(false);
      setCancelModalVisible(false);
      setCancelReason('');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={{ color: colors.text, textAlign: 'center', marginTop: 20 }}>
          Không tìm thấy đơn hàng.
        </Text>
      </SafeAreaView>
    );
  }

  // Chỉ cho phép hủy nếu trạng thái là pending hoặc processing
  const canCancel = ['pending', 'processing'].includes(order.status);
  const statusText = {
    pending: 'Đang chờ xử lý',
    processing: 'Đang xử lý',
    shipping: 'Đang giao hàng',
    delivered: 'Đã giao',
    completed: 'Hoàn tất',
    cancelled: 'Đã hủy',
  }[order.status] || order.status;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng #{order.id}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container}>
        <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
        <Text style={styles.text}>Ngày đặt: {formatDate(order.created_at)}</Text>
        <Text style={styles.text}>Địa chỉ: {order.address}</Text>
        <Text style={styles.text}>SĐT: {order.phone}</Text>
        <Text style={styles.text}>Email: {order.email}</Text>
        <Text style={styles.text}>
          Trạng thái:{' '}
          <Text style={{ fontWeight: 'bold', color: colors.primary }}>
            {statusText}
          </Text>
        </Text>

        {/* Hiển thị lý do hủy nếu có */}
        {order.status === 'cancelled' && order.cancel_reason && (
          <View style={styles.cancelReasonBox}>
            <Text style={styles.cancelReasonLabel}>Lý do hủy:</Text>
            <Text style={styles.cancelReasonText}>{order.cancel_reason}</Text>
          </View>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Sản phẩm</Text>
        {order.items?.map((item) => {
          const img = item.product?.image_url
            ? `${BASE_URL}/LaravelApp/public/storage/${item.product.image_url.replace('public/', '')}`
            : PLACEHOLDER_IMAGE;
          return (
            <View key={item.id} style={styles.productRow}>
              <Image source={{ uri: img }} style={styles.image} />
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{item.product?.name}</Text>
                <Text style={styles.text}>Số lượng: {item.quantity}</Text>
                <Text style={styles.text}>Giá: {formatCurrency(item.price)}</Text>
              </View>
            </View>
          );
        })}

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Phí vận chuyển:</Text>
          <Text style={styles.totalValue}>{formatCurrency(order.shipping_cost)}</Text>
        </View>
        <View style={styles.totalContainer}>
          <Text style={[styles.totalLabel, { fontWeight: 'bold' }]}>Tổng cộng:</Text>
          <Text style={[styles.totalValue, { fontWeight: 'bold', color: colors.primary }]}>
            {formatCurrency(order.total_amount)}
          </Text>
        </View>

        {/* Nút hủy đơn hàng */}
        {canCancel && (
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: colors.danger || '#e74c3c' }]}
            onPress={handleCancelOrder}
            disabled={cancelling}
          >
            {cancelling ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Thông báo không thể hủy */}
        {!canCancel && order.status !== 'cancelled' && (
          <View style={styles.cancelDisabledContainer}>
            <Text style={styles.cancelDisabledText}>
              Đơn hàng ở trạng thái "{statusText}" không thể hủy.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal nhập lý do hủy */}
      <Modal
        visible={cancelModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Lý do hủy đơn hàng</Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="Nhập lý do hủy (bắt buộc)..."
              multiline
              numberOfLines={4}
              value={cancelReason}
              onChangeText={setCancelReason}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => {
                  setCancelModalVisible(false);
                  setCancelReason('');
                }}
                disabled={cancelling}
              >
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.confirmBtn]}
                onPress={confirmCancel}
                disabled={cancelling}
              >
                {cancelling ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmBtnText}>Xác nhận hủy</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

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
    headerButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
    container: { padding: 16 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
    text: { fontSize: 14, color: colors.subtleText, marginBottom: 4 },
    productRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    image: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
    productName: { fontSize: 15, fontWeight: '500', color: colors.text },
    totalContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    totalLabel: { fontSize: 14, color: colors.subtleText },
    totalValue: { fontSize: 14, color: colors.text },

    // Hủy đơn
    cancelButton: {
      marginTop: 24,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    cancelDisabledContainer: {
      marginTop: 24,
      paddingVertical: 14,
      borderRadius: 8,
      backgroundColor: '#f8f9fa',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#ddd',
    },
    cancelDisabledText: {
      color: '#888',
      fontSize: 14,
      fontStyle: 'italic',
    },
    cancelReasonBox: {
      marginTop: 12,
      padding: 12,
      backgroundColor: '#fff3cd',
      borderRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: '#ffc107',
    },
    cancelReasonLabel: {
      fontWeight: 'bold',
      color: '#856404',
      marginBottom: 4,
    },
    cancelReasonText: {
      color: '#856404',
      fontSize: 14,
    },

    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '88%',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 20,
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    reasonInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      backgroundColor: colors.background,
      color: colors.text,
      minHeight: 100,
      fontSize: 15,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
    },
    modalBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 6,
    },
    cancelBtn: {
      backgroundColor: '#e9ecef',
    },
    cancelBtnText: {
      color: '#495057',
      fontWeight: '600',
    },
    confirmBtn: {
      backgroundColor: colors.danger || '#e74c3c',
    },
    confirmBtnText: {
      color: '#fff',
      fontWeight: 'bold',
    },
  });