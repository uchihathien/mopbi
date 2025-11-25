import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';

WebBrowser.maybeCompleteAuthSession();

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const { register, loginWithGoogle } = useAuthStore();
    const router = useRouter();

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await loginWithGoogle();
            router.replace('/(tabs)');
        } catch (error: any) {
            console.error('Google login error:', error);
            Alert.alert('Đăng nhập Google thất bại', 'Không thể xác thực với Google.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!email || !password || !fullName) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin bắt buộc');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);
        try {
            await register(email, password, fullName, phone);
            Alert.alert('Thành công', 'Đăng ký tài khoản thành công!', [
                { text: 'OK', onPress: () => router.replace('/(tabs)') }
            ]);
        } catch (error: any) {
            console.error('Registration error:', error);
            let errorMessage = 'Có lỗi xảy ra, vui lòng thử lại';

            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
                if (errorMessage === 'Email already registered') {
                    errorMessage = 'Email này đã được sử dụng';
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            Alert.alert('Đăng ký thất bại', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    <Text style={styles.title}>Đăng Ký</Text>
                    <Text style={styles.subtitle}>Tạo tài khoản mới</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Họ và tên *"
                        value={fullName}
                        onChangeText={setFullName}
                        autoComplete="name"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Email *"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Số điện thoại"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        autoComplete="tel"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Mật khẩu *"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoComplete="password-new"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Xác nhận mật khẩu *"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        autoComplete="password-new"
                    />

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>HOẶC</Text>
                        <View style={styles.divider} />
                    </View>

                    <TouchableOpacity
                        style={[styles.googleButton, loading && styles.buttonDisabled]}
                        onPress={handleGoogleLogin}
                        disabled={loading}
                    >
                        <Ionicons name="logo-google" size={20} color="#DB4437" style={styles.googleIcon} />
                        <Text style={styles.googleButtonText}>Đăng ký bằng Google</Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Đã có tài khoản? </Text>
                        <Link href="/(auth)/login" asChild>
                            <TouchableOpacity>
                                <Text style={styles.link}>Đăng nhập</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1a1a1a',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 32,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#007AFF',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#ddd',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#666',
        fontSize: 14,
    },
    googleButton: {
        flexDirection: 'row',
        height: 50,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    googleIcon: {
        marginRight: 12,
    },
    googleButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        color: '#666',
        fontSize: 14,
    },
    link: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '600',
    },
});
