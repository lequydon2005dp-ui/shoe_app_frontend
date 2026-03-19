import React, { useContext, useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ActivityIndicator,
    Alert,
} from "react-native";

// 1. IMPORT CÁC THƯ VIỆN CẦN THIẾT CHO GEMINI
import { GoogleGenAI } from "@google/genai";

import { ThemeContext } from "../../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";


// --- CẤU HÌNH VÀ HÀM GỌI GEMINI API ---

// Khởi tạo client Gemini
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });
// Dùng model "gemini-1.0-pro" cho package @google/genai (v1beta)
const GEMINI_MODEL = "gemini-2.5-flash";

/**
 * Hàm gọi API đến Google Gemini để tạo phản hồi.
 * (ĐÃ SỬA LỖI: Chuyển 'systemInstruction' ra làm tham số riêng)
 */
const generateGeminiReply = async (userText) => {
    // Kiểm tra API Key
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
        const errorMsg = "LỖI CẤU HÌNH: Vui lòng kiểm tra file .env và Babel config để load GEMINI_API_KEY.";
        console.error(errorMsg);
        Alert.alert("Lỗi AI", errorMsg);
        return "Xin lỗi, hệ thống AI đang ngoại tuyến do lỗi cấu hình.";
    }

    try {
        // System instruction
        const systemInstructionText = "Bạn là một trợ lý hỗ trợ khách hàng tên là 'Bot Hỗ Trợ Gemini' cho ứng dụng di động. Trả lời thân thiện, chính xác và sử dụng định dạng Markdown (như **in đậm**, \n xuống dòng) nếu cần thiết để dễ đọc. Giữ câu trả lời ngắn gọn và đi thẳng vào vấn đề.";
        // console.log("🚀 ĐANG GỌI API GEMINI VỚI CÂU HỎI:", userText);
        // 1. SỬA LỖI: Gọi API với cú pháp chính xác
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL, // Đã đổi sang model tương thích

            // ---- ĐÂY LÀ PHẦN SỬA LỖI ----
            // systemInstruction được đặt ở đây, BÊN NGOÀI 'contents'
            systemInstruction: {
                parts: [{ text: systemInstructionText }]
            },
            // -----------------------------

            // 'contents' bây giờ CHỈ chứa tin nhắn của người dùng
            contents: [
                {
                    role: "user",
                    parts: [{ text: userText }]
                }
            ],
            config: {
                temperature: 0.5
            }
        });

        // 2. CÁCH LẤY TEXT (vẫn giữ nguyên)
        return response.candidates[0].content.parts[0].text;

    } catch (error) {
        // In ra lỗi thực tế từ API để dễ gỡ rối
        console.error("LỖI GEMINI API:", error);
        Alert.alert("Lỗi Kết Nối", "Không thể kết nối với dịch vụ AI. Vui lòng kiểm tra kết nối mạng.");
        return "Xin lỗi, đã xảy ra lỗi kết nối. Vui lòng thử lại sau!";
    }
};

// --- COMPONENT CHÍNH ---

