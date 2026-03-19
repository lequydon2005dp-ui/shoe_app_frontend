import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useContext, useState } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

import { Link } from 'expo-router';
import { AuthContext } from '../../context/Authentication';

export default function ForgotPasswordScreen() {
    const { colors } = useContext(ThemeContext);
    const { forgotPassword } = useContext(AuthContext); // ← LẤY HÀM
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const styles = dynamicStyles(colors);

    const handleSubmit = async () => {
        if (!email.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập email');
            return;
        }

        setLoading(true);
        const result = await forgotPassword(email);
        setLoading(false);

        if (result.success) {
            Alert.alert(
                'Thành công',
                result.message || 'Link đặt lại mật khẩu đã được gửi!',
                [{ text: 'OK' }]
            );
        } else {
            Alert.alert('Lỗi', result.error || 'Không thể gửi email');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Text style={styles.title}>Quên mật khẩu</Text>

            <View style={styles.container}>
                <Text style={styles.label}>Địa chỉ Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="alisonbecker@gmail.com"
                    placeholderTextColor={colors.subtleText}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    editable={!loading}
                />

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.buttonText} />
                    ) : (
                        <Text style={styles.buttonText}>Gửi yêu cầu</Text>
                    )}
                </TouchableOpacity>

                <Link href="/Auth/login" asChild>
                    <TouchableOpacity style={styles.backButton}>
                        <Text style={styles.backButtonText}>Quay lại Đăng nhập</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </SafeAreaView>
    );
}

const dynamicStyles = (colors) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 40,
        textAlign: 'center',
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    label: {
        fontSize: 14,
        color: colors.text,
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        height: 50,
        backgroundColor: colors.card,
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
    },
    button: {
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 30,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: colors.buttonText,
        fontSize: 16,
        fontWeight: 'bold',
    },
    backButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    backButtonText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
});