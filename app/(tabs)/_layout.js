import { View } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { ThemeProvider } from '../../context/ThemeContext'

export default function _Layout() {
  return (
    <ThemeProvider>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 10,
            left: 20,
            right: 20,
            backgroundColor: '#fff',
            borderRadius: 20,
            height: 70,
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowOffset: { width: 0, height: 10 },
            shadowRadius: 10,
            elevation: 5,
          },
        }}
      >
        {/* 🏠 Trang chủ */}
        <Tabs.Screen
          name='index'
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                color={focused ? '#4C9EF1' : '#748c94'}
                size={26}
              />
            ),
          }}
        />
        {/* 📦 Sản phẩm */}
        <Tabs.Screen
          name='Product'
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'cube' : 'cube-outline'}
                color={focused ? '#4C9EF1' : '#748c94'}
                size={26}
              />
            ),
          }}
        />


        {/* 🛍️ Giỏ hàng (ở giữa, nổi bật) */}
        <Tabs.Screen
          name='Cart'
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  top: -25,
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: '#4C9EF1',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons
                  name="bag-outline"
                  size={28}
                  color="#fff"
                />
              </View>
            ),
          }}
        />

        {/* ❤️ Yêu thích */}
        <Tabs.Screen
          name='Favorite'
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'heart' : 'heart-outline'}
                color={focused ? '#4C9EF1' : '#748c94'}
                size={26}
              />
            ),
          }}
        />

        {/* 👤 Hồ sơ */}
        <Tabs.Screen
          name='Setting'
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                color={focused ? '#4C9EF1' : '#748c94'}
                size={26}
              />
            ),
          }}
        />
      </Tabs>
    </ThemeProvider>
  )
}
