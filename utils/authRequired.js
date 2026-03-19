// utils/authRequired.js
import { useContext } from 'react';
import { AuthContext } from '../context/Authentication';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

export const useAuthRequired = () => {
    const { userInfo } = useContext(AuthContext);
    const router = useRouter();

    const requireLogin = (action) => {
        if (!userInfo) {
            Alert.alert(
                "Yêu cầu đăng nhập",
                "Bạn cần đăng nhập để thực hiện hành động này.",
                [
                    { text: "Hủy", style: "cancel" },
                    {
                        text: "Đăng nhập",
                        onPress: () => router.push('/Auth/login')
                    }
                ]
            );
            return false;
        }
        return true;
    };

    return { requireLogin };
};