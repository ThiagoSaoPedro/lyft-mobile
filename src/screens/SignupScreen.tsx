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
    StatusBar,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API_CONFIG } from '../config/api';

export default function SignupScreen({ navigation }: any) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'personal' | 'user' | 'student'>('user');
    const [personalId, setPersonalId] = useState('');
    const [loading, setLoading] = useState(false);

    //TODO: criar arquivo separado com as roles
    const roles = [
        {
            id: 'personal',
            label: 'Personal Trainer',
            desc: 'Gerencie alunos',
            icon: 'dumbbell' as const,
        },
        {
            id: 'user',
            label: 'Atleta Solo',
            desc: 'Treine com IA',
            icon: 'pulse' as const,
        },
        {
            id: 'student',
            label: 'Aluno',
            desc: 'Vincule seu coach',
            icon: 'account-group' as const,
        },
    ];

    const handleSignup = async () => {
        if (!name || !email || !password) {
            Alert.alert('Alerta', 'Preencha os campos obrigatórios');
            return;
        }

        setLoading(true);
        try {
            const signupData: any = {
                name,
                email,
                password,
                role
            };

            if (role === 'student' && personalId) {
                signupData.personal_id = personalId;
            }

            const res = await fetch(`${API_CONFIG.BASE_URL}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Bypass-Tunnel-Reminder': 'true',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(signupData)
            });

            const data = await res.json();

            if (res.ok) {
                Alert.alert('Sucesso', 'Conta criada com sucesso!');
                navigation.replace('Home', { token: data.token, user: data.user });
            } else {
                Alert.alert('Erro', data.message || 'Falha ao criar conta');
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
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <View style={styles.logoCircle}>
                            <MaterialCommunityIcons name="lightning-bolt" size={32} color="#fff" />
                        </View>
                        <Text style={styles.title}>Criar sua Conta <Text style={styles.highlight}>Pro</Text></Text>
                        <Text style={styles.subtitle}>Escolha seu tipo de perfil para começar.</Text>
                    </View>

                    <View style={styles.roleContainer}>
                        {roles.map((r) => (
                            <TouchableOpacity
                                key={r.id}
                                style={[
                                    styles.roleCard,
                                    role === r.id && styles.roleCardActive
                                ]}
                                onPress={() => setRole(r.id as any)}
                            >
                                <View style={[styles.roleIconBox, role === r.id && styles.roleIconBoxActive]}>
                                    <MaterialCommunityIcons
                                        name={r.icon}
                                        size={20}
                                        color={role === r.id ? '#fff' : '#4B5563'}
                                    />
                                </View>
                                <Text style={[styles.roleLabel, role === r.id && styles.roleLabelActive]}>{r.label}</Text>
                                <Text style={styles.roleDesc}>{r.desc}</Text>
                                {role === r.id && (
                                    <View style={styles.checkBadge}>
                                        <MaterialCommunityIcons name="check" size={12} color="#fff" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Nome Completo</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="account-outline" size={20} color="#4B5563" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Como quer ser chamado?"
                                    placeholderTextColor="#4B5563"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>E-mail</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="email-outline" size={20} color="#4B5563" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="atleta@dominio.com"
                                    placeholderTextColor="#4B5563"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Senha</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="lock-outline" size={20} color="#4B5563" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="••••••••"
                                    placeholderTextColor="#4B5563"
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>
                        </View>

                        {role === 'student' && (
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Código do Personal (Opcional)</Text>
                                <View style={styles.inputWrapper}>
                                    <MaterialCommunityIcons name="barcode-scan" size={20} color="#4B5563" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Ex: 123"
                                        placeholderTextColor="#4B5563"
                                        keyboardType="numeric"
                                        value={personalId}
                                        onChangeText={setPersonalId}
                                    />
                                </View>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleSignup}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>{loading ? 'Criando Conta...' : 'Criar Minha Conta Agora'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.loginLink}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.loginLinkText}>
                                Já tem uma conta? <Text style={styles.highlightText}>Entrar na plataforma</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#09090b' },
    scrollContent: { padding: 24, paddingBottom: 40 },
    header: { alignItems: 'center', marginBottom: 32 },
    logoCircle: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: '#8b5cf6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10
    },
    title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    highlight: { color: '#8b5cf6', fontStyle: 'italic' },
    subtitle: { fontSize: 13, color: '#9CA3AF', marginTop: 8 },

    roleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
        gap: 8
    },
    roleCard: {
        flex: 1,
        backgroundColor: '#18181b',
        borderWidth: 1,
        borderColor: '#27272a',
        borderRadius: 16,
        padding: 12,
        alignItems: 'flex-start',
        position: 'relative'
    },
    roleCardActive: {
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139,92,246,0.1)'
    },
    roleIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#27272a',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8
    },
    roleIconBoxActive: {
        backgroundColor: '#8b5cf6'
    },
    roleLabel: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
    roleLabelActive: { color: '#fff' },
    roleDesc: { color: '#6B7280', fontSize: 8, marginTop: 2 },
    checkBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#8b5cf6',
        justifyContent: 'center',
        alignItems: 'center'
    },

    form: { width: '100%' },
    inputContainer: { marginBottom: 20 },
    label: { color: '#D1D5DB', fontSize: 12, fontWeight: 'bold', marginBottom: 8, marginLeft: 4 },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#18181b',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#27272a',
        paddingHorizontal: 12
    },
    inputIcon: { marginRight: 10 },
    input: {
        flex: 1,
        color: '#fff',
        paddingVertical: 14,
        fontSize: 14
    },
    button: {
        backgroundColor: '#8b5cf6',
        padding: 16,
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
    loginLink: { marginTop: 24, alignItems: 'center' },
    loginLinkText: { color: '#9CA3AF', fontSize: 14 },
    highlightText: { color: '#8b5cf6', fontWeight: 'bold' }
});
