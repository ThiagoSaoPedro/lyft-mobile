import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, ActivityIndicator, Platform, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { API_CONFIG } from '../config/api';

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo", "Backlog"];

// Helper function for dynamic intensity styling
const getIntensityStyle = (exerciseCount: number) => {
    if (exerciseCount > 5) return {
        container: { backgroundColor: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.2)' },
        text: { color: '#ef4444' },
        icon: '#ef4444' as const,
        label: 'High'
    };
    if (exerciseCount > 3) return {
        container: { backgroundColor: 'rgba(249,115,22,0.15)', borderColor: 'rgba(249,115,22,0.2)' },
        text: { color: '#f97316' },
        icon: '#f97316' as const,
        label: 'Med'
    };
    return {
        container: { backgroundColor: 'rgba(34,197,94,0.15)', borderColor: 'rgba(34,197,94,0.2)' },
        text: { color: '#22c55e' },
        icon: '#22c55e' as const,
        label: 'Low'
    };
};

export default function KanbanScreen({ route, navigation }: any) {
    const { token, user } = route?.params || {};
    const [workouts, setWorkouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Today and week computation
    const DAY_MAP: Record<number, string> = {
        0: "Domingo", 1: "Segunda", 2: "Terça", 3: "Quarta",
        4: "Quinta", 5: "Sexta", 6: "Sábado"
    };
    const today = new Date();
    const todayDay = DAY_MAP[today.getDay()];

    // Week label: "10 – 16 Mar"
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
    const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const currentWeekLabel = `${startOfWeek.getDate()} – ${endOfWeek.getDate()} ${MONTHS[endOfWeek.getMonth()]}`;

    const fetchWorkouts = async () => {
        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/workouts`, {
                headers: {
                    'Bypass-Tunnel-Reminder': 'true', 'ngrok-skip-browser-warning': 'true',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await res.json();
            setWorkouts(data.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchWorkouts();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchWorkouts();
        setRefreshing(false);
    };

    const getWorkoutsForDay = (day: string) => {
        return workouts.filter((w: any) =>
            w.planned_day === day || (!w.planned_day && day === "Backlog")
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#09090b" />

            <View style={styles.header}>
                <View style={{ marginBottom: 16 }}>
                    <Text style={styles.subtitle}>PLANNER SEMANAL</Text>
                    <Text style={styles.title}>AGENDA DE <Text style={{ color: '#8b5cf6' }}>ALTA PERFORMANCE</Text></Text>
                </View>
                <View style={styles.weekBadge}>
                    <MaterialCommunityIcons name="calendar-week" size={12} color="#8b5cf6" />
                    <Text style={styles.weekBadgeText}>{currentWeekLabel}</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingBox}>
                    <ActivityIndicator color="#8b5cf6" size="large" />
                </View>
            ) : (
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#8b5cf6"
                            colors={["#8b5cf6"]}
                        />
                    }
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContainer}
                        decelerationRate="fast"
                        snapToInterval={280 + 16} // cardWidth + marginRight
                    >
                    {DAYS.map((day) => {
                        const dayWorkouts = getWorkoutsForDay(day);
                        return (
                            <View key={day} style={[styles.column, day === "Backlog" && styles.columnBacklog]}>
                                <View style={[styles.columnHeader, day === todayDay && styles.columnHeaderToday, day === "Backlog" && styles.columnHeaderBacklog]}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Text style={[styles.columnTitle, day === todayDay && { color: '#8b5cf6' }]}>
                                            {day}
                                        </Text>
                                        {day === todayDay && (
                                            <View style={styles.todayBadge}>
                                                <Text style={styles.todayBadgeText}>HOJE</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.countBadge}>
                                        <Text style={styles.countText}>{dayWorkouts.length}</Text>
                                    </View>
                                </View>

                                <ScrollView showsVerticalScrollIndicator={false} style={styles.cardsContainer} contentContainerStyle={{ paddingBottom: 20 }}>
                                    {dayWorkouts.length === 0 ? (
                                        <View style={styles.emptyCard}>
                                            <Text style={styles.emptyCardText}>Livre</Text>
                                        </View>
                                    ) : (
                                        dayWorkouts.map((w: any) => {
                                            const intensity = getIntensityStyle(w.exercises?.length || 0);
                                            return (
                                                <View key={w.id} style={styles.workoutCard}>
                                                    <Text style={styles.workoutTitle} numberOfLines={2}>{w.title}</Text>

                                                    {/* Exercise count meta info */}
                                                    <View style={styles.cardMeta}>
                                                        <MaterialCommunityIcons name="dumbbell" size={11} color="#4B5563" />
                                                        <Text style={styles.cardMetaText}>{w.exercises?.length || 0} exercícios</Text>
                                                    </View>

                                                    {/* Exercise tags - max 2 on mobile */}
                                                    {(w.exercises?.length || 0) > 0 && (
                                                        <View style={styles.exerciseTags}>
                                                            {(w.exercises || []).slice(0, 2).map((ex: any, i: number) => (
                                                                <View key={i} style={styles.exerciseTag}>
                                                                    <Text style={styles.exerciseTagText} numberOfLines={1}>{ex.name}</Text>
                                                                </View>
                                                            ))}
                                                            {(w.exercises?.length || 0) > 2 && (
                                                                <View style={styles.exerciseTag}>
                                                                    <Text style={styles.exerciseTagText}>+{w.exercises.length - 2}</Text>
                                                                </View>
                                                            )}
                                                        </View>
                                                    )}

                                                    <View style={styles.workoutFooter}>
                                                        <View style={styles.timeBox}>
                                                            <MaterialCommunityIcons name="clock-outline" size={14} color="#6B7280" style={{ marginRight: 4 }} />
                                                            <Text style={styles.timeText}>{(w.exercises?.length || 0) * 10} min</Text>
                                                        </View>
                                                        {w.cardio_enabled ? (
                                                            <View style={[styles.intensityBox, { backgroundColor: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.2)', borderWidth: 1 }]}>
                                                                <MaterialCommunityIcons name="heart-pulse" size={12} color="#ef4444" style={{ marginRight: 2 }} />
                                                                <Text style={[styles.intensityText, { color: '#ef4444' }]}>
                                                                    {w.cardio_type === 'calories' ? `${w.cardio_calories}kcal` : `${w.cardio_duration_minutes}min`}
                                                                </Text>
                                                            </View>
                                                        ) : (
                                                            <View style={[styles.intensityBox, intensity.container, { borderWidth: 1 }]}>
                                                                <MaterialCommunityIcons name="fire" size={12} color={intensity.icon} style={{ marginRight: 2 }} />
                                                                <Text style={[styles.intensityText, intensity.text]}>{intensity.label}</Text>
                                                            </View>
                                                        )}
                                                    </View>

                                                    <TouchableOpacity
                                                        style={styles.startBtn}
                                                        accessibilityLabel={`Iniciar treino ${w.title}`}
                                                        accessibilityRole="button"
                                                        onPress={() => navigation.navigate('Execution', { workout: w, token })}
                                                    >
                                                        <MaterialCommunityIcons name="play" size={15} color="#fff" style={{ marginRight: 6 }} />
                                                        <Text style={styles.startBtnText}>INICIAR TREINO</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            );
                                        })
                                    )}
                                </ScrollView>
                            </View>
                        );
                    })}
                    </ScrollView>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#09090b' },
    header: { padding: 24, paddingBottom: 10, marginTop: Platform.OS === 'android' ? 10 : 0 },
    subtitle: { color: '#8b5cf6', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 },
    title: { color: '#fff', fontSize: 28, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: -1 },
    weekBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(139,92,246,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)', alignSelf: 'flex-start', marginTop: 12 },
    weekBadgeText: { color: '#8b5cf6', fontSize: 11, fontWeight: '700' },

    loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    scrollContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 },

    column: { width: 280, marginRight: 16, height: '100%' },
    columnBacklog: { opacity: 0.85 },
    columnHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.02)', borderTopLeftRadius: 16, borderTopRightRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderBottomWidth: 0 },
    columnHeaderToday: { borderColor: 'rgba(139,92,246,0.3)', backgroundColor: 'rgba(139,92,246,0.06)' },
    columnHeaderBacklog: { borderStyle: 'dashed' },
    columnTitle: { color: '#fff', fontSize: 14, fontWeight: '900', textTransform: 'uppercase' },
    todayBadge: { backgroundColor: 'rgba(139,92,246,0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)' },
    todayBadgeText: { color: '#8b5cf6', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
    countBadge: { backgroundColor: 'rgba(255,255,255,0.1)', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    countText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

    cardsContainer: { flex: 1, backgroundColor: 'rgba(255,255,255,0.01)', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', padding: 10 },

    emptyCard: { backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderStyle: 'dashed' },
    emptyCardText: { color: '#4B5563', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 },

    workoutCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    workoutTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 12 },
    workoutFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

    timeBox: { flexDirection: 'row', alignItems: 'center' },
    timeText: { color: '#6B7280', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },

    intensityBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(139,92,246,0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    intensityText: { color: '#8b5cf6', fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },

    startBtn: {
        backgroundColor: '#8b5cf6',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 12,
    },
    startBtnText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },

    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
    cardMetaText: { color: '#4B5563', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },

    exerciseTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 10 },
    exerciseTag: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    exerciseTagText: { color: '#6B7280', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }
});
