//* Libraries imports
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
    ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

//* Config imports
import { API_CONFIG } from '../config/api';

//* Types imports
import { Workout, User } from '../types/workout';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PAD = 20;

export default function HomeScreen({ route, navigation }: any) {
    //* HOOKS * //
    const { token, user } = route.params as { token: string, user: User };
    const insets = useSafeAreaInsets();
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [progress, setProgress] = useState(0.65); // 65% completed

    //* ACTIONS * //
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

    //* CONSTANTS * //
    const JS_DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const today = new Date();
    const todayName = JS_DAYS[today.getDay()];
    const todayWorkout = workouts.find((w: any) => w.planned_day === todayName);

    const renderHeader = () => (
        <View style={styles.headerTop}>
            <View style={styles.headerInfo}>
                <Text style={styles.greeting}>Olá, <Text style={{ fontWeight: '900', color: '#fff' }}>{user?.name?.split(' ')[0]}</Text> 👋</Text>
                <Text style={styles.subGreeting}>Pronto para o treino de hoje?</Text>
            </View>
            <TouchableOpacity
                style={styles.avatarMini}
                onPress={() => navigation.navigate('ProfileTab')}
            >
                <Text style={styles.avatarMiniText}>{user?.name?.substring(0, 1).toUpperCase()}</Text>
            </TouchableOpacity>
        </View>
    );

    const renderProgressBar = () => (
        <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>PROGRESSO DIÁRIO</Text>
                <Text style={styles.progressValue}>{Math.round(progress * 100)}%</Text>
            </View>
            <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
            </View>
        </View>
    );

    const renderWorkoutsCarousel = () => (
        <View style={styles.carouselSection}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>MEUS TREINOS</Text>
                <TouchableOpacity onPress={() => navigation.navigate('WorkoutsTab')}>
                    <Text style={styles.viewAll}>Ver Todos</Text>
                </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
                {workouts.length > 0 ? workouts.slice(0, 4).map((item: Workout, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.workoutCardSmall}
                        onPress={() => navigation.navigate('Execution', { workout: item, token })}
                    >
                        <View style={styles.workoutCardIcon}>
                            <MaterialCommunityIcons name="lightning-bolt" size={20} color="#8b5cf6" />
                        </View>
                        <Text style={styles.workoutCardType}>{item.title.split('-')[0].trim()}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={[styles.workoutCardTitle, { flex: 1 }]} numberOfLines={1}>{item.title.split('-')[1]?.trim() || item.title}</Text>
                            {item.cardio_enabled && (
                                <MaterialCommunityIcons name="heart-pulse" size={14} color="#ef4444" style={{ marginLeft: 4 }} />
                            )}
                        </View>
                    </TouchableOpacity>
                )) : (
                    <TouchableOpacity style={styles.emptyWorkoutCard} onPress={() => navigation.navigate('WorkoutEditor', { token, user })}>
                        <MaterialCommunityIcons name="plus-circle-outline" size={24} color="#4B5563" />
                        <Text style={styles.emptyWorkoutText}>Novo Treino</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );

    const renderScheduleWidget = () => (
        <View style={styles.scheduleSection}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>O QUE TEMOS PARA HOJE?</Text>
            </View>
            <View style={styles.scheduleCard}>
                <View style={styles.scheduleTimeline}>
                    <View style={styles.timelineDotActive} />
                    <View style={styles.timelineLine} />
                    <View style={styles.timelineDot} />
                </View>
                <View style={styles.scheduleContent}>
                    {/* Exemplo de card do Kanban */}
                    <View style={styles.scheduleItem}>
                        <View>
                            <Text style={styles.scheduleTime}>09:00</Text>
                            <Text style={styles.scheduleLabel}>Kanban: Meta Diária</Text>
                        </View>
                        <MaterialCommunityIcons name="check-circle" size={20} color="#10b981" />
                    </View>

                    {/* Treino do dia */}
                    <TouchableOpacity
                        style={styles.scheduleItemActive}
                        onPress={() => todayWorkout && navigation.navigate('Execution', { workout: todayWorkout, token })}
                    >
                        <View>
                            <Text style={styles.scheduleTimeActive}>18:30</Text>
                            <Text style={styles.scheduleLabelActive}>
                                {todayWorkout ? `Treino: ${todayWorkout.title}` : 'Descanso Ativo'}
                            </Text>
                            {todayWorkout?.cardio_enabled && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                    <MaterialCommunityIcons name="heart-pulse" size={12} color="rgba(255,255,255,0.7)" />
                                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 'bold', marginLeft: 4 }}>
                                        CARDIO: {todayWorkout.cardio_type === 'calories' ? `${todayWorkout.cardio_calories} KCAL` : `${todayWorkout.cardio_duration_minutes} MIN`}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <MaterialCommunityIcons name="play-circle" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderRecentHistory = () => (
        <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>ÚLTIMOS TREINOS REALIZADOS</Text>
            {[1, 2].map((_, i) => (
                <View key={i} style={styles.historyCard}>
                    <View style={styles.historyIconBox}>
                        <MaterialCommunityIcons name="history" size={20} color="#f97316" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.historyTitle}>Peitoral e Tríceps</Text>
                        <Text style={styles.historyDate}>07 de Março • 55 min</Text>
                    </View>
                    <Text style={styles.historyXp}>+450 XP</Text>
                </View>
            ))}
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#09090b" />

            {loading ? (
                <View style={styles.centerBox}>
                    <ActivityIndicator color="#8b5cf6" size="large" />
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8b5cf6" />
                        }
                    >
                        {renderHeader()}
                        {renderProgressBar()}
                        {renderWorkoutsCarousel()}
                        {renderScheduleWidget()}
                        {renderRecentHistory()}

                        {/* Empty State se não houver treinos */}
                        {workouts.length === 0 && (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyMessage}>"A disciplina é a ponte entre metas e realizações."</Text>
                                <TouchableOpacity style={styles.quickStartBtn}>
                                    <Text style={styles.quickStartBtnText}>TREINO RÁPIDO (15 MIN)</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </ScrollView>


                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#09090b' },
    scrollContent: { paddingHorizontal: H_PAD },
    centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Header
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
    },
    headerInfo: { flex: 1 },
    greeting: { color: 'rgba(255,255,255,0.6)', fontSize: 16 },
    subGreeting: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 },
    avatarMini: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#8b5cf6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(139, 92, 246, 0.3)',
    },
    avatarMiniText: { color: '#fff', fontWeight: 'bold' },

    // Progress Bar
    progressSection: { marginBottom: 30 },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressTitle: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
    progressValue: { color: '#8b5cf6', fontSize: 14, fontWeight: '900' },
    progressBarBg: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#8b5cf6',
        borderRadius: 4,
    },

    // Carousel
    carouselSection: { marginBottom: 30 },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
    viewAll: { color: '#8b5cf6', fontSize: 12, fontWeight: 'bold' },
    workoutCardSmall: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        width: 140,
        padding: 16,
        borderRadius: 20,
        marginRight: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    workoutCardIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    workoutCardType: { color: '#8b5cf6', fontSize: 10, fontWeight: '900', marginBottom: 2 },
    workoutCardTitle: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
    emptyWorkoutCard: {
        width: 140,
        height: 100,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderStyle: 'dashed',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyWorkoutText: { color: '#4B5563', fontSize: 12, marginTop: 4, fontWeight: 'bold' },

    // Schedule Widget
    scheduleSection: { marginBottom: 30 },
    scheduleCard: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    scheduleTimeline: {
        alignItems: 'center',
        marginRight: 16,
        paddingTop: 6,
    },
    timelineDotActive: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#8b5cf6' },
    timelineLine: { width: 2, flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 4 },
    timelineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
    scheduleContent: { flex: 1 },
    scheduleItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        opacity: 0.5,
    },
    scheduleItemActive: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#8b5cf6',
        padding: 16,
        borderRadius: 16,
    },
    scheduleTime: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    scheduleLabel: { color: '#fff', fontSize: 13, marginTop: 2 },
    scheduleTimeActive: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: 'bold' },
    scheduleLabelActive: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginTop: 2 },

    // History
    historySection: { marginBottom: 30 },
    historyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 16,
        borderRadius: 20,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    historyIconBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    historyTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    historyDate: { color: '#6B7280', fontSize: 12, marginTop: 2 },
    historyXp: { color: '#8b5cf6', fontWeight: '900', fontSize: 12 },



    // Empty State
    emptyState: { alignItems: 'center', paddingVertical: 40 },
    emptyMessage: { color: '#6B7280', fontStyle: 'italic', textAlign: 'center', marginBottom: 20, fontSize: 13 },
    quickStartBtn: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
    },
    quickStartBtnText: { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
});
