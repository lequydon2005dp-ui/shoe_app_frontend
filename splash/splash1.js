import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, Dimensions, FlatList, Animated } from 'react-native';
import React, { useState, useRef, useContext } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeContext } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        image: require('../assets/anh1.png'), // Giả định đường dẫn đúng
        title1: 'Start Journey',
        title2: 'With Nike',
        subtitle: 'Smart, Gorgeous & Fashionable Collection',
    },
    {
        id: '2',
        image: require('../assets/anh2.png'), // Giả định đường dẫn đúng
        title1: 'Follow Latest',
        title2: 'Style Shoes',
        subtitle: 'There Are Many Beautiful And Attractive Plants To Your Room',
    },
    {
        id: '3',
        image: require('../assets/anh3.png'), // Giả định đường dẫn đúng
        title1: 'Summer Shoes',
        title2: 'Nike 2022',
        subtitle: 'Amet Minim Lit Nadeseru Saku Nandu sit Alique Dolor',
    },
];

const OnboardingItem = ({ item, styles }) => (
    <View style={styles.slideContainer}>
        <View style={styles.upperSection}>
            <View style={styles.circle} />
            <Text style={styles.backgroundText}>NIKE</Text>
            <Image
                // SỬA LỖI: Khi dùng require(), chỉ cần truyền trực tiếp vào source
                source={item.image}
                style={styles.shoeImage}
                resizeMode="contain"
            />
        </View>
        <View style={styles.lowerSection}>
            <Text style={styles.title}>{item.title1}</Text>
            <Text style={styles.title}>{item.title2}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>
    </View>
);

export default function OnboardingScreen() {
    const { colors } = useContext(ThemeContext);
    const styles = dynamicStyles(colors);
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef(null);
    const router = useRouter();

    const viewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems[0]) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
        } else {
            handleGetStarted();
        }
    };
    
    const handleGetStarted = async () => {
        try {
            await AsyncStorage.setItem('hasOnboarded', 'true');
            router.replace('/Auth/login');
        } catch (e) {
            console.error("Failed to save 'hasOnboarded' status", e);
            router.replace('/Auth/login');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <FlatList
                data={slides}
                renderItem={({ item }) => <OnboardingItem item={item} styles={styles} />}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                    useNativeDriver: false,
                })}
                scrollEventThrottle={32}
                onViewableItemsChanged={viewableItemsChanged}
                viewabilityConfig={viewConfig}
                ref={slidesRef}
            />
            <View style={styles.bottomContainer}>
                <View style={styles.progressDotsContainer}>
                    {slides.map((_, i) => {
                        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [10, 25, 10],
                            extrapolate: 'clamp',
                        });
                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });
                        return <Animated.View key={i.toString()} style={[styles.progressDot, { width: dotWidth, opacity }]} />;
                    })}
                </View>

                <TouchableOpacity onPress={handleNext} style={styles.button}>
                     <LinearGradient
                        colors={[colors.primary, '#4A90E2']}
                        style={styles.gradient}
                    >
                        <Text style={styles.buttonText}>
                            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const dynamicStyles = (colors) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    slideContainer: { width: width, height: '100%' },
    upperSection: {
        height: '60%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    circle: {
        position: 'absolute',
        width: width * 0.9,
        height: width * 0.9,
        borderRadius: (width * 0.9) / 2,
        backgroundColor: colors.card,
    },
    backgroundText: {
        fontSize: 150,
        fontWeight: 'bold',
        color: 'rgba(100, 100, 100, 0.05)',
        position: 'absolute',
    },
    shoeImage: {
        width: '90%',
        height: '90%',
        transform: [{ rotate: '-15deg' }],
    },
    lowerSection: {
        height: '40%',
        paddingHorizontal: 30,
        paddingTop: 20,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: colors.text,
    },
    subtitle: {
        fontSize: 16,
        color: colors.subtleText,
        marginTop: 15,
        lineHeight: 24,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressDotsContainer: {
        flexDirection: 'row',
    },
    progressDot: {
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
        marginHorizontal: 4,
    },
    button: {
        borderRadius: 25,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    gradient: {
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 25,
    },
    buttonText: {
        color: colors.buttonText,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

