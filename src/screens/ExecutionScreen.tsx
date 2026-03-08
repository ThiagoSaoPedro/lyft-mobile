import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    StatusBar,
    FlatList,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { z } from 'zod';

// Form validation schema
const setSchema = z.object({
    weight: z.number().nonnegative("Carga inválida"),
    reps: z.number().int().nonnegative("Reps inválidas"),
    effort: z.number().int().min(1, "1 a 10").max(10, "1 a 10")
});

const DEFAULT_WORKOUT = {
    id: 999,
    title: "Treino do Dia (Padrão)",
    exercises: [
        { name: "Supino Reto", sets_config: [{ type: "work", count: 3, reps: "10" }] },
        { name: "Agachamento Livre", sets_config: [{ type: "work", count: 4, reps: "8-10" }] }
    ]
};

const MOCK_WORKOUTS = [
    DEFAULT_WORKOUT,
    {
        id: 1000,
        title: "Costas e Bíceps",
        exercises: [
            { name: "Puxada Frontal", sets_config: [{ type: "work", count: 3, reps: "12" }] },
            { name: "Rosca Direta", sets_config: [{ type: "work", count: 3, reps: "10" }] }
        ]
    }
];

export default function ExecutionScreen({ route, navigation }: any) {
    const passedWorkout = route?.params?.workout;

    const [workout, setWorkout] = useState<any>(passedWorkout || DEFAULT_WORKOUT);
    const [isStarted, setIsStarted] = useState(false);
    const [totalSeconds, setTotalSeconds] = useState(0);
    const [restSeconds, setRestSeconds] = useState(0);

    // Timer Refs
    const totalTimerRef = useRef<NodeJS.Timeout | null>(null);
    const restTimerRef = useRef<NodeJS.Timeout | null>(null);

    // View Modes
    const [viewMode, setViewMode] = useState<'carousel' | 'list'>('carousel');
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [expandedAccordions, setExpandedAccordions] = useState<Set<number>>(new Set([0]));

    // Workout Selection Modal
    const [showWorkoutSelector, setShowWorkoutSelector] = useState(false);

    // Form Data State [exerciseIndex][setIndex] -> { weight, reps, effort, done }
    const [setsData, setSetsData] = useState<any>({});

    // Initialize set tracking data when workout changes
    useEffect(() => {
        if (!workout) return;
        const initialData: any = {};
        workout.exercises.forEach((ex: any, exIdx: number) => {
            initialData[exIdx] = [];
            let setIndexCount = 0;
            ex.sets_config?.forEach((config: any) => {
                for (let i = 0; i < (config.count || 1); i++) {
                    initialData[exIdx].push({
                        weight: '',
                        reps: '',
                        effort: '',
                        done: false,
                        error: null,
                    });
                }
            });
        });
        setSetsData(initialData);
        setTotalSeconds(0);
        setIsStarted(false);
        setRestSeconds(0);
    }, [workout]);

    // Timers cleanup
    useEffect(() => {
        return () => {
            if (totalTimerRef.current) clearInterval(totalTimerRef.current);
            if (restTimerRef.current) clearInterval(restTimerRef.current);
        };
    }, []);

    const startWorkout = () => {
        setIsStarted(true);
        totalTimerRef.current = setInterval(() => {
            setTotalSeconds(prev => prev + 1);
        }, 1000);
    };

    const endWorkout = () => {
        Alert.alert("Encerrar Treino", "Deseja finalizar o treino?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Encerrar",
                style: "destructive",
                onPress: () => {
                    if (totalTimerRef.current) clearInterval(totalTimerRef.current);
                    if (restTimerRef.current) clearInterval(restTimerRef.current);
                    Alert.alert("Parabéns!", `Treino concluído com sucesso em ${formatTime(totalSeconds)}.`);
                    navigation.goBack();
                }
            }
        ]);
    };

    const startRest = () => {
        if (restTimerRef.current) clearInterval(restTimerRef.current);
        setRestSeconds(60); // 60 seconds default rest
        restTimerRef.current = setInterval(() => {
            setRestSeconds(prev => {
                if (prev <= 1) {
                    clearInterval(restTimerRef.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const updateSet = (exIdx: number, setIdx: number, field: string, value: string) => {
        setSetsData((prev: any) => {
            const newData = { ...prev };
            newData[exIdx][setIdx] = {
                ...newData[exIdx][setIdx],
                [field]: value,
                error: null // Reset error on change
            };
            return newData;
        });
    };

    const completeSet = (exIdx: number, setIdx: number) => {
        const set = setsData[exIdx][setIdx];
        try {
            setSchema.parse({
                weight: parseFloat(set.weight) || 0,
                reps: parseInt(set.reps, 10) || 0,
                effort: parseInt(set.effort, 10) || 0,
            });

            setSetsData((prev: any) => {
                const newData = { ...prev };
                newData[exIdx][setIdx].done = true;
                newData[exIdx][setIdx].error = null;
                return newData;
            });
            startRest();
        } catch (e: any) {
            setSetsData((prev: any) => {
                const newData = { ...prev };
                newData[exIdx][setIdx].error = e.errors?.[0]?.message || 'Inválido';
                return newData;
            });
        }
    };

    const toggleAccordion = (idx: number) => {
        setExpandedAccordions(prev => {
            const next = new Set(prev);
            if (next.has(idx)) next.delete(idx);
            else next.add(idx);
            return next;
        });
    };

    const formatTime = (totalSecs: number) => {
        const m = Math.floor(totalSecs / 60).toString().padStart(2, '0');
        const s = (totalSecs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const renderSetForms = (exIdx: number) => {
        const sets = setsData[exIdx] || [];
        return (
            <View style={styles.setsContainer}>
                <View style={styles.setHeaderRow}>
                    <Text style={[styles.setColHeader, { width: 30 }]}>Set</Text>
                    <Text style={[styles.setColHeader, { flex: 1 }]}>Último</Text>
                    <Text style={[styles.setColHeader, { width: 60 }]}>kg</Text>
                    <Text style={[styles.setColHeader, { width: 60 }]}>Reps</Text>
                    <Text style={[styles.setColHeader, { width: 50, textAlign: 'center' }]}>Esforço {"\n"}(1-10)</Text>
                    <Text style={[styles.setColHeader, { width: 40 }]}></Text>
                </View>
                {sets.map((set: any, setIdx: number) => {
                    const isDone = set.done;
                    return (
                        <View key={setIdx} style={[styles.setRow, isDone && styles.setRowDone]}>
                            <View style={[styles.setIndexBox, isDone && { backgroundColor: '#10B981' }]}>
                                <Text style={styles.setIndexText}>{setIdx + 1}</Text>
                            </View>
                            <View style={{ flex: 1, paddingLeft: 10, justifyContent: 'center' }}>
                                <Text style={styles.lastHistoryText}>20kg x 12</Text>
                            </View>
                            <TextInput
                                testID={`weight-input-${exIdx}-${setIdx}`}
                                style={[styles.setInput, { width: 60 }, set.error && styles.inputError]}
                                value={set.weight}
                                onChangeText={(v) => updateSet(exIdx, setIdx, 'weight', v)}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor="#4B5563"
                                editable={!isDone}
                            />
                            <TextInput
                                testID={`reps-input-${exIdx}-${setIdx}`}
                                style={[styles.setInput, { width: 60 }, set.error && styles.inputError]}
                                value={set.reps}
                                onChangeText={(v) => updateSet(exIdx, setIdx, 'reps', v)}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor="#4B5563"
                                editable={!isDone}
                            />
                            <TextInput
                                testID={`effort-input-${exIdx}-${setIdx}`}
                                style={[styles.setInput, { width: 50, textAlign: 'center' }, set.error && styles.inputError]}
                                value={set.effort}
                                onChangeText={(v) => updateSet(exIdx, setIdx, 'effort', v)}
                                keyboardType="numeric"
                                placeholder="--"
                                placeholderTextColor="#4B5563"
                                editable={!isDone}
                            />
                            <TouchableOpacity
                                testID={`check-btn-${exIdx}-${setIdx}`}
                                style={[styles.checkBtn, isDone && { backgroundColor: '#10B981', borderColor: '#10B981' }]}
                                onPress={() => isDone ? updateSet(exIdx, setIdx, 'done', 'false') : completeSet(exIdx, setIdx)}
                            >
                                <MaterialCommunityIcons name="check" size={16} color={isDone ? "#fff" : "#8b5cf6"} />
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </View>
        );
    };

    const renderWorkoutSelector = () => (
        <Modal visible={showWorkoutSelector} animationType="slide" transparent>
            <View style={styles.modalBg}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Selecionar Treino</Text>
                    <FlatList
                        data={MOCK_WORKOUTS}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.modalItem}
                                onPress={() => {
                                    setWorkout(item);
                                    setShowWorkoutSelector(false);
                                }}
                            >
                                <Text style={styles.modalItemTitle}>{item.title}</Text>
                                <Text style={styles.modalItemSubtitle}>{item.exercises.length} exercícios</Text>
                            </TouchableOpacity>
                        )}
                    />
                    <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowWorkoutSelector(false)}>
                        <Text style={styles.modalCloseBtnText}>CANCELAR</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    if (!isStarted) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={[styles.centerBox, { padding: 20 }]}>
                    <View style={styles.unstartedHeader}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.preStartTitle}>Pronto para iniciar?</Text>
                    <View style={styles.workoutBox}>
                        <Text style={styles.workoutBoxLabel}>TREINO SELECIONADO</Text>
                        <Text style={styles.workoutBoxTitle} numberOfLines={2}>{workout?.title}</Text>
                        <Text style={styles.workoutBoxSubtitle}>{workout?.exercises?.length || 0} exercícios</Text>
                    </View>

                    <TouchableOpacity style={styles.selectOthersBtn} onPress={() => setShowWorkoutSelector(true)}>
                        <Text style={styles.selectOthersText}>Selecionar outro treino</Text>
                    </TouchableOpacity>

                    <TouchableOpacity testID="start-workout-btn" style={styles.hugeStartBtn} onPress={startWorkout}>
                        <Text style={styles.hugeStartText}>INICIAR TREINO</Text>
                    </TouchableOpacity>
                </View>
                {renderWorkoutSelector()}
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

                {/* Header Timers */}
                <View style={styles.header}>
                    <View style={styles.timerBox}>
                        <Text style={styles.timerLabel}>TEMPO TOTAL</Text>
                        <Text testID="total-timer" style={styles.timerValue}>{formatTime(totalSeconds)}</Text>
                    </View>
                    <View style={[styles.timerBox, { backgroundColor: restSeconds > 0 ? '#10B98120' : '#27272a', borderColor: restSeconds > 0 ? '#10B981' : '#27272a' }]}>
                        <Text style={[styles.timerLabel, restSeconds > 0 && { color: '#10B981' }]}>DESCANSO</Text>
                        <Text testID="rest-timer" style={[styles.timerValue, restSeconds > 0 && { color: '#10B981' }]}>
                            {restSeconds > 0 ? formatTime(restSeconds) : '--:--'}
                        </Text>
                    </View>
                </View>

                {/* View Mode Toggle */}
                <View style={styles.toggleRow}>
                    <Text style={styles.headerWorkoutTitle} numberOfLines={1}>{workout.title}</Text>
                    <View style={styles.toggleGroup}>
                        <TouchableOpacity
                            testID="mode-carousel"
                            style={[styles.toggleBtn, viewMode === 'carousel' && styles.toggleBtnActive]}
                            onPress={() => setViewMode('carousel')}
                        >
                            <MaterialCommunityIcons name="view-carousel" size={18} color={viewMode === 'carousel' ? "#fff" : "#9CA3AF"} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            testID="mode-list"
                            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
                            onPress={() => setViewMode('list')}
                        >
                            <MaterialCommunityIcons name="view-sequential" size={18} color={viewMode === 'list' ? "#fff" : "#9CA3AF"} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Main Content */}
                <View style={styles.contentArea}>
                    {viewMode === 'carousel' ? (
                        <View style={styles.carouselContainer}>
                            <View style={styles.activeCard}>
                                <Text style={styles.exTitle}>{workout.exercises[carouselIndex]?.name}</Text>
                                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                                    {renderSetForms(carouselIndex)}
                                </ScrollView>
                            </View>
                            <View style={styles.carouselControls}>
                                <TouchableOpacity
                                    style={[styles.navBtn, carouselIndex === 0 && { opacity: 0.3 }]}
                                    onPress={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
                                    disabled={carouselIndex === 0}
                                >
                                    <Text style={styles.navBtnText}>ANTERIOR</Text>
                                </TouchableOpacity>
                                <Text style={styles.navProgress}>{carouselIndex + 1} / {workout.exercises.length}</Text>
                                <TouchableOpacity
                                    style={[styles.navBtn, carouselIndex === workout.exercises.length - 1 && { opacity: 0.3 }]}
                                    onPress={() => setCarouselIndex(Math.min(workout.exercises.length - 1, carouselIndex + 1))}
                                    disabled={carouselIndex === workout.exercises.length - 1}
                                >
                                    <Text style={styles.navBtnText}>PRÓXIMO</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <FlatList
                            data={workout.exercises}
                            keyExtractor={(item, index) => index.toString()}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 100 }}
                            renderItem={({ item, index }) => {
                                const isExpanded = expandedAccordions.has(index);
                                return (
                                    <View style={styles.accordionContainer}>
                                        <TouchableOpacity
                                            testID={`accordion-toggle-${index}`}
                                            style={styles.accordionHeader}
                                            onPress={() => toggleAccordion(index)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <View style={styles.accordionIndexBox}><Text style={styles.accordionIndexText}>{index + 1}</Text></View>
                                                <Text style={styles.accordionTitle}>{item.name}</Text>
                                            </View>
                                            <MaterialCommunityIcons name={isExpanded ? "chevron-up" : "chevron-down"} size={24} color="#9CA3AF" />
                                        </TouchableOpacity>
                                        {isExpanded && (
                                            <View style={styles.accordionBody}>
                                                {renderSetForms(index)}
                                            </View>
                                        )}
                                    </View>
                                );
                            }}
                        />
                    )}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity testID="end-workout-btn" style={styles.finishBtn} onPress={endWorkout}>
                        <Text style={styles.finishBtnText}>ENCERRAR TREINO</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
            {renderWorkoutSelector()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    unstartedHeader: { position: 'absolute', top: 50, left: 20 },
    backBtn: { padding: 10 },
    preStartTitle: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 40 },
    workoutBox: {
        width: '100%',
        backgroundColor: '#18181b',
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#27272a',
        alignItems: 'center',
        marginBottom: 20
    },
    workoutBoxLabel: { color: '#8b5cf6', fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 },
    workoutBoxTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
    workoutBoxSubtitle: { color: '#9CA3AF', fontSize: 13 },
    selectOthersBtn: { padding: 10, marginBottom: 40 },
    selectOthersText: { color: '#9CA3AF', textDecorationLine: 'underline', fontSize: 14 },
    hugeStartBtn: {
        width: '100%',
        backgroundColor: '#8b5cf6',
        paddingVertical: 20,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5
    },
    hugeStartText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1 },

    header: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        borderBottomWidth: 1,
        borderColor: '#18181b'
    },
    timerBox: {
        flex: 1,
        backgroundColor: '#18181b',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#27272a',
        alignItems: 'center'
    },
    timerLabel: { color: '#4B5563', fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
    timerValue: { color: '#fff', fontSize: 24, fontWeight: '900', fontVariant: ['tabular-nums'] },

    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12
    },
    headerWorkoutTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', flex: 1, paddingRight: 10 },
    toggleGroup: { flexDirection: 'row', backgroundColor: '#18181b', borderRadius: 8, padding: 2 },
    toggleBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
    toggleBtnActive: { backgroundColor: '#27272a' },

    contentArea: { flex: 1, paddingHorizontal: 16 },

    // Carousel styles
    carouselContainer: { flex: 1 },
    activeCard: {
        flex: 1,
        backgroundColor: '#18181b',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#27272a',
        padding: 16,
        marginBottom: 16
    },
    exTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    carouselControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    navBtn: { backgroundColor: '#27272a', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
    navBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    navProgress: { color: '#9CA3AF', fontSize: 14, fontWeight: 'bold' },

    // Accordion styles
    accordionContainer: {
        backgroundColor: '#18181b',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#27272a',
        marginBottom: 12,
        overflow: 'hidden'
    },
    accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    accordionIndexBox: { width: 28, height: 28, backgroundColor: '#27272a', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    accordionIndexText: { color: '#9CA3AF', fontSize: 12, fontWeight: 'bold' },
    accordionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    accordionBody: { padding: 16, borderTopWidth: 1, borderColor: '#27272a' },

    // Sets styles
    setsContainer: { marginTop: 10 },
    setHeaderRow: { flexDirection: 'row', marginBottom: 12, paddingHorizontal: 5 },
    setColHeader: { color: '#6B7280', fontSize: 10, fontWeight: 'bold', textAlign: 'center' },
    setRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
    setRowDone: { opacity: 0.6 },
    setIndexBox: { width: 30, height: 30, backgroundColor: '#27272a', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    setIndexText: { color: '#D1D5DB', fontSize: 12, fontWeight: 'bold' },
    lastHistoryText: { color: '#6B7280', fontSize: 11, fontStyle: 'italic' },
    setInput: {
        backgroundColor: '#09090b',
        borderWidth: 1,
        borderColor: '#27272a',
        borderRadius: 8,
        color: '#fff',
        height: 40,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: 'bold'
    },
    inputError: { borderColor: '#EF4444' },
    checkBtn: {
        width: 40,
        height: 40,
        backgroundColor: '#8b5cf615',
        borderWidth: 1,
        borderColor: '#8b5cf630',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },

    footer: { padding: 16, borderTopWidth: 1, borderColor: '#18181b', backgroundColor: '#09090b' },
    finishBtn: { backgroundColor: '#EF4444', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    finishBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },

    // Modal styles
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#18181b', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
    modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
    modalItem: { backgroundColor: '#27272a', padding: 16, borderRadius: 12, marginBottom: 12 },
    modalItemTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    modalItemSubtitle: { color: '#9CA3AF', fontSize: 12 },
    modalCloseBtn: { marginTop: 10, padding: 16, alignItems: 'center' },
    modalCloseBtnText: { color: '#9CA3AF', fontSize: 12, fontWeight: 'bold' }
});
