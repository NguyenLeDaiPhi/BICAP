// app/services/authService.ts
import axiosInstance from './axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosError } from 'axios';

// ==============================================
// INTERFACES / TYPES
// ==============================================
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    fullName?: string;
    phone?: string;
}

export interface UserProfile {
    id: string | number;
    email: string;
    fullName?: string;
    phone?: string;
    role?: string;
    avatarUrl?: string;
}

export interface AuthResponse {
    token: string;
    refreshToken?: string;
    user?: UserProfile;
    message?: string;
}

export interface ApiError {
    message: string;
    status?: number;
    code?: string;
}

// ==============================================
// AUTH SERVICE
// ==============================================
export const authService = {
    /**
     * Đăng nhập - Gọi qua Kong API Gateway
     * Kong route: /api/auth -> auth-service:8080
     * 
     * NOTE: auth-service returns a plain string token, not a JSON object
     */
    login: async (email: string, password: string): Promise<AuthResponse> => {
        try {
            // Endpoint: POST /api/auth/login (Kong route tới auth-service)
            // auth-service returns ResponseEntity.ok(token) where token is a plain string
            const response = await axiosInstance.post<string>('/api/auth/login', { 
                email, 
                password 
            });
            
            // Response.data is a string token, not an object
            // auth-service returns ResponseEntity.ok(token) where token is a plain string
            const token = typeof response.data === 'string' ? response.data : response.data?.token || response.data;
            
            if (!token || typeof token !== 'string') {
                console.error('[AuthService] Invalid token received:', typeof response.data, response.data);
                throw new Error('Không nhận được token từ server');
            }
            
            // Debug log in development
            if (__DEV__) {
                console.log('[AuthService] Login successful, token length:', token.length);
            }
            
            // Lưu token vào AsyncStorage
            await AsyncStorage.setItem('userToken', token);
            
            // Return AuthResponse format for consistency
            const authResponse: AuthResponse = {
                token: token,
                message: 'Đăng nhập thành công'
            };
            
            return authResponse;
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string } | string>;
            
            // Handle string error response (auth-service returns "Invalid credentials" as string)
            let errorMessage = 'Đăng nhập thất bại';
            if (axiosError.response) {
                if (typeof axiosError.response.data === 'string') {
                    errorMessage = axiosError.response.data;
                } else if (axiosError.response.data?.message) {
                    errorMessage = axiosError.response.data.message;
                } else {
                    errorMessage = `Lỗi ${axiosError.response.status}: ${axiosError.response.statusText}`;
                }
            } else if (axiosError.message) {
                errorMessage = axiosError.message;
            }
            
            console.error('[AuthService] Login error:', errorMessage, error);
            throw new Error(errorMessage);
        }
    },

    /**
     * Đăng ký tài khoản mới
     */
    register: async (data: RegisterData): Promise<AuthResponse> => {
        try {
            const response = await axiosInstance.post<AuthResponse>('/api/auth/register', data);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Đăng ký thất bại';
            throw new Error(errorMessage);
        }
    },

    /**
     * Đăng xuất - Xóa token và dữ liệu local
     */
    logout: async (): Promise<void> => {
        try {
            // Gọi API logout nếu backend cần (optional)
            // await axiosInstance.post('/api/auth/logout');
            
            // Xóa tất cả dữ liệu auth từ local storage
            await AsyncStorage.multiRemove([
                'userToken',
                'refreshToken', 
                'userData'
            ]);
        } catch (error) {
            console.error('[AuthService] Logout error:', error);
            // Vẫn xóa local data dù có lỗi
            await AsyncStorage.multiRemove(['userToken', 'refreshToken', 'userData']);
        }
    },

    /**
     * Lấy thông tin profile của user đang đăng nhập
     */
    getProfile: async (): Promise<UserProfile> => {
        try {
            const response = await axiosInstance.get<UserProfile>('/api/auth/profile');
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Không thể lấy thông tin profile';
            throw new Error(errorMessage);
        }
    },

    /**
     * Cập nhật thông tin profile
     */
    updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
        try {
            const response = await axiosInstance.put<UserProfile>('/api/update/profile', data);
            
            // Cập nhật lại userData trong storage
            if (response.data) {
                await AsyncStorage.setItem('userData', JSON.stringify(response.data));
            }
            
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Cập nhật profile thất bại';
            throw new Error(errorMessage);
        }
    },

    /**
     * Refresh token khi token cũ hết hạn
     */
    refreshToken: async (): Promise<string | null> => {
        try {
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            if (!refreshToken) {
                return null;
            }
            
            const response = await axiosInstance.post<{ token: string }>('/api/auth/refresh', {
                refreshToken
            });
            
            const newToken = response.data.token;
            await AsyncStorage.setItem('userToken', newToken);
            
            return newToken;
        } catch (error) {
            console.error('[AuthService] Refresh token failed:', error);
            return null;
        }
    },

    /**
     * Kiểm tra xem user đã đăng nhập chưa
     */
    isAuthenticated: async (): Promise<boolean> => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            return !!token;
        } catch {
            return false;
        }
    },

    /**
     * Lấy token hiện tại
     */
    getToken: async (): Promise<string | null> => {
        return AsyncStorage.getItem('userToken');
    },

    /**
     * Lấy dữ liệu user đã lưu local
     */
    getStoredUser: async (): Promise<UserProfile | null> => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            return userData ? JSON.parse(userData) : null;
        } catch {
            return null;
        }
    },

    /**
     * Đổi mật khẩu
     */
    changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
        try {
            await axiosInstance.post('/api/auth/change-password', {
                oldPassword,
                newPassword
            });
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Đổi mật khẩu thất bại';
            throw new Error(errorMessage);
        }
    },
};