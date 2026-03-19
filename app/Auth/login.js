import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import React, { useContext, useState } from 'react';
import { useRouter, Link } from 'expo-router';
import { ThemeContext } from '../../context/ThemeContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { AuthContext } from '../../context/Authentication';
 // Sửa lại đường dẫn import cho đúng

export default function Login() {
    const { colors } = useContext(ThemeContext);
    const { login, isLoading } = useContext(AuthContext); // Lấy hàm login và state isLoading từ context
    const styles = dynamicStyles(colors);
    const router = useRouter();

    // State cho email, password và hiển thị mật khẩu
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);

    const toggleSecureEntry = () => {
        setSecureTextEntry(!secureTextEntry);
    };

    // Hàm xử lý khi nhấn nút Sign In
    const handleSignIn = async () => {
        if (!email || !password) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu.');
            return;
        }

        const result = await login(email, password);

        // Nếu đăng nhập thất bại, hiển thị thông báo lỗi
        if (result && result.error) {
            Alert.alert('Đăng nhập thất bại', result.message);
        }
        // Nếu thành công, AuthContext sẽ tự động cập nhật state
        // và RootLayout sẽ xử lý việc chuyển hướng sang trang chính.
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Hello Again!</Text>
                    <Text style={styles.subtitle}>Welcome Back, You've Been Missed!</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="alisonbecker@gmail.com"
                        placeholderTextColor={colors.subtleText}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <Text style={styles.label}>Password</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="**********"
                            placeholderTextColor={colors.subtleText}
                            secureTextEntry={secureTextEntry}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={toggleSecureEntry} style={styles.eyeIcon}>
                            <FontAwesome name={secureTextEntry ? 'eye-slash' : 'eye'} size={20} color={colors.subtleText} />
                        </TouchableOpacity>
                    </View>
                    <Link href="/Auth/forgot-password" asChild>
                        <Text style={styles.forgotPassword}>Recovery Password</Text>
                    </Link>

                    <TouchableOpacity style={styles.signInButton} onPress={handleSignIn} disabled={isLoading}>
                        {isLoading ? (
                            <ActivityIndicator color={colors.buttonText} />
                        ) : (
                            <Text style={styles.buttonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.googleButton}>
                        <FontAwesome name="google" size={20} color={colors.text} />
                        <Text style={styles.googleButtonText}>Sign in with Google</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't Have An Account? </Text>
                    <Link href="/Auth/signup" asChild>
                         <Text style={[styles.footerText, { color: colors.primary, fontWeight: 'bold' }]}>Sign Up For Free</Text>
                    </Link>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const dynamicStyles = (colors) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background, paddingTop: 40 },
    container: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
    header: { alignItems: 'center', marginBottom: 40 },
    title: { fontSize: 32, fontWeight: 'bold', color: colors.text },
    subtitle: { fontSize: 16, color: colors.subtleText, marginTop: 8, textAlign: 'center' },
    form: {},
    label: { fontSize: 14, color: colors.text, marginBottom: 8, marginTop: 16 },
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
    passwordContainer: { position: 'relative', justifyContent: 'center' },
    eyeIcon: { position: 'absolute', right: 16, padding: 4 },
    forgotPassword: { textAlign: 'right', color: colors.subtleText, marginVertical: 12 },
    signInButton: {
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        height: 55,
        justifyContent: 'center',
    },
    buttonText: { color: colors.buttonText, fontSize: 16, fontWeight: 'bold' },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.card,
        padding: 16,
        borderRadius: 8,
        marginTop: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    googleButtonText: { color: colors.text, fontSize: 16, fontWeight: '500', marginLeft: 12 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 'auto', paddingBottom: 20 },
    footerText: { color: colors.subtleText, fontSize: 14 },
});

