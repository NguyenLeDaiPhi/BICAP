// app/(tabs)/profile.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
    Appbar, 
    Avatar, 
    Text, 
    List, 
    Divider, 
    Button, 
    Card,
    ActivityIndicator,
    Switch 
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, UserProfile } from '../services/authService';
import { API_CONFIG, setCustomBaseUrl, getCurrentBaseUrl } from '../services/axiosInstance';

export default function ProfileScreen() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            setIsLoading(true);
            // Thử lấy từ API trước
            try {
                const profile = await authService.getProfile();
                setUser(profile);
                return;
            } catch {
                // Fallback: Lấy từ local storage
                const storedUser = await authService.getStoredUser();
                if (storedUser) {
                    setUser(storedUser);
                } else {
                    // Mock data nếu chưa có
                    setUser({
                        id: 1,
                        email: 'driver@bicap.com',
                        fullName: 'Tài Xế BiCap',
                        phone: '0901234567',
                        role: 'DELIVERYDRIVER',
                    });
                }
            }
        } catch (error) {
            console.error('[Profile] Load user error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Đăng xuất',
            'Bạn có chắc muốn đăng xuất?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đăng xuất',
                    style: 'destructive',
                    onPress: async () => {
                        await authService.logout();
                        router.replace('/');
                    },
                },
            ]
        );
    };

    const handleChangeApiUrl = () => {
        Alert.prompt(
            'Cấu hình API',
            `URL hiện tại: ${getCurrentBaseUrl()}\n\nNhập IP LAN của máy tính (VD: 192.168.1.4):`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Lưu',
                    onPress: (ip: string | undefined) => {
                        if (ip) {
                            const newUrl = `http://${ip}:8000`;
                            setCustomBaseUrl(newUrl);
                            Alert.alert('Thành công', `Đã đổi URL thành: ${newUrl}`);
                        }
                    },
                },
            ],
            'plain-text',
            API_CONFIG.LAN_IP
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#2196F3" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.Content title="Tài khoản" />
                <Appbar.Action icon="cog" onPress={handleChangeApiUrl} />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Profile Card */}
                <Card style={styles.profileCard}>
                    <Card.Content style={styles.profileContent}>
                        <Avatar.Icon 
                            size={80} 
                            icon="account" 
                            style={styles.avatar}
                        />
                        <Text variant="titleLarge" style={styles.name}>
                            {user?.fullName || 'Tài xế'}
                        </Text>
                        <Text variant="bodyMedium" style={styles.email}>
                            {user?.email}
                        </Text>
                        <View style={styles.roleBadge}>
                            <MaterialCommunityIcons name="truck" size={16} color="#2196F3" />
                            <Text style={styles.roleText}>Tài xế giao hàng</Text>
                        </View>
                    </Card.Content>
                </Card>

                {/* Stats Card */}
                <Card style={styles.statsCard}>
                    <Card.Content style={styles.statsContent}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>24</Text>
                            <Text style={styles.statLabel}>Đơn hoàn thành</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>4.8</Text>
                            <Text style={styles.statLabel}>Đánh giá</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>98%</Text>
                            <Text style={styles.statLabel}>Đúng giờ</Text>
                        </View>
                    </Card.Content>
                </Card>

                {/* Settings Section */}
                <Card style={styles.settingsCard}>
                    <List.Section>
                        <List.Subheader>Cài đặt</List.Subheader>
                        
                        <List.Item
                            title="Thông báo"
                            description="Nhận thông báo về đơn hàng mới"
                            left={props => <List.Icon {...props} icon="bell" />}
                            right={() => (
                                <Switch
                                    value={notificationsEnabled}
                                    onValueChange={setNotificationsEnabled}
                                />
                            )}
                        />
                        <Divider />
                        
                        <List.Item
                            title="Thông tin cá nhân"
                            description="Cập nhật thông tin tài khoản"
                            left={props => <List.Icon {...props} icon="account-edit" />}
                            right={props => <List.Icon {...props} icon="chevron-right" />}
                            onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}
                        />
                        <Divider />
                        
                        <List.Item
                            title="Đổi mật khẩu"
                            left={props => <List.Icon {...props} icon="lock" />}
                            right={props => <List.Icon {...props} icon="chevron-right" />}
                            onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}
                        />
                        <Divider />
                        
                        <List.Item
                            title="Cấu hình API Server"
                            description={`URL: ${getCurrentBaseUrl()}`}
                            left={props => <List.Icon {...props} icon="server" />}
                            right={props => <List.Icon {...props} icon="chevron-right" />}
                            onPress={handleChangeApiUrl}
                        />
                    </List.Section>
                </Card>

                {/* Support Section */}
                <Card style={styles.settingsCard}>
                    <List.Section>
                        <List.Subheader>Hỗ trợ</List.Subheader>
                        
                        <List.Item
                            title="Trung tâm hỗ trợ"
                            left={props => <List.Icon {...props} icon="help-circle" />}
                            right={props => <List.Icon {...props} icon="chevron-right" />}
                            onPress={() => Alert.alert('Hỗ trợ', 'Hotline: 1900-BICAP')}
                        />
                        <Divider />
                        
                        <List.Item
                            title="Điều khoản sử dụng"
                            left={props => <List.Icon {...props} icon="file-document" />}
                            right={props => <List.Icon {...props} icon="chevron-right" />}
                        />
                        <Divider />
                        
                        <List.Item
                            title="Phiên bản ứng dụng"
                            description="v1.0.0"
                            left={props => <List.Icon {...props} icon="information" />}
                        />
                    </List.Section>
                </Card>

                {/* Logout Button */}
                <Button
                    mode="outlined"
                    icon="logout"
                    textColor="#D32F2F"
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    Đăng xuất
                </Button>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 15,
        paddingBottom: 30,
    },
    profileCard: {
        marginBottom: 15,
        backgroundColor: 'white',
    },
    profileContent: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    avatar: {
        backgroundColor: '#2196F3',
    },
    name: {
        marginTop: 15,
        fontWeight: 'bold',
    },
    email: {
        color: '#666',
        marginTop: 5,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#E3F2FD',
        borderRadius: 20,
    },
    roleText: {
        marginLeft: 5,
        color: '#2196F3',
        fontWeight: '500',
    },
    statsCard: {
        marginBottom: 15,
        backgroundColor: 'white',
    },
    statsContent: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 15,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
    },
    statDivider: {
        width: 1,
        backgroundColor: '#ddd',
    },
    settingsCard: {
        marginBottom: 15,
        backgroundColor: 'white',
    },
    logoutButton: {
        marginTop: 10,
        borderColor: '#D32F2F',
    },
});
