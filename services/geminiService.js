import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from '@env';
import { Alert } from 'react-native';

// Khởi tạo client Gemini
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
// Dùng 1.5-flash cho ổn định
const GEMINI_MODEL = "gemini-1.5-flash"; 

/**
 * Hàm gọi API đến Google Gemini để tạo phản hồi.
 * (ĐÃ SỬA LẠI ĐỂ DÙNG CÚ PHÁP CỦA @google/genai)
 */
const generateGeminiReply = async (userText) => {
    // Kiểm tra API Key
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        const errorMsg = "LỖI CẤU HÌNH: Vui lòng kiểm tra file .env và Babel config để load GEMINI_API_KEY.";
        console.error(errorMsg);
        Alert.alert("Lỗi AI", errorMsg);
        return "Xin lỗi, hệ thống AI đang ngoại tuyến do lỗi cấu hình.";
    }

    try {
        // System instruction
        const systemInstruction = "Bạn là một trợ lý hỗ trợ khách hàng tên là 'Bot Hỗ Trợ Gemini' cho ứng dụng di động. Trả lời thân thiện, chính xác và sử dụng định dạng Markdown (như **in đậm**, \n xuống dòng) nếu cần thiết để dễ đọc. Giữ câu trả lời ngắn gọn và đi thẳng vào vấn đề.";

        // 1. SỬ DỤNG CÚ PHÁP CŨ: ai.models.generateContent
        // Đây là hàm chính xác cho package @google/genai
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                // Phiên bản này đặt system instruction chung với contents
                {
                    role: "system",
                    parts: [{ text: systemInstruction }]
                },
                {
                    role: "user",
                    parts: [{ text: userText }]
                }
            ],
            config: {
                temperature: 0.5
            }
        });

        // 2. CÁCH LẤY TEXT CHÍNH XÁC CHO PHIÊN BẢN NÀY
        // Nó nằm trong candidates[0].content.parts[0].text
        return response.candidates[0].content.parts[0].text;

    } catch (error) {
        // In ra lỗi thực tế từ API để dễ gỡ rối
        console.error("LỖI GEMINI API:", error); 
        Alert.alert("Lỗi Kết Nối", "Không thể kết nối với dịch vụ AI. Vui lòng kiểm tra kết nối mạng.");
        return "Xin lỗi, đã xảy ra lỗi kết nối. Vui lòng thử lại sau!";
    }

};