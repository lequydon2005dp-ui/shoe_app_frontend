import React, { useContext, useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { ThemeProvider } from '../context/ThemeContext';
import { CartProvider } from '../context/CartContext';
import { FavoritesProvider } from '../context/FavoritesContext';
import { AuthProvider, AuthContext } from '../context/Authentication';
import Toast from 'react-native-toast-message';

const InitialLayout = () => {
    const { userToken, isLoading } = useContext(AuthContext);
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === 'Auth';
        const isSplashScreen = segments.length === 0;
        const inAppGroup = segments[0] === '(tabs)';

        if (userToken && inAuthGroup) {
            router.replace('/(tabs)');
        } else if (!userToken && !inAuthGroup && !isSplashScreen && !inAppGroup) {
            router.replace('/Auth/login');
        }
    }, [userToken, isLoading, segments, router]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />

            {/* Các màn hình có thể truy cập bất kể trạng thái đăng nhập */}
            <Stack.Screen name="product/[id]" />

            <Stack.Screen name="checkout/Checkout" />
            <Stack.Screen name="account/profile" />
            <Stack.Screen name="notification/Notification" />
            <Stack.Screen name="support/Support" />


            {/* Nhóm màn hình xác thực */}
            <Stack.Screen name="Auth" />
        </Stack>
    );
};


export default function RootLayout() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Toast />
                <FavoritesProvider>
                    <CartProvider>
                        <InitialLayout />
                    </CartProvider>
                </FavoritesProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}