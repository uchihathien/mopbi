import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { locationService, Province, District, Ward } from '../../services/location.service';
import { addressService } from '../../services/address.service';

export default function AddAddressScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [loadingProvinces, setLoadingProvinces] = useState(true);

    const [provinces, setProvinces] = useState<Province[]>([]);
    const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
    const [selectedWard, setSelectedWard] = useState<Ward | null>(null);

    const [formData, setFormData] = useState({
        label: '',
        fullName: '',
        phone: '',
        addressLine: '',
        isDefault: false,
    });

    useEffect(() => {
        loadProvinces();
    }, []);

    const loadProvinces = async () => {
        try {
            setLoadingProvinces(true);
            const data = await locationService.getProvinces();
            setProvinces(data);
        } catch (error) {
            console.error('Load provinces error:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách tỉnh/thành phố');
        } finally {
            setLoadingProvinces(false);
        }
    };

    const handleProvinceChange = (code: number) => {
        const province = provinces.find((p) => p.code === code);
        setSelectedProvince(province || null);
        setSelectedDistrict(null);
        setSelectedWard(null);
    };

    const handleDistrictChange = (code: number) => {
        if (!selectedProvince) return;
        const district = selectedProvince.districts.find((d) => d.code === code);
        setSelectedDistrict(district || null);
        setSelectedWard(null);
    };

    const handleWardChange = (code: number) => {
        if (!selectedDistrict) return;
        const ward = selectedDistrict.wards.find((w) => w.code === code);
        setSelectedWard(ward || null);
    };

    const validateForm = () => {
        if (!formData.fullName.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập họ tên');
            return false;
        }
        if (!formData.phone.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
            return false;
        }
        if (!selectedProvince || !selectedDistrict || !selectedWard) {
            Alert.alert('Lỗi', 'Vui lòng chọn đầy đủ địa chỉ');
            return false;
        }
        if (!formData.addressLine.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ chi tiết');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            await addressService.createAddress({
                label: formData.label,
                fullName: formData.fullName,
                phone: formData.phone,
                addressLine: formData.addressLine,
                city: selectedProvince!.name,
                district: selectedDistrict!.name,
                ward: selectedWard!.name,
                isDefault: formData.isDefault,
            });

            Alert.alert('Thành công', 'Đã thêm địa chỉ mới', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (error: any) {
            console.error('Create address error:', error);
            const errorMessage = error.response?.data?.error || 'Không thể thêm địa chỉ';
            Alert.alert('Lỗi', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (loadingProvinces) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.form}>
                {/* Label */}
                <View style={styles.field}>
                    <Text style={styles.label}>Nhãn (Tùy chọn)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nhà riêng, Văn phòng..."
                        value={formData.label}
                        onChangeText={(text) => setFormData({ ...formData, label: text })}
                    />
                </View>

                {/* Full Name */}
                <View style={styles.field}>
                    <Text style={styles.label}>Họ và tên *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nguyễn Văn A"
                        value={formData.fullName}
                        onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                    />
                </View>

                {/* Phone */}
                <View style={styles.field}>
                    <Text style={styles.label}>Số điện thoại *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="0123456789"
                        keyboardType="phone-pad"
                        value={formData.phone}
                        onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    />
                </View>

                {/* Province */}
                <View style={styles.field}>
                    <Text style={styles.label}>Tỉnh/Thành phố *</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedProvince?.code}
                            onValueChange={handleProvinceChange}
                            style={styles.picker}
                        >
                            <Picker.Item label="Chọn Tỉnh/Thành phố" value={0} />
                            {provinces.map((p) => (
                                <Picker.Item key={p.code} label={p.name} value={p.code} />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* District */}
                {selectedProvince && (
                    <View style={styles.field}>
                        <Text style={styles.label}>Quận/Huyện *</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={selectedDistrict?.code}
                                onValueChange={handleDistrictChange}
                                style={styles.picker}
                            >
                                <Picker.Item label="Chọn Quận/Huyện" value={0} />
                                {selectedProvince.districts.map((d) => (
                                    <Picker.Item key={d.code} label={d.name} value={d.code} />
                                ))}
                            </Picker>
                        </View>
                    </View>
                )}

                {/* Ward */}
                {selectedDistrict && (
                    <View style={styles.field}>
                        <Text style={styles.label}>Phường/Xã *</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={selectedWard?.code}
                                onValueChange={handleWardChange}
                                style={styles.picker}
                            >
                                <Picker.Item label="Chọn Phường/Xã" value={0} />
                                {selectedDistrict.wards.map((w) => (
                                    <Picker.Item key={w.code} label={w.name} value={w.code} />
                                ))}
                            </Picker>
                        </View>
                    </View>
                )}

                {/* Address Line */}
                <View style={styles.field}>
                    <Text style={styles.label}>Địa chỉ chi tiết *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Số nhà, tên đường..."
                        multiline
                        numberOfLines={3}
                        value={formData.addressLine}
                        onChangeText={(text) => setFormData({ ...formData, addressLine: text })}
                    />
                </View>

                {/* Default Checkbox */}
                <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
                >
                    <View style={styles.checkbox}>
                        {formData.isDefault && (
                            <Ionicons name="checkmark" size={18} color="#007AFF" />
                        )}
                    </View>
                    <Text style={styles.checkboxLabel}>Đặt làm địa chỉ mặc định</Text>
                </TouchableOpacity>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Lưu địa chỉ</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
    },
    form: {
        padding: 16,
    },
    field: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    pickerContainer: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: '#007AFF',
        borderRadius: 4,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxLabel: {
        fontSize: 14,
        color: '#1a1a1a',
    },
    saveButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
