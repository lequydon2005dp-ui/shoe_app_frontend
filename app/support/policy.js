import React, { useContext } from 'react';
import { ScrollView, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemeContext } from '../../context/ThemeContext'; // Đảm bảo đường dẫn đúng
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

const PolicyContent = ({ colors }) => {
    const styles = dynamicStyles(colors);
    return (
        <>
            <Text style={styles.title}>Điều khoản và Điều kiện</Text>
            <Text style={styles.lastUpdated}>Cập nhật lần cuối: 07/11/2025</Text>

            <Text style={styles.heading}>1. Giới thiệu</Text>
            <Text style={styles.paragraph}>
                Chào mừng bạn đến với SHOE. Bằng cách truy cập hoặc sử dụng ứng dụng di động ("Dịch vụ") của chúng tôi, bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và điều kiện ("Điều khoản") này. Vui lòng đọc kỹ trước khi sử dụng Dịch vụ.
            </Text>

            <Text style={styles.heading}>2. Chính sách Quyền riêng tư</Text>
            <Text style={styles.paragraph}>
                Việc bạn sử dụng Dịch vụ cũng tuân theo Chính sách Quyền riêng tư của chúng tôi, giải thích cách chúng tôi thu thập, sử dụng và tiết lộ thông tin của bạn. Vui lòng xem xét kỹ Chính sách Quyền riêng tư của chúng tôi.
            </Text>

            <Text style={styles.heading}>3. Tài khoản Người dùng</Text>
            <Text style={styles.paragraph}>
                Khi tạo tài khoản với chúng tôi, bạn phải cung cấp thông tin chính xác, đầy đủ và cập nhật. Việc không làm như vậy cấu thành vi phạm Điều khoản, có thể dẫn đến việc chấm dứt ngay lập tức tài khoản của bạn trên Dịch vụ của chúng tôi. Bạn chịu trách nhiệm bảo mật mật khẩu của mình.
            </Text>

            <Text style={styles.heading}>4. Sản phẩm và Mua hàng</Text>
            <Text style={styles.paragraph}>
                Chúng tôi cố gắng hiển thị màu sắc và hình ảnh sản phẩm một cách chính xác nhất có thể. Tuy nhiên, chúng tôi không thể đảm bảo rằng màn hình thiết bị của bạn sẽ hiển thị màu sắc chính xác. Tất cả các mô tả sản phẩm và giá cả có thể thay đổi bất cứ lúc nào mà không cần thông báo.
            </Text>

            <Text style={styles.heading}>5. Chấm dứt</Text>
            <Text style={styles.paragraph}>
                Chúng tôi có thể chấm dứt hoặc đình chỉ quyền truy cập vào Dịch vụ của mình ngay lập tức, mà không cần thông báo trước hoặc chịu trách nhiệm pháp lý, vì bất kỳ lý do gì, bao gồm nhưng không giới hạn nếu bạn vi phạm Điều khoản.
            </Text>

            <Text style={styles.heading}>6. Thay đổi Điều khoản</Text>
            <Text style={styles.paragraph}>
                Chúng tôi có quyền, tùy theo quyết định của mình, sửa đổi hoặc thay thế các Điều khoản này bất kỳ lúc nào. Nếu một bản sửa đổi là quan trọng, chúng tôi sẽ cố gắng cung cấp thông báo ít nhất 30 ngày trước khi bất kỳ điều khoản mới nào có hiệu lực.
            </Text>
            
            <Text style={styles.heading}>7. Liên hệ với Chúng tôi</Text>
            <Text style={styles.paragraph}>
                Nếu bạn có bất kỳ câu hỏi nào về các Điều khoản này, vui lòng liên hệ với chúng tôi qua email: lequydon2005dp@gmail.com hoặc số điện thoại: 0868327457.
            </Text>
        </>
    );
};

// COMPONENT CHÍNH CỦA MÀN HÌNH
export default function PolicyScreen() {
    const { colors } = useContext(ThemeContext);
    const styles = dynamicStyles(colors);
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header tùy chỉnh */}
            <Stack.Screen
                options={{
                    headerTitle: "Chính sách & Điều khoản",
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
            
            <ScrollView 
                style={styles.container} 
                contentContainerStyle={styles.contentContainer}
            >
                <PolicyContent colors={colors} />
            </ScrollView>
        </SafeAreaView>
    );
}

// STYLESHEET
const dynamicStyles = (colors) =>
    StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: colors.background,
        },
        container: {
            flex: 1,
        },
        contentContainer: {
            paddingHorizontal: 20,
            paddingVertical: 24,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 8,
            textAlign: 'center',
        },
        lastUpdated: {
            fontSize: 14,
            color: colors.subtleText,
            marginBottom: 20,
            textAlign: 'center',
            fontStyle: 'italic',
        },
        heading: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginTop: 16,
            marginBottom: 8,
        },
        paragraph: {
            fontSize: 15,
            color: colors.text,
            lineHeight: 23, // Tăng khoảng cách dòng
            textAlign: 'justify', // Căn đều 2 lề
        },
    });