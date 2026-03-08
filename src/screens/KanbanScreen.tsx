import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { API_CONFIG } from '../config/api';

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo", "Backlog"];

export default function KanbanScreen({ route, navigation }: any) {
    const { token, user } = route?.params || {};
    const [workouts, setWorkouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    const getWorkoutsForDay = (day: string) => {
        return workouts.filter((w: any) =>
            w.planned_day === day || (!w.planned_day && day === "Backlog")
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#09090b" />

            <View style={styles.header}>
                <Text style={styles.subtitle}>PLANNER SEMANAL</Text>
                <Text style={styles.title}>AGENDA DE <Text style={{ color: '#8b5cf6' }}>ALTA PERFORMANCE</Text></Text>
            </View>

            {loading ? (
                <View style={styles.loadingBox}>
                    <ActivityIndicator color="#8b5cf6" size="large" />
                </View>
            ) : (
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
                            <View key={day} style={styles.column}>
                                <View style={styles.columnHeader}>
                                    <Text style={styles.columnTitle}>{day}</Text>
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
                                        dayWorkouts.map((w: any) => (
                                            <View key={w.id} style={styles.workoutCard}>
                                                <Text style={styles.workoutTitle} numberOfLines={2}>{w.title}</Text>
                                                <View style={styles.workoutFooter}>
                                                    <View style={styles.timeBox}>
                                                        <MaterialCommunityIcons name="clock-outline" size={14} color="#6B7280" style={{ marginRight: 4 }} />
                                                        <Text style={styles.timeText}>{(w.exercises?.length || 0) * 10} min</Text>
                                                    </View>
                                                    <View style={styles.intensityBox}>
                                                        <MaterialCommunityIcons name="fire" size={12} color="#8b5cf6" style={{ marginRight: 2 }} />
                                                        <Text style={styles.intensityText}>{(w.exercises?.length || 0) > 5 ? 'High' : 'Med'}</Text>
                                                    </View>
                                                </View>
                                                <TouchableOpacity
                                                    style={styles.startBtn}
                                                    onPress={() => navigation.navigate('Execution', { workout: w, token })}
                                                >
                                                    <MaterialCommunityIcons name="play" size={15} color="#fff" style={{ marginRight: 6 }} />
                                                    <Text style={styles.startBtnText}>INICIAR TREINO</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ))
                                    )}
                                </ScrollView>
                            </View>
                        );
                    })}
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

    loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    scrollContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 },

    column: { width: 280, marginRight: 16, height: '100%' },
    columnHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.02)', borderTopLeftRadius: 16, borderTopRightRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderBottomWidth: 0 },
    columnTitle: { color: '#fff', fontSize: 14, fontWeight: '900', textTransform: 'uppercase' },
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
    }
});
