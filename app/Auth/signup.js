import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import React, { useContext, useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { ThemeContext } from '../../context/ThemeContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { AuthContext } from '../../context/Authentication';

export default function Signup() {
    const { colors } = useContext(ThemeContext);
    const { register, isLoading } = useContext(AuthContext);
    const styles = dynamicStyles(colors);
    const router = useRouter();

    // State cho các trường input
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState(''); // THÊM MỚI: State cho số điện thoại
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    
    // State cho UI
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [secureTextEntryConfirm, setSecureTextEntryConfirm] = useState(true);

    const handleSignUp = async () => {
        if (password !== passwordConfirmation) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
            return;
        }

        // CẬP NHẬT: Gửi thêm `phone` khi gọi hàm register
        const result = await register(name, email, phone, password, passwordConfirmation);

        if (result && !result.error) {
            Alert.alert('Thành công', 'Tài khoản của bạn đã được tạo. Vui lòng đăng nhập.');
            router.push('/Auth/login');
        } else {
            let errorMessage = result.message || 'Đã xảy ra lỗi không xác định.';
            if (result.errors) {
                const firstErrorKey = Object.keys(result.errors)[0];
                errorMessage = result.errors[firstErrorKey][0];
            }
            Alert.alert('Đăng ký thất bại', errorMessage);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <Text style={styles.title}>Create Account</Text>
                <View style={styles.form}>
                    <Text style={styles.label}>Your Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        placeholderTextColor={colors.subtleText}
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor={colors.subtleText}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />

                    {/* THÊM MỚI: Ô nhập số điện thoại */}
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Phone"
                        placeholderTextColor={colors.subtleText}
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                    />

                    <Text style={styles.label}>Password</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Ít nhất 6 ký tự"
                            placeholderTextColor={colors.subtleText}
                            secureTextEntry={secureTextEntry}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)} style={styles.eyeIcon}>
                            <FontAwesome name={secureTextEntry ? 'eye-slash' : 'eye'} size={20} color={colors.subtleText} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>Confirm Password</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập lại mật khẩu"
                            placeholderTextColor={colors.subtleText}
                            secureTextEntry={secureTextEntryConfirm}
                            value={passwordConfirmation}
                            onChangeText={setPasswordConfirmation}
                        />
                        <TouchableOpacity onPress={() => setSecureTextEntryConfirm(!secureTextEntryConfirm)} style={styles.eyeIcon}>
                            <FontAwesome name={secureTextEntryConfirm ? 'eye-slash' : 'eye'} size={20} color={colors.subtleText} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={isLoading}>
                        {isLoading ? (
                            <ActivityIndicator color={colors.buttonText} />
                        ) : (
                            <Text style={styles.buttonText}>Sign Up</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already Have An Account? </Text>
                    <Link href="/Auth/login" asChild>
                         <Text style={[styles.footerText, { color: colors.primary, fontWeight: 'bold' }]}>Sign In</Text>
                    </Link>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const dynamicStyles = (colors) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background, paddingTop: 30 },
    container: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
    title: { 
        fontSize: 32, 
        fontWeight: 'bold', 
        color: colors.text, 
        marginBottom: 40, 
        textAlign: 'center' 
    },
    form: {},
    label: { 
        fontSize: 14, 
        color: colors.text, 
        marginBottom: 8, 
        marginTop: 16 
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
    passwordContainer: { 
        position: 'relative', 
        justifyContent: 'center' 
    },
    eyeIcon: { 
        position: 'absolute', 
        right: 16, 
        padding: 4 
    },
    button: {
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 30,
        height: 55,
        justifyContent: 'center'
    },
    buttonText: { 
        color: colors.buttonText, 
        fontSize: 16, 
        fontWeight: 'bold' 
    },
    footer: { 
        flexDirection: 'row', 
        justifyContent: 'center', 
        marginTop: 'auto', 
        paddingBottom: 20 
    },
    footerText: { 
        color: colors.subtleText, 
        fontSize: 14 
    },
});

