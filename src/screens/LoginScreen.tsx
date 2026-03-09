import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_CONFIG } from '../config/api';

export default function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Alerta', 'Preencha todos os campos');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Bypass-Tunnel-Reminder': 'true',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                navigation.replace('Home', { token: data.token, user: data.user });
            } else {
                Alert.alert('Erro', data.message || 'Falha no login');
            }
        } catch (e) {
            Alert.alert('Erro', 'Não foi possível conectar ao servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.inner}
            >
                <View style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoIcon}>L</Text>
                    </View>
                    <Text style={styles.title}>Lyft</Text>
                    <Text style={styles.subtitle}>Sua jornada, validação biometria.</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>E-mail</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="seu@email.com"
                            placeholderTextColor="#4B5563"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Senha</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor="#4B5563"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar na Plataforma'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.forgotPass}
                        onPress={() => navigation.navigate('Signup')}
                    >
                        <Text style={styles.forgotText}>Não tem uma conta? <Text style={styles.highlight}>Cadastre-se</Text></Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.footerText}>Fale com seu personal para obter acesso.</Text>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#09090b' },
    inner: { flex: 1, justifyContent: 'center', padding: 30 },
    logoContainer: { alignItems: 'center', marginBottom: 50 },
    logoCircle: {
        width: 60,
        height: 60,
        borderRadius: 18,
        backgroundColor: '#8b5cf6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10
    },
    logoIcon: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
    highlight: { color: '#8b5cf6' },
    subtitle: { fontSize: 14, color: '#9CA3AF', marginTop: 8 },
    form: { width: '100%' },
    inputContainer: { marginBottom: 20 },
    label: { color: '#D1D5DB', fontSize: 12, fontWeight: 'bold', marginBottom: 8, marginLeft: 4, textTransform: 'uppercase' },
    input: {
        backgroundColor: '#18181b',
        color: '#fff',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#27272a',
        fontSize: 16
    },
    button: {
        backgroundColor: '#8b5cf6',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    forgotPass: { marginTop: 20, alignItems: 'center' },
    forgotText: { color: '#8b5cf6', fontSize: 14, fontWeight: 'medium' },
    footerText: { textAlign: 'center', color: '#4B5563', fontSize: 12, position: 'absolute', bottom: 40, width: '100%', left: 30 }
});