export default function SupportCenter() {
    const { colors } = useContext(ThemeContext);
    const router = useRouter();
    const styles = dynamicStyles(colors);
    const flatListRef = useRef(null);

    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Chào bạn! Tôi là Bot Hỗ Trợ Gemini, tôi có thể giải đáp mọi thắc mắc về ứng dụng. Bạn cần giúp gì hôm nay?",
            sender: "bot",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
    ]);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    const quickReplies = [
        "Làm sao để đổi mật khẩu?",
        "Ứng dụng bị lỗi đăng nhập",
        "Thông tin thanh toán",
        "Tôi muốn hỏi về chính sách bảo mật", // Quick reply mới cho Gemini
    ];

    // HÀM GỬI TIN NHẮN (ĐÃ CHUYỂN THÀNH ASYNC)
    const sendMessage = async (text = inputText) => {
        const messageText = text.trim();
        if (!messageText) return;

        const userMessage = {
            id: Date.now(),
            text: messageText,
            sender: "user",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // 1. Gửi tin nhắn người dùng
        setMessages(prev => [...prev, userMessage]);
        setInputText("");
        setIsTyping(true);

        // 2. Gọi Gemini API (Sử dụng await)
        const botReply = await generateGeminiReply(messageText);

        // 3. Hiển thị phản hồi
        const botMessage = {
            id: Date.now() + 1,
            text: botReply,
            sender: "bot",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false); // Kết thúc hiệu ứng đang gõ
    };

    const handleQuickReply = (reply) => {
        sendMessage(reply);
    };

    // Cuộn xuống cuối khi có tin nhắn mới
    useEffect(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages]);

    // Render item cho FlatList (Bạn nên dùng thư viện Markdown nếu muốn render văn bản markdown)
    const renderMessageItem = ({ item: msg }) => (
        <View
            style={[
                styles.messageBubble,
                msg.sender === "user" ? styles.userBubble : styles.botBubble,
            ]}
        >
            <View>
                <Text
                    style={[
                        styles.messageText,
                        msg.sender === "user" ? styles.userText : styles.botText,
                    ]}
                >
                    {msg.text}
                </Text>
                <Text style={msg.sender === 'user' ? styles.userTime : styles.botTime}>
                    {msg.time}
                </Text>
            </View>
        </View>
    );

    // Render footer cho FlatList (chứa 'isTyping' và 'quickReplies')
    const renderListFooter = () => (
        <>
            {/* Hiệu ứng đang gõ */}
            {isTyping && (
                <View style={[styles.messageBubble, styles.botBubble, { flexDirection: 'row', alignItems: 'center' }]}>
                    <ActivityIndicator size="small" color={colors.subtleText || "#888"} />
                    <Text style={styles.typingText}>Bot Hỗ Trợ Gemini đang soạn tin...</Text>
                </View>
            )}

            {/* Quick Replies chỉ hiển thị khi CHƯA có tin nhắn từ người dùng */}
            {messages.length === 1 && (
                <View style={styles.quickReplies}>
                    {quickReplies.map((reply, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.quickReplyBtn}
                            onPress={() => handleQuickReply(reply)}
                        >
                            <Text style={styles.quickReplyText}>{reply}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
            <View style={{ height: 16 }} />
        </>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'android' ? 30 : 0 }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Trung tâm hỗ trợ 🤖 Gemini</Text>
                    <View style={{ width: 32 }} />
                </View>

                {/* Danh sách tin nhắn */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessageItem}
                    keyExtractor={(item) => item.id.toString()}
                    style={styles.chatContainer}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={renderListFooter}
                />

                {/* Ô nhập tin nhắn */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Nhập tin nhắn..."
                        placeholderTextColor={colors.subtleText || "#888"}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            { backgroundColor: inputText.trim() && !isTyping ? colors.primary : colors.border || "#ccc" } // Disable khi đang gõ
                        ]}
                        onPress={() => sendMessage()}
                        disabled={!inputText.trim() || isTyping} // Disable khi đang gõ
                    >
                        <Ionicons name="send" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// --- STYLES (Giữ nguyên hoặc điều chỉnh nhẹ) ---

const dynamicStyles = (colors) =>
    StyleSheet.create({
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border || "#eee",
            backgroundColor: colors.background,
        },
        backBtn: {
            padding: 4,
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: "700",
            color: colors.text,
        },
        chatContainer: {
            flex: 1,
            paddingHorizontal: 16,
            paddingTop: 8,
        },
        messageBubble: {
            maxWidth: "80%",
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 16,
            marginVertical: 4,
            flexDirection: 'column', // Đảm bảo text và time được xếp chồng
        },
        userBubble: {
            alignSelf: "flex-end",
            backgroundColor: colors.primary,
            borderBottomRightRadius: 4,
        },
        botBubble: {
            alignSelf: "flex-start",
            backgroundColor: colors.card || "#f0f0f0",
            borderBottomLeftRadius: 4,
        },
        messageText: {
            fontSize: 15,
            lineHeight: 20,
            marginBottom: 4,
        },
        userText: {
            color: "#fff",
        },
        botText: {
            color: colors.text,
        },
        userTime: {
            fontSize: 10,
            color: "rgba(255,255,255,0.7)",
            alignSelf: "flex-end",
        },
        botTime: {
            fontSize: 10,
            color: colors.subtleText || "#888",
            alignSelf: "flex-end",
        },
        typingText: {
            color: colors.subtleText || "#888",
            fontStyle: "italic",
            marginLeft: 8,
            fontSize: 14,
        },
        quickReplies: {
            flexDirection: "row",
            flexWrap: "wrap",
            marginTop: 16,
            marginBottom: 10,
        },
        quickReplyBtn: {
            backgroundColor: colors.card || "#f0f0f0",
            borderWidth: 1,
            borderColor: colors.border || "#ddd",
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 20,
            marginRight: 8,
            marginBottom: 8,
        },
        quickReplyText: {
            fontSize: 14,
            color: colors.primary,
            fontWeight: "600",
        },
        inputContainer: {
            flexDirection: "row",
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderTopWidth: 1,
            borderTopColor: colors.border || "#eee",
            backgroundColor: colors.background,
            alignItems: "flex-end",
        },
        textInput: {
            flex: 1,
            backgroundColor: colors.card || "#f0f0f0",
            borderRadius: 22,
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: 10,
            fontSize: 16,
            color: colors.text,
            marginRight: 12,
            minHeight: 44,
            maxHeight: 120,
            lineHeight: 22,
        },
        sendButton: {
            width: 44,
            height: 44,
            borderRadius: 22,
            justifyContent: "center",
            alignItems: "center",
        },
    }
    );