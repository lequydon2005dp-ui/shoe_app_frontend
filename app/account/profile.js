import React, {
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../context/Authentication';
import { ThemeContext } from '../../context/ThemeContext';

const API_BASE = 'http://192.168.100.128:8000/api';
const API_USER = `${API_BASE}/user`;
const API_UPDATE = `${API_BASE}/user/update`;
const API_UPDATE_AVATAR = `${API_BASE}/user/update-avatar`;
const STORAGE_URL = 'http://192.168.100.128/LaravelApp/public/storage/';

export default function Profile() {
  const { userInfo, updateUserInfo, logout } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const router = useRouter();
  const styles = useMemo(() => dynamicStyles(colors), [colors]);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarVersion, setAvatarVersion] = useState(1);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name || '');
      setEmail(userInfo.email || '');
      setPhone(userInfo.phone || '');
      setAddress(userInfo.address || '');
    }
  }, [userInfo]);

  const avatarUrl = useMemo(() => {
    return userInfo?.avatar
      ? `${STORAGE_URL}${userInfo.avatar}?v=${avatarVersion}`
      : 'https://placehold.co/150x150/f0f0f0/333?text=Avatar';
  }, [userInfo?.avatar, avatarVersion]);

  const getToken = async () =>
    userInfo?.token || (await AsyncStorage.getItem('userToken'));

  const handleUnauthorized = useCallback(() => {
    Alert.alert('Phiên hết hạn', 'Vui lòng đăng nhập lại.', [
      {
        text: 'OK',
        onPress: async () => {
          await logout?.();
          router.replace('/Auth/login');
        },
      },
    ]);
  }, [logout, router]);

  const refreshUser = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(API_USER, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200 && res.data.user) {
        await updateUserInfo(res.data.user);
        return res.data.user;
      }
    } catch {
      handleUnauthorized();
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ tên.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email.');
      return;
    }

    setIsLoading(true);
    try {
      const token = await getToken();
      const res = await axios.put(
        API_UPDATE,
        { name, email, phone, address },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200 && res.data.status) {
        await refreshUser();
        Alert.alert('Thành công', 'Thông tin đã được cập nhật!');
        setIsEditing(false);
      } else {
        throw new Error(res.data.message || 'Cập nhật thất bại');
      }
    } catch (e) {
      Alert.alert('Lỗi', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeAvatar = async () => {
    if (!isEditing) return;
    setIsUploading(true);

    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) return Alert.alert('Cần quyền truy cập ảnh.');

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled) return;

      const { uri } = result.assets[0];
      const token = await getToken();
      const fileType = uri.split('.').pop();

      const formData = new FormData();
      formData.append('avatar', {
        uri,
        name: `avatar.${fileType}`,
        type: `image/${fileType}`,
      });

      const res = await axios.post(API_UPDATE_AVATAR, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200 && res.data.status) {
        await refreshUser();
        setAvatarVersion(v => v + 1);
        Alert.alert('Thành công', 'Ảnh đại diện đã được cập nhật!');
      } else {
        throw new Error(res.data.message || 'Lỗi cập nhật ảnh');
      }
    } catch (e) {
      Alert.alert('Lỗi', e.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!userInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.infoValue}>Vui lòng đăng nhập lại.</Text>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin tài khoản</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={handleChangeAvatar} disabled={isUploading}>
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatar}
              onError={() => console.log('Avatar lỗi tải')}
            />
            <View style={styles.cameraButton}>
              {isUploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="camera-outline" size={18} color="#fff" />
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          {/* Họ tên */}
          <View style={styles.row}>
            <Ionicons name="person-outline" size={20} color="#555" />
            <Text style={styles.label}>Họ tên:</Text>
            {isEditing ? (
              <TextInput style={styles.input} value={name} onChangeText={setName} />
            ) : (
              <Text style={styles.value}>{userInfo.name}</Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.row}>
            <Ionicons name="mail-outline" size={20} color="#555" />
            <Text style={styles.label}>Email:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text style={styles.value}>{userInfo.email || '—'}</Text>
            )}
          </View>

          {/* Điện thoại */}
          <View style={styles.row}>
            <Ionicons name="call-outline" size={20} color="#555" />
            <Text style={styles.label}>Điện thoại:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.value}>{userInfo.phone || '—'}</Text>
            )}
          </View>

          {/* Địa chỉ */}
          <View style={styles.row}>
            <Ionicons name="location-outline" size={20} color="#555" />
            <Text style={styles.label}>Địa chỉ:</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { height: 60 }]}
                value={address}
                onChangeText={setAddress}
                multiline
              />
            ) : (
              <Text style={styles.value}>{userInfo.address || '—'}</Text>
            )}
          </View>

          {/* Nút hành động */}
          <View style={styles.actionRow}>
            {isEditing ? (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#FFDDDD' }]}
                  onPress={() => setIsEditing(false)}>
                  <Text style={{ color: '#FF6347' }}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#34C759' }]}
                  onPress={handleSave}
                  disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={{ color: '#fff' }}>Lưu</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
                onPress={() => setIsEditing(true)}>
                <Text style={{ color: '#fff' }}>Chỉnh sửa</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const dynamicStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAF7F0', paddingTop: 40 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#fff',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    backButton: {
      width: 40,
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '600',
      color: '#333',
      textAlign: 'center',
      flex: 1,
    },
    content: { alignItems: 'center', padding: 20 },
    avatarContainer: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: '#E0E0E0',
    },
    cameraButton: {
      position: 'absolute',
      bottom: 5,
      right: 5,
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: 15,
      padding: 6,
    },
    infoSection: {
      backgroundColor: '#fff',
      borderRadius: 15,
      padding: 20,
      width: '100%',
      elevation: 3,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      paddingBottom: 10,
    },
    label: { width: 100, color: '#555', fontWeight: '600', marginLeft: 8 },
    value: { flex: 1, color: '#333' },
    input: {
      flex: 1,
      backgroundColor: '#F8F5F0',
      borderWidth: 1,
      borderColor: '#E8DCCA',
      borderRadius: 5,
      padding: 8,
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 10,
    },
    actionButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginLeft: 10,
    },
  });
