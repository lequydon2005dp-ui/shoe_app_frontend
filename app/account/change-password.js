import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    SafeAreaView,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import axios from 'axios';


const API_BASE = 'http://192.168.100.128:8000/api';
const API_USER = `${API_BASE}/change-password`;

export default function ChangePasswordScreen() {
    const { colors } = useContext(ThemeContext);
    const router = useRouter();
    const styles = dynamicStyles(colors);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Hàm validate đơn giản phía client
    const validateForm = () => {
        const newErrors = {};
        if (!currentPassword) {
            newErrors.current_password = 'Vui lòng nhập mật khẩu hiện tại.';
        }
        if (!newPassword) {
            newErrors.new_password = 'Vui lòng nhập mật khẩu mới.';
        } else if (newPassword.length < 8) {
            newErrors.new_password = 'Mật khẩu mới phải có ít nhất 8 ký tự.';
        }
        if (newPassword !== confirmPassword) {
            newErrors.confirm_password = 'Mật khẩu xác nhận không khớp.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const response = await axios.post(API_USER, {
                current_password: currentPassword,
                new_password: newPassword,
                new_password_confirmation: confirmPassword, // Gửi trường xác nhận
            });

            if (response.data.success) {
                Alert.alert(
                    "Thành công",
                    "Đổi mật khẩu thành công!",
                    [{ text: "OK", onPress: () => router.back() }]
                );
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                // Lỗi từ server (validate hoặc mật khẩu cũ sai)
                if (error.response.data.errors) {
                    // Lỗi validation của Laravel
                    const serverErrors = {};
                    const laravelErrors = error.response.data.errors;
                    if (laravelErrors.current_password) {
                        serverErrors.current_password = laravelErrors.current_password[0];
                    }
                    if (laravelErrors.new_password) {
                        serverErrors.new_password = laravelErrors.new_password[0];
                    }
                    setErrors(serverErrors);
                } else if (error.response.data.message) {
                    // Lỗi "Mật khẩu hiện tại không chính xác"
                    setErrors({ current_password: error.response.data.message });
                }
            } else {
                // Lỗi server 500 hoặc lỗi mạng
                Alert.alert("Lỗi", "Đã xảy ra lỗi, vui lòng thử lại.");
                console.error("Lỗi đổi mật khẩu:", error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Sử dụng Stack.Screen để tùy chỉnh header */}
            <Stack.Screen
                options={{
                    headerTitle: "Đổi mật khẩu",
                    headerStyle: { backgroundColor: colors.card },
                    headerTintColor: colors.text,
                    headerTitleAlign: 'center',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                            <Ionicons name="chevron-back" size={26} color={colors.text} />
                        </TouchableOpacity>
                    ),
                }}
            />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.formContainer}>
                        {/* Mật khẩu hiện tại */}
                        <Text style={styles.label}>Mật khẩu hiện tại</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                secureTextEntry={!showCurrent}
                                placeholder="Nhập mật khẩu hiện tại"
                                placeholderTextColor={colors.subtleText}
                            />
                            <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.icon}>
                                <Ionicons name={showCurrent ? "eye-off-outline" : "eye-outline"} size={22} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        {errors.current_password && <Text style={styles.errorText}>{errors.current_password}</Text>}

                        {/* Mật khẩu mới */}
                        <Text style={styles.label}>Mật khẩu mới</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showNew}
                                placeholder="Ít nhất 8 ký tự"
                                placeholderTextColor={colors.subtleText}
                            />
                            <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.icon}>
                                <Ionicons name={showNew ? "eye-off-outline" : "eye-outline"} size={22} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        {errors.new_password && <Text style={styles.errorText}>{errors.new_password}</Text>}

                        {/* Xác nhận mật khẩu mới */}
                        <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirm}
                                placeholder="Nhập lại mật khẩu mới"
                                placeholderTextColor={colors.subtleText}
                            />
                            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.icon}>
                                <Ionicons name={showConfirm ? "eye-off-outline" : "eye-outline"} size={22} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        {errors.confirm_password && <Text style={styles.errorText}>{errors.confirm_password}</Text>}

                        {/* Nút lưu */}
                        <TouchableOpacity
                            style={[styles.saveButton, isLoading && styles.buttonDisabled]}
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const dynamicStyles = (colors) =>
    StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: colors.background,
        },
        container: {
            flex: 1,
            paddingHorizontal: 20,
        },
        formContainer: {
            paddingTop: 20,
            paddingBottom: 40,
        },
        label: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 8,
            marginTop: 16,
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
        },
        input: {
            flex: 1,
            height: 50,
            paddingHorizontal: 15,
            fontSize: 16,
            color: colors.text,
        },
        icon: {
            padding: 12,
        },
        errorText: {
            color: colors.danger || '#FF4C4C',
            fontSize: 14,
            marginTop: 6,
            marginLeft: 4,
        },
        saveButton: {
            backgroundColor: colors.primary,
            paddingVertical: 15,
            borderRadius: 12,
            alignItems: 'center',
            marginTop: 30,
            shadowColor: colors.primary,
            shadowOpacity: 0.3,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 6,
            elevation: 5,
        },
        buttonDisabled: {
            backgroundColor: colors.subtleText,
            shadowOpacity: 0,
            elevation: 0,
        },
        saveButtonText: {
            color: '#fff',
            fontSize: 17,
            fontWeight: 'bold',
        },
    });