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
    Dimensions,
    Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { API_CONFIG } from '../config/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PAD = Math.max(16, SCREEN_WIDTH * 0.05);

export default function WorkoutsScreen({ route, navigation }: any) {
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

    const deleteWorkout = (id: number) => {
        Alert.alert(
            'Excluir Treino',
            'Deseja realmente remover este plano de treino?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => {
                        setLoading(true);
                        fetch(`${API_CONFIG.BASE_URL}/api/workouts/${id}`, {
                            method: 'DELETE',
                            headers: {
                                'Bypass-Tunnel-Reminder': 'true', 'ngrok-skip-browser-warning': 'true',
                                'Authorization': `Bearer ${token}`,
                                'Accept': 'application/json',
                            },
                        })
                            .then(() => fetchWorkouts())
                            .catch(err => {
                                console.error(err);
                                setLoading(false);
                            });
                    },
                },
            ]
        );
    };

    const renderCard = ({ item }: any) => {
        let subTitle = 'TREINO';
        let mainTitle = item.title;
        if (item.title.toUpperCase().startsWith('TREINO')) {
            const parts = item.title.split('-');
            subTitle = parts[0].trim().toUpperCase();
            mainTitle = parts.length > 1 ? parts.slice(1).join('-').trim() : item.title;
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

                    <View style={styles.actionButtons}>
                        {(user.role === 'personal' || user.id === item.student_id) && (
                            <TouchableOpacity
                                style={styles.editBtnBox}
                                onPress={() =>
                                    navigation.navigate('WorkoutEditor', { workout: item, token, user })
                                }
                            >
                                <MaterialCommunityIcons name="pencil-outline" size={15} color="#6B7280" />
                            </TouchableOpacity>
                        )}
                        {(user.role === 'personal' || user.role === 'user') && (
                            <TouchableOpacity
                                style={[styles.editBtnBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)', marginLeft: 8 }]}
                                onPress={() => deleteWorkout(item.id)}
                            >
                                <MaterialCommunityIcons name="trash-can-outline" size={15} color="#EF4444" />
                            </TouchableOpacity>
                        )}
                    </View>
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

    const renderHeader = () => (
        <View style={styles.header}>
            <View>
                <Text style={styles.dashboardHeaderTitle}>Gestão de</Text>
                <Text style={[styles.dashboardHeaderTitle, { color: '#8b5cf6' }]}>Planos de Treino</Text>
            </View>
            {canCreate && (
                <TouchableOpacity
                    style={styles.newWorkoutBtn}
                    onPress={() => navigation.navigate('WorkoutEditor', { token, user })}
                >
                    <Text style={styles.newWorkoutBtnText}>+ NOVO PLANO</Text>
                </TouchableOpacity>
            )}
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
                <FlatList
                    data={workouts}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderCard}
                    ListHeaderComponent={renderHeader}
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
                            <Text style={styles.emptyTextHeader}>NENHUM TREINO CADASTRADO</Text>
                            <Text style={styles.emptyText}>Clique em Novo Plano para começar.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#09090b',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        marginBottom: 10,
    },
    dashboardHeaderTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        letterSpacing: -0.5,
    },
    newWorkoutBtn: {
        backgroundColor: '#8b5cf6',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    newWorkoutBtnText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    listContainer: {},
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
    actionButtons: {
        flexDirection: 'row',
    },
    editBtnBox: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        width: 28,
        height: 28,
        borderRadius: 14,
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
    centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        borderStyle: 'dashed',
        marginTop: 10,
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
