import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

// Tạo Context
export const ThemeContext = createContext();

// Bảng màu cho các theme
const lightColors = {
    background: '#f9f9f9',
    card: '#ffffff',
    text: '#212529',
    subtleText: '#6c757d',
    primary: '#007bff',
    danger: '#e63946',
    border: '#e9ecef',
    placeholder: '#f0f0f0',
    buttonText: '#ffffff',
};

const darkColors = {
    background: '#121212',
    card: '#1e1e1e',
    text: '#ffffff',
    subtleText: '#adb5bd',
    primary: '#0d6efd',
    danger: '#dc3545',
    border: '#343a40',
    placeholder: '#333333',
    buttonText: '#ffffff',
};


// Component Provider
export const ThemeProvider = ({ children }) => {
    const colorScheme = useColorScheme(); // Lấy theme mặc định của hệ thống
    const [theme, setTheme] = useState(colorScheme || 'light');

    // Tự động cập nhật nếu người dùng đổi theme hệ thống
    useEffect(() => {
        if (colorScheme) {
            setTheme(colorScheme);
        }
    }, [colorScheme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const colors = theme === 'dark' ? darkColors : lightColors;

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
            {children}
        </ThemeContext.Provider>
    );
};

