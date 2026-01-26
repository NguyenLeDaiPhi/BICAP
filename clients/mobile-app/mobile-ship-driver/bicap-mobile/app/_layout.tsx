// app/_layout.tsx
import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';

// Giữ splash screen hiển thị cho đến khi app sẵn sàng
SplashScreen.preventAutoHideAsync();

// Custom theme cho app
const theme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: '#2196F3',        // Màu xanh logistics
        secondary: '#FF9800',      // Màu cam cho trạng thái pending
        tertiary: '#4CAF50',       // Màu xanh lá cho success
        error: '#D32F2F',          // Màu đỏ cho error/report
        background: '#f5f5f5',
        surface: '#ffffff',
    },
};

// Context để quản lý auth state (optional - có thể dùng Zustand/Redux)
export const AuthContext = React.createContext<{
    signIn: (token: string) => void;
    signOut: () => void;
    isLoading: boolean;
    userToken: string | null;
}>({
    signIn: () => {},
    signOut: () => {},
    isLoading: true,
    userToken: null,
});

export default function RootLayout() {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState<string | null>(null);
    const router = useRouter();
    const segments = useSegments();

    // Kiểm tra auth state khi app khởi động
    useEffect(() => {
        const bootstrapAsync = async () => {
            try {
                // Lấy token từ storage
                const token = await AsyncStorage.getItem('userToken');
                setUserToken(token);
            } catch (error) {
                console.error('[Auth] Error loading token:', error);
            } finally {
                setIsLoading(false);
                // Ẩn splash screen
                await SplashScreen.hideAsync();
            }
        };

        bootstrapAsync();
    }, []);

    // Xử lý navigation dựa trên auth state
    useEffect(() => {
        if (isLoading) return;

        const currentSegment = segments[0] as string;
        const inAuthGroup = currentSegment === '(auth)' || currentSegment === 'login';
        const inTabsGroup = currentSegment === '(tabs)';

        if (!userToken && !inAuthGroup) {
            // Chưa đăng nhập và không ở auth screens -> redirect to login
            // Có thể uncomment nếu cần bắt buộc đăng nhập
            // router.replace('/login');
        } else if (userToken && inAuthGroup) {
            // Đã đăng nhập nhưng đang ở auth screens -> redirect to main
            router.replace('/(tabs)');
        }
    }, [userToken, segments, isLoading]);

    // Auth context functions
    const authContext = React.useMemo(
        () => ({
            signIn: async (token: string) => {
                await AsyncStorage.setItem('userToken', token);
                setUserToken(token);
            },
            signOut: async () => {
                await AsyncStorage.multiRemove(['userToken', 'refreshToken', 'userData']);
                setUserToken(null);
                router.replace('/');
            },
            isLoading,
            userToken,
        }),
        [isLoading, userToken]
    );

    // Loading screen
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2196F3" />
            </View>
        );
    }

    return (
        <AuthContext.Provider value={authContext}>
            <PaperProvider theme={theme}>
                <StatusBar style="auto" />
                <Stack
                    screenOptions={{
                        headerShown: false,
                        animation: 'slide_from_right',
                    }}
                >
                    {/* Tab screens - Main app */}
                    <Stack.Screen 
                        name="(tabs)" 
                        options={{ headerShown: false }} 
                    />
                    
                    {/* Shipment detail screen */}
                    <Stack.Screen 
                        name="shipment/[id]" 
                        options={{ 
                            headerShown: false,
                            presentation: 'card',
                        }} 
                    />
                    
                    {/* QR Scan screen */}
                    <Stack.Screen 
                        name="scan/[type]" 
                        options={{ 
                            headerShown: false,
                            presentation: 'fullScreenModal',
                            animation: 'fade',
                        }} 
                    />
                    
                    {/* Report issue screen */}
                    <Stack.Screen 
                        name="report/[id]" 
                        options={{ 
                            headerShown: false,
                            presentation: 'modal',
                        }} 
                    />
                    
                    {/* Login screen (nếu có) */}
                    <Stack.Screen 
                        name="login" 
                        options={{ 
                            headerShown: false,
                            presentation: 'card',
                        }} 
                    />
                </Stack>
            </PaperProvider>
        </AuthContext.Provider>
    );
}

// Hook để sử dụng auth context
export function useAuth() {
    return React.useContext(AuthContext);
}
