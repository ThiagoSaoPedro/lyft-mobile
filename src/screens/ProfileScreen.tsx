import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView,
    Platform, Image, Dimensions, Modal, TextInput, Alert, ActivityIndicator,
    KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API_CONFIG } from '../config/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
    'ngrok-skip-browser-warning': 'true',
};

interface Badge {
    id: number;
    name: string;
    icon: string;
    color: string;
    unlocked: boolean;
    progress: number;
    goal: number;
}

interface UserProfile {
    id: number;
    name: string;
    email: string;
    bio: string | null;
    avatar: string | null;
    xp: number;
    rank: string;
    strike_count: number;
    safe_days_left: number;
    total_workouts: number;
}

export default function ProfileScreen({ route, navigation }: any) {
    const { token, user: initialUser } = route?.params || {};

    const [user, setUser] = useState<UserProfile>(initialUser);
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);
    const [bioModalVisible, setBioModalVisible] = useState(false);
    const [bioInput, setBioInput] = useState('');
    const [savingBio, setSavingBio] = useState(false);
    const [usingSafeDay, setUsingSafeDay] = useState(false);

    const authHeaders = {
        ...DEFAULT_HEADERS,
        'Authorization': `Bearer ${token}`,
    };

    const fetchProfile = useCallback(async () => {
        try {
            const [meRes, badgesRes] = await Promise.all([
                fetch(`${API_CONFIG.BASE_URL}/api/me`, { headers: authHeaders }),
                fetch(`${API_CONFIG.BASE_URL}/api/profile/badges`, { headers: authHeaders }),
            ]);

            if (meRes.ok) {
                const meData = await meRes.json();
                setUser(meData.user);
            }

            if (badgesRes.ok) {
                const badgesData = await badgesRes.json();
                setBadges(badgesData.badges);
            }
        } catch (e) {
            console.error('Erro ao buscar perfil:', e);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const getFireColor = (count: number) => {
        if (count < 7) return '#60a5fa';
        if (count < 30) return '#f97316';
        return '#a855f7';
    };

    const fireColor = getFireColor(user?.strike_count ?? 0);

    const formatXP = (xp: number) => {
        if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`;
        return String(xp);
    };

    const handleOpenBioEdit = () => {
        setBioInput(user?.bio ?? '');
        setBioModalVisible(true);
    };

    const handleSaveBio = async () => {
        setSavingBio(true);
        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/profile`, {
                method: 'PUT',
                headers: authHeaders,
                body: JSON.stringify({ bio: bioInput }),
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                setBioModalVisible(false);
            } else {
                Alert.alert('Erro', 'Não foi possível salvar a bio');
            }
        } catch {
            Alert.alert('Erro', 'Sem conexão com o servidor');
        } finally {
            setSavingBio(false);
        }
    };

    const handleUseSafeDay = async () => {
        if ((user?.safe_days_left ?? 0) <= 0) {
            Alert.alert('Sem Safe Days', 'Você não tem Safe Days disponíveis.');
            return;
        }

        Alert.alert(
            'Usar Safe Day',
            `Você tem ${user.safe_days_left} Safe Day(s). Usar um agora?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        setUsingSafeDay(true);
                        try {
                            const res = await fetch(`${API_CONFIG.BASE_URL}/api/profile/use-safe-day`, {
                                method: 'POST',
                                headers: authHeaders,
                            });
                            if (res.ok) {
                                const data = await res.json();
                                setUser(data.user);
                            } else {
                                const err = await res.json();
                                Alert.alert('Erro', err.message ?? 'Não foi possível usar o Safe Day');
                            }
                        } catch {
                            Alert.alert('Erro', 'Sem conexão com o servidor');
                        } finally {
                            setUsingSafeDay(false);
                        }
                    }
                }
            ]
        );
    };

    const handleAvatarUpload = () => {
        Alert.alert('Em breve', 'Upload de foto estará disponível na próxima versão.');
    };

    const handleLogout = () => {
        navigation.replace('Login');
    };

    const getAvatarUri = () => {
        if (user?.avatar) return user.avatar;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=8b5cf6&color=fff&size=256`;
    };

    const stats = [
        { label: 'TREINOS', value: String(user?.total_workouts ?? 0), icon: 'dumbbell' },
        { label: 'PONTOS XP', value: formatXP(user?.xp ?? 0), icon: 'lightning-bolt' },
        { label: 'RANK', value: user?.rank ?? 'Bronze', icon: 'trophy-outline' },
    ];

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#8b5cf6" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#09090b" />

            <ScrollView
                style={styles.content}
                contentContainerStyle={{ paddingBottom: 110 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header de Identidade */}
                <View style={styles.identityHeader}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarBorder}>
                            <Image source={{ uri: getAvatarUri() }} style={styles.avatarImg} />
                        </View>
                        <TouchableOpacity style={styles.editAvatarBtn} onPress={handleAvatarUpload}>
                            <MaterialCommunityIcons name="camera" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.userName}>{user?.name?.toUpperCase() ?? 'ATLETA'}</Text>
                    <Text style={styles.userEmail}>{user?.email ?? ''}</Text>

                    <View style={styles.bioContainer}>
                        <Text style={styles.bioText} numberOfLines={3}>
                            {user?.bio || 'Adicione uma bio...'}
                        </Text>
                        <TouchableOpacity style={styles.editBioBtn} onPress={handleOpenBioEdit}>
                            <MaterialCommunityIcons name="pencil-outline" size={14} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Sistema de Strike */}
                <View style={[styles.strikeCard, { borderColor: `${fireColor}33` }]}>
                    <View style={styles.strikeInfo}>
                        <View style={[styles.fireIconBox, { backgroundColor: `${fireColor}15` }]}>
                            <MaterialCommunityIcons name="fire" size={32} color={fireColor} />
                        </View>
                        <View>
                            <Text style={styles.strikeLabel}>STRIKE ATUAL</Text>
                            <Text style={[styles.strikeValue, { color: fireColor }]}>
                                {user?.strike_count ?? 0} DIAS
                            </Text>
                        </View>
                    </View>

                    <View style={styles.safeDayContainer}>
                        <View style={styles.safeDayTextRow}>
                            <MaterialCommunityIcons name="shield-check" size={16} color="#10b981" />
                            <Text style={styles.safeDayText}>
                                Safe Days:{' '}
                                <Text style={{ fontWeight: 'bold', color: '#fff' }}>
                                    {user?.safe_days_left ?? 0} restantes
                                </Text>
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[
                                styles.safeDayBtn,
                                (user?.safe_days_left ?? 0) <= 0 && styles.safeDayBtnDisabled
                            ]}
                            onPress={handleUseSafeDay}
                            disabled={usingSafeDay || (user?.safe_days_left ?? 0) <= 0}
                        >
                            {usingSafeDay
                                ? <ActivityIndicator size="small" color="#10b981" />
                                : <Text style={styles.safeDayBtnText}>USAR HOJE</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    {stats.map((stat, i) => (
                        <View key={i} style={styles.statBox}>
                            <MaterialCommunityIcons name={stat.icon as any} size={18} color="#8b5cf6" style={{ marginBottom: 4 }} />
                            <Text style={styles.statBoxValue}>{stat.value}</Text>
                            <Text style={styles.statBoxLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Badges */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>VITRINE DE CONQUISTAS</Text>
                </View>

                <View style={styles.badgesGrid}>
                    {(badges.length > 0 ? badges : FALLBACK_BADGES).map((badge) => (
                        <View key={badge.id} style={styles.badgeItem}>
                            <View style={[
                                styles.badgeCircle,
                                { backgroundColor: badge.unlocked ? `${badge.color}15` : 'rgba(255,255,255,0.05)' }
                            ]}>
                                <MaterialCommunityIcons
                                    name={badge.icon as any}
                                    size={24}
                                    color={badge.unlocked ? badge.color : '#4B5563'}
                                />
                                {!badge.unlocked && (
                                    <View style={styles.lockOverlay}>
                                        <MaterialCommunityIcons name="lock" size={12} color="#9CA3AF" />
                                    </View>
                                )}
                            </View>
                            <Text style={[
                                styles.badgeName,
                                { color: badge.unlocked ? '#D1D5DB' : '#6B7280' }
                            ]}>{badge.name}</Text>
                            {!badge.unlocked && badge.goal > 0 && (
                                <Text style={styles.badgeProgress}>
                                    {badge.progress}/{badge.goal}
                                </Text>
                            )}
                        </View>
                    ))}
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <MaterialCommunityIcons name="logout" size={20} color="#f87171" style={{ marginRight: 8 }} />
                    <Text style={styles.logoutBtnText}>ENCERRAR SESSÃO</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>LYFT v2.1.0-beta</Text>
            </ScrollView>

            {/* Modal de edição de bio */}
            <Modal
                visible={bioModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setBioModalVisible(false)}
            >
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>EDITAR BIO</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={bioInput}
                            onChangeText={setBioInput}
                            placeholder="Escreva algo sobre você..."
                            placeholderTextColor="#4B5563"
                            multiline
                            maxLength={255}
                            autoFocus
                        />
                        <Text style={styles.charCount}>{bioInput.length}/255</Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.modalCancelBtn}
                                onPress={() => setBioModalVisible(false)}
                                disabled={savingBio}
                            >
                                <Text style={styles.modalCancelText}>CANCELAR</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalSaveBtn}
                                onPress={handleSaveBio}
                                disabled={savingBio}
                            >
                                {savingBio
                                    ? <ActivityIndicator size="small" color="#fff" />
                                    : <Text style={styles.modalSaveText}>SALVAR</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const FALLBACK_BADGES = [
    { id: 1, name: '7 Dias Seguidos', icon: 'fire', unlocked: false, color: '#f97316', progress: 0, goal: 7 },
    { id: 2, name: 'Foco Total', icon: 'target', unlocked: false, color: '#8b5cf6', progress: 0, goal: 500 },
    { id: 3, name: 'Madrugador', icon: 'weather-sunset-up', unlocked: false, color: '#fbbf24', progress: 0, goal: 5 },
    { id: 4, name: 'Veterano', icon: 'dumbbell', unlocked: false, color: '#10b981', progress: 0, goal: 20 },
    { id: 5, name: '30 Dias Strike', icon: 'trophy', unlocked: false, color: '#a855f7', progress: 0, goal: 30 },
    { id: 6, name: 'Lendário', icon: 'star', unlocked: false, color: '#ec4899', progress: 0, goal: 10000 },
];

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#09090b' },
    content: { flex: 1, paddingHorizontal: 20 },

    identityHeader: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatarBorder: {
        padding: 4,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#8b5cf6',
    },
    avatarImg: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#8b5cf6',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#09090b',
    },
    userName: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    userEmail: {
        color: '#9CA3AF',
        fontSize: 14,
        marginBottom: 16,
    },
    bioContainer: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 12,
        borderRadius: 12,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
    },
    bioText: {
        color: '#D1D5DB',
        fontSize: 13,
        lineHeight: 18,
        flex: 1,
        textAlign: 'center',
    },
    editBioBtn: {
        paddingLeft: 8,
    },

    strikeCard: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
    },
    strikeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    fireIconBox: {
        width: 60,
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    strikeLabel: {
        color: '#9CA3AF',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    strikeValue: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: -1,
    },
    safeDayContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    safeDayTextRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    safeDayText: {
        color: '#9CA3AF',
        fontSize: 12,
        marginLeft: 6,
    },
    safeDayBtn: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        minWidth: 80,
        alignItems: 'center',
    },
    safeDayBtnDisabled: {
        opacity: 0.4,
    },
    safeDayBtnText: {
        color: '#10b981',
        fontSize: 10,
        fontWeight: '900',
    },

    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    statBox: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        width: (SCREEN_WIDTH - 60) / 3,
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    statBoxValue: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
    },
    statBoxLabel: {
        color: '#6B7280',
        fontSize: 9,
        fontWeight: '900',
        marginTop: 2,
    },

    sectionHeader: {
        marginBottom: 16,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 1,
    },
    badgesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    badgeItem: {
        width: (SCREEN_WIDTH - 60) / 3,
        alignItems: 'center',
        marginBottom: 20,
    },
    badgeCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        position: 'relative',
    },
    badgeName: {
        fontSize: 10,
        textAlign: 'center',
        fontWeight: '600',
    },
    badgeProgress: {
        color: '#6B7280',
        fontSize: 9,
        marginTop: 2,
    },
    lockOverlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#1f2937',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#09090b',
    },

    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(248, 113, 113, 0.05)',
        paddingVertical: 16,
        borderRadius: 16,
        marginBottom: 20,
    },
    logoutBtnText: { color: '#f87171', fontSize: 13, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
    versionText: {
        color: '#374151',
        fontSize: 10,
        textAlign: 'center',
        fontWeight: 'bold',
        letterSpacing: 2,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    modalCard: {
        backgroundColor: '#18181b',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    modalTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 16,
    },
    modalInput: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        color: '#fff',
        borderRadius: 12,
        padding: 14,
        fontSize: 14,
        minHeight: 100,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    charCount: {
        color: '#4B5563',
        fontSize: 11,
        textAlign: 'right',
        marginTop: 6,
        marginBottom: 16,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    modalCancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    modalCancelText: {
        color: '#9CA3AF',
        fontWeight: '900',
        fontSize: 12,
        letterSpacing: 0.5,
    },
    modalSaveBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#8b5cf6',
    },
    modalSaveText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 12,
        letterSpacing: 0.5,
    },
});
