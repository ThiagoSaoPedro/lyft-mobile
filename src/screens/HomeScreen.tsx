import React, { useState, useCallback } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    StatusBar,
    RefreshControl,
    Platform,
    Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { API_CONFIG } from '../config/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Margens horizontais responsivas
const H_PAD = Math.max(16, SCREEN_WIDTH * 0.05);

export default function HomeScreen({ route, navigation }: any) {
    const { token, user } = route.params;
    const insets = useSafeAreaInsets();
    const [workouts, setWorkouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchWorkouts = () => {
        fetch(`${API_CONFIG.BASE_URL}/api/workouts`, {
            headers: {
                'Bypass-Tunnel-Reminder': 'true', 'ngrok-skip-browser-warning': 'true',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        })
            .then(res => res.json())
            .then(data => {
                setWorkouts(data.data || []);
                setLoading(false);
                setRefreshing(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
                setRefreshing(false);
            });
    };

    useFocusEffect(
        useCallback(() => {
            fetchWorkouts();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchWorkouts();
    };

    // ─── Workout Card ────────────────────────────────────────────────────────────
    const renderCard = ({ item, hideEdit }: any) => {
        let subTitle = 'TREINO';
        let mainTitle = item.title;
        if (item.title.toUpperCase().startsWith('TREINO')) {
            const parts = item.title.split('-');
            subTitle = parts[0].trim().toUpperCase();
            mainTitle =
                parts.length > 1 ? parts.slice(1).join('-').trim() : item.title;
            if (parts.length === 1) subTitle = 'TREINO';
        }

        return (
            <View style={styles.workoutCard}>
                <View style={styles.workoutCardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.workoutCardSubtitle}>{subTitle}</Text>
                        <Text style={styles.workoutCardTitle} numberOfLines={1}>
                            {mainTitle}
                        </Text>
                    </View>

                    {!hideEdit && (user.role === 'personal' || user.id === item.student_id) && (
                        <TouchableOpacity
                            style={styles.editBtnBox}
                            onPress={() =>
                                navigation.navigate('WorkoutEditor', { workout: item, token, user })
                            }
                        >
                            <MaterialCommunityIcons name="pencil-outline" size={15} color="#6B7280" />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.workoutCardContent}>
                    {item.exercises?.slice(0, 3).map((ex: any, i: number) => (
                        <View
                            key={i}
                            style={[
                                styles.exerciseRow,
                                i !== Math.min((item.exercises?.length || 0), 3) - 1 &&
                                styles.exerciseRowBorder,
                            ]}
                        >
                            <Text style={styles.exerciseNameText} numberOfLines={1}>
                                {ex.name}
                            </Text>
                            <Text style={styles.exerciseSetsText}>
                                {ex.sets_config?.length || 0} blocos
                            </Text>
                        </View>
                    ))}
                    {(item.exercises?.length || 0) > 3 && (
                        <Text style={styles.moreExercisesText}>
                            + {item.exercises.length - 3} exercícios
                        </Text>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.startBtn}
                    onPress={() => navigation.navigate('Execution', { workout: item, token })}
                >
                    <Text style={styles.startBtnText}>INICIAR TREINO</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const canCreate = user.role === 'personal' || user.role === 'user';

    const JS_DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const today = new Date();
    const todayName = JS_DAYS[today.getDay()];
    const todayDateStr = `${todayName}, ${today.getDate()} de ${MESES[today.getMonth()]}`;

    const todayWorkout = workouts.find((w: any) => w.planned_day === todayName);

    // ─── Header ──────────────────────────────────────────────────────────────────
    const renderHeader = () => {
        return (
            <View>
                {/* Topo: título + avatar */}
                <View style={styles.header}>
                    <View style={{ flex: 1, paddingRight: 12 }}>
                        <Text style={styles.dashboardHeaderTitle} numberOfLines={1} adjustsFontSizeToFit>
                            PERFORMANCE SYSTEM
                        </Text>
                        <Text style={styles.dashboardUserInfo}>
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{todayDateStr}</Text>
                            {'\n'}Logado como{' '}
                            <Text style={styles.textPrimary}>
                                {user?.name?.split(' ')[0] || 'Atleta'}
                            </Text>
                            <Text style={{ color: '#9CA3AF' }}> ({user?.role})</Text>
                        </Text>
                    </View>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarLabel}>
                            {user?.name?.substring(0, 2).toUpperCase() || 'AI'}
                        </Text>
                    </View>
                </View>

                {/* Grid de estatísticas */}
                <View style={styles.statsGrid}>
                    <View style={styles.statsRow}>
                        <StatCard
                            icon="target"
                            iconColor="#8b5cf6"
                            bgColor="rgba(139, 92, 246, 0.12)"
                            label="FOCO SEMANAL"
                            value="92%"
                        />
                        <StatCard
                            icon="fire"
                            iconColor="#f97316"
                            bgColor="rgba(249, 115, 22, 0.12)"
                            label="VOLUME TOTAL"
                            value="125t"
                        />
                    </View>
                    <View style={styles.statsRow}>
                        <StatCard
                            icon="calendar-check"
                            iconColor="#3b82f6"
                            bgColor="rgba(59, 130, 246, 0.12)"
                            label="CONSISTÊNCIA"
                            value="18d"
                        />
                        <StatCard
                            icon="lightning-bolt"
                            iconColor="#10b981"
                            bgColor="rgba(16, 185, 129, 0.12)"
                            label="SCORE BIO"
                            value="8.4"
                        />
                    </View>
                </View>

                {/* Cabeçalho da seção Cronograma Diário */}
                <View style={styles.sectionHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialCommunityIcons
                            name="calendar-today"
                            size={17}
                            color="#fff"
                            style={{ marginRight: 7 }}
                        />
                        <Text style={styles.sectionTitle}>CRONOGRAMA DIÁRIO</Text>
                    </View>
                </View>

                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 16 }}>{todayDateStr}</Text>
            </View>
        );
    };

    // ─── Footer ──────────────────────────────────────────────────────────────────
    const renderFooter = () => (
        <View style={styles.footerSection}>
            <View style={styles.sectionHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons
                        name="clock-outline"
                        size={17}
                        color="#8b5cf6"
                        style={{ marginRight: 7 }}
                    />
                    <Text style={styles.sectionTitle}>LOGS RECENTES</Text>
                </View>
                <TouchableOpacity>
                    <Text style={styles.viewAllText}>Ver todos {'>'}</Text>
                </TouchableOpacity>
            </View>

            <LogCard title="Peitoral & Ombro" subtitle="Concluído em 03/03 • 88% Precisão" xp="XP+450" />
            <LogCard title="Costas & Bíceps" subtitle="Concluído em 01/03 • 82% Precisão" xp="XP+380" />
        </View>
    );

    // ─── Render ──────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#09090b" />

            {loading ? (
                <View style={styles.centerBox}>
                    <ActivityIndicator color="#8b5cf6" size="large" />
                </View>
            ) : (
                <FlatList
                    data={todayWorkout ? [todayWorkout] : []}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderCard}
                    ListHeaderComponent={renderHeader}
                    ListFooterComponent={renderFooter}
                    contentContainerStyle={[
                        styles.listContainer,
                        { paddingHorizontal: H_PAD, paddingBottom: insets.bottom + 90 },
                    ]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#8b5cf6"
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyTextHeader}>DIA LIVRE</Text>
                            <Text style={styles.emptyText}>Não há atividades cadastradas para o dia de hoje.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

// ─── Sub-componentes ─────────────────────────────────────────────────────────

function StatCard({
    icon,
    iconColor,
    bgColor,
    label,
    value,
}: {
    icon: any;
    iconColor: string;
    bgColor: string;
    label: string;
    value: string;
}) {
    return (
        <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: bgColor }]}>
                <MaterialCommunityIcons name={icon} size={15} color={iconColor} />
            </View>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
        </View>
    );
}

function LogCard({
    title,
    subtitle,
    xp,
}: {
    title: string;
    subtitle: string;
    xp: string;
}) {
    return (
        <View style={styles.logCard}>
            <View style={styles.logIconBox}>
                <MaterialCommunityIcons name="fire" size={17} color="#f97316" />
            </View>
            <View style={styles.logContent}>
                <Text style={styles.logTitle}>{title}</Text>
                <Text style={styles.logSubtitle}>{subtitle}</Text>
            </View>
            <Text style={styles.logXp}>{xp}</Text>
        </View>
    );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#09090b',
    },

    // Cabeçalho
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        marginTop: Platform.OS === 'android' ? 4 : 0,
    },
    dashboardHeaderTitle: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        letterSpacing: -0.5,
    },
    dashboardUserInfo: {
        color: '#9CA3AF',
        fontSize: 11,
        marginTop: 2,
        fontWeight: '500',
    },
    textPrimary: { color: '#8b5cf6' },
    avatar: {
        width: 34,
        height: 34,
        borderRadius: 9,
        backgroundColor: '#8b5cf6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarLabel: { color: '#fff', fontWeight: '900', fontSize: 12 },

    // Grid stats
    statsGrid: {
        marginBottom: 18,
        gap: 10,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        borderRadius: 14,
        padding: 12,
    },
    statIconBox: {
        width: 26,
        height: 26,
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 8,
        fontWeight: '900',
        textTransform: 'uppercase',
        color: '#6B7280',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '900',
        color: '#fff',
    },

    // Seção
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '900',
        color: '#fff',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        letterSpacing: -0.5,
    },
    newWorkoutBtn: {
        backgroundColor: '#8b5cf6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    newWorkoutBtnText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // Lista
    listContainer: {
        // paddingHorizontal e paddingBottom definidos inline (responsivos)
    },

    // Workout card
    workoutCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 14,
        borderRadius: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    workoutCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    workoutCardSubtitle: {
        color: '#8b5cf6',
        fontSize: 9,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 2,
    },
    workoutCardTitle: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
        letterSpacing: -0.3,
        marginRight: 6,
    },
    editBtnBox: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        width: 26,
        height: 26,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
    },
    workoutCardContent: { marginBottom: 12 },
    exerciseRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 7,
    },
    exerciseRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    exerciseNameText: { color: '#D1D5DB', fontWeight: '500', fontSize: 11, flex: 1 },
    exerciseSetsText: { color: '#6B7280', fontSize: 9, fontWeight: '500' },
    moreExercisesText: { color: '#6B7280', fontSize: 9, fontStyle: 'italic', marginTop: 4 },
    startBtn: {
        backgroundColor: '#8b5cf6',
        paddingVertical: 11,
        borderRadius: 10,
        alignItems: 'center',
    },
    startBtnText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },

    // Footer / logs
    footerSection: { marginTop: 6 },
    viewAllText: { color: '#6B7280', fontSize: 10, fontWeight: '500' },
    logCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 12,
        borderRadius: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    logIconBox: {
        width: 34,
        height: 34,
        borderRadius: 9,
        backgroundColor: 'rgba(249, 115, 22, 0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    logContent: { flex: 1 },
    logTitle: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginBottom: 2 },
    logSubtitle: { color: '#8b5cf6', fontSize: 10 },
    logXp: { color: '#8b5cf6', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },

    // Misc
    centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        borderStyle: 'dashed',
        marginTop: 10,
        marginBottom: 32,
    },
    emptyTextHeader: {
        color: '#6B7280',
        fontSize: 11,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 6,
    },
    emptyText: { color: '#9CA3AF', textAlign: 'center', fontSize: 12 },
});
