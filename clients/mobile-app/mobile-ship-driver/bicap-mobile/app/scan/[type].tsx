import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { CameraView, Camera } from "expo-camera";
import { Button, Text, IconButton } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { shipmentService, ShipmentStatus } from '../services/shipmentService';

export default function QRScanScreen() {
    const { type, shipmentId } = useLocalSearchParams<{ type: string; shipmentId: string }>();
    const router = useRouter();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const handleBarCodeScanned = async ({ type: barcodeType, data }: { type: string; data: string }) => {
        if (scanned || isProcessing) return;
        
        setScanned(true);
        setIsProcessing(true);

        try {
            // Xác định action dựa trên type
            const isPickup = type === 'pickup';
            const status: ShipmentStatus = isPickup ? 'PICKED_UP' : 'DELIVERED';
            const actionText = isPickup ? 'Nhận hàng' : 'Giao hàng';
            
            // Verify QR code với backend (optional)
            // const isValid = await shipmentService.verifyQRCode(data, shipmentId);
            // if (!isValid) {
            //     Alert.alert('Lỗi', 'Mã QR không hợp lệ cho đơn hàng này');
            //     setScanned(false);
            //     setIsProcessing(false);
            //     return;
            // }

            // Hiển thị dialog xác nhận
            Alert.alert(
                "Xác nhận quét mã!",
                `Mã kiện hàng: ${data}\nLoại: ${actionText}\nĐơn hàng: #${shipmentId}`,
                [
                    {
                        text: "Xác nhận & Cập nhật",
                        onPress: async () => {
                            try {
                                // Gọi API cập nhật trạng thái
                                if (shipmentId) {
                                    await shipmentService.updateStatus(shipmentId, status, data);
                                }
                                
                                // Thông báo thành công và quay về
                                Alert.alert(
                                    "Thành công!", 
                                    `Đã ${isPickup ? 'xác nhận nhận hàng' : 'xác nhận giao hàng thành công'}!`,
                                    [
                                        {
                                            text: "OK",
                                            onPress: () => {
                                                // Quay về màn hình trước
                                                router.back();
                                            }
                                        }
                                    ]
                                );
                            } catch (error) {
                                const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi';
                                Alert.alert(
                                    "Lỗi", 
                                    `Không thể cập nhật trạng thái: ${errorMessage}`,
                                    [
                                        {
                                            text: "OK",
                                            onPress: () => {
                                                setScanned(false);
                                                setIsProcessing(false);
                                            }
                                        }
                                    ]
                                );
                            }
                        }
                    },
                    { 
                        text: "Quét lại", 
                        onPress: () => {
                            setScanned(false);
                            setIsProcessing(false);
                        }, 
                        style: "cancel" 
                    }
                ]
            );
        } catch (error) {
            console.error('[QRScan] Error:', error);
            Alert.alert("Lỗi", "Đã xảy ra lỗi khi xử lý mã QR");
            setScanned(false);
        } finally {
            setIsProcessing(false);
        }
    };

    // Loading permission
    if (hasPermission === null) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={{ marginTop: 10, color: 'white' }}>Đang kiểm tra quyền camera...</Text>
            </View>
        );
    }

    // No permission
    if (hasPermission === false) {
        return (
            <View style={[styles.container, styles.centered]}>
                <IconButton icon="camera-off" iconColor="white" size={50} />
                <Text style={styles.permissionText}>Không có quyền truy cập camera</Text>
                <Text style={styles.permissionSubtext}>
                    Vui lòng cấp quyền camera trong Cài đặt để sử dụng tính năng quét QR
                </Text>
                <Button 
                    mode="contained" 
                    onPress={() => router.back()}
                    style={{ marginTop: 20 }}
                >
                    Quay lại
                </Button>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            />
            
            {/* Overlay hướng dẫn */}
            <View style={styles.overlay}>
                <View style={styles.topContent}>
                    <Text style={styles.instruction}>
                        {type === 'pickup' 
                            ? '📦 Quét mã QR tại Nông Trại để nhận hàng' 
                            : '🏪 Quét mã QR tại Nhà Bán Lẻ để giao hàng'}
                    </Text>
                    {shipmentId && (
                        <Text style={styles.shipmentInfo}>
                            Đơn hàng: #{shipmentId}
                        </Text>
                    )}
                </View>
                
                {/* Khung quét */}
                <View style={styles.scanFrameContainer}>
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                    <View style={styles.scanFrame} />
                </View>
                
                {/* Processing indicator */}
                {isProcessing && (
                    <View style={styles.processingContainer}>
                        <ActivityIndicator size="large" color="#00FF00" />
                        <Text style={styles.processingText}>Đang xử lý...</Text>
                    </View>
                )}
                
                <View style={styles.bottomContent}>
                    <Text style={styles.hint}>
                        Đưa camera đến mã QR trên kiện hàng
                    </Text>
                    <IconButton 
                        icon="close-circle" 
                        iconColor="white" 
                        size={50} 
                        onPress={() => router.back()} 
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        justifyContent: 'center',
        backgroundColor: 'black',
    },
    centered: {
        alignItems: 'center',
    },
    overlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.6)', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
    },
    topContent: { 
        paddingTop: 60, 
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    instruction: { 
        color: 'white', 
        fontSize: 18, 
        textAlign: 'center', 
        fontWeight: 'bold',
        marginBottom: 10,
    },
    shipmentInfo: {
        color: '#00FF00',
        fontSize: 14,
        fontWeight: '600',
    },
    scanFrameContainer: {
        width: 260,
        height: 260,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanFrame: { 
        width: 250, 
        height: 250, 
        borderWidth: 2, 
        borderColor: '#00FF00', 
        backgroundColor: 'transparent',
        borderRadius: 10,
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: '#00FF00',
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderTopLeftRadius: 10,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderTopRightRadius: 10,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderBottomLeftRadius: 10,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderBottomRightRadius: 10,
    },
    processingContainer: {
        position: 'absolute',
        top: '50%',
        alignItems: 'center',
    },
    processingText: {
        color: '#00FF00',
        marginTop: 10,
        fontWeight: 'bold',
    },
    bottomContent: { 
        paddingBottom: 40,
        alignItems: 'center',
    },
    hint: {
        color: '#ccc',
        fontSize: 14,
        marginBottom: 10,
    },
    permissionText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 15,
    },
    permissionSubtext: {
        color: '#ccc',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
        paddingHorizontal: 40,
    },
});