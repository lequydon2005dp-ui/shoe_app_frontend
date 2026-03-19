import { Stack } from 'expo-router';
import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

export default function _Layout() {
    const { colors } = useContext(ThemeContext);
    return (
        <Stack
            screenOptions={{
                headerShown: false, // 👈 Thêm dòng này để ẩn tiêu đề "Auth"
                headerStyle: {
                    backgroundColor: colors.background,
                },
                headerTintColor: colors.text,
                headerShadowVisible: false,
            }}
        >
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ title: 'Create Account' }} />
            <Stack.Screen name="forgot-password" options={{ title: 'Recovery Password' }} />
        </Stack>
    );
}
