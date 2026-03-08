import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    StatusBar,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_CONFIG } from '../config/api';

export default function WorkoutEditorScreen({ route, navigation }: any) {
    const { token, user, workout } = route.params;
    const isEditing = !!workout;

    const [title, setTitle] = useState(workout?.title || '');
    const [description, setDescription] = useState(workout?.description || '');
    const [studentId, setStudentId] = useState(workout?.student_id?.toString() || '');
    const [exercises, setExercises] = useState(workout?.exercises?.map((ex: any) => ({
        name: ex.name,
        sets_config: ex.sets_config || [{ type: 'work', count: 3, reps: '10-12' }]
    })) || [{
        name: '',
        sets_config: [{ type: 'work', count: 3, reps: '10-12' }]
    }]);

    const addExercise = () => {
        setExercises([...exercises, {
            name: '',
            sets_config: [{ type: 'work', count: 3, reps: '10-12' }]
        }]);
    };

    const removeExercise = (index: number) => {
        const newEx = [...exercises];
        newEx.splice(index, 1);
        setExercises(newEx);
    };

    const duplicateExercise = (index: number) => {
        const exToDup = JSON.parse(JSON.stringify(exercises[index]));
        const newEx = [...exercises];
        newEx.splice(index + 1, 0, exToDup);
        setExercises(newEx);
    };

    const updateExerciseName = (index: number, name: string) => {
        const newEx = [...exercises];
        newEx[index].name = name;
        setExercises(newEx);
    };

    const addSetBlock = (exIndex: number) => {
        const newEx = [...exercises];
        newEx[exIndex].sets_config.push({ type: 'work', count: 3, reps: '10-12' });
        setExercises(newEx);
    };

    const removeSetBlock = (exIndex: number, setIndex: number) => {
        const newEx = [...exercises];
        newEx[exIndex].sets_config.splice(setIndex, 1);
        setExercises(newEx);
    };

    const updateSetField = (exIndex: number, setIndex: number, field: string, value: any) => {
        const newEx = [...exercises];
        newEx[exIndex].sets_config[setIndex][field] = value;
        setExercises(newEx);
    };

    const onSave = async () => {
        if (!title.trim()) return Alert.alert('Erro', 'O treino precisa de um título');
        if (exercises.some((e: any) => !e.name.trim())) return Alert.alert('Erro', 'Todos os exercícios precisam de nome');

        const payload = {
            title,
            description,
            student_id: user.role === 'personal' ? studentId : user.id.toString(),
            exercises
        };

        const url = isEditing
            ? `${API_CONFIG.BASE_URL}/api/workouts/${workout.id}`
            : `${API_CONFIG.BASE_URL}/api/workouts`;

        const method = isEditing ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Bypass-Tunnel-Reminder': 'true', 'ngrok-skip-browser-warning': 'true',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                Alert.alert('Sucesso', isEditing ? 'Treino atualizado!' : 'Treino criado!');
                navigation.goBack();
            } else {
                const err = await res.json();
                Alert.alert('Erro', err.message || 'Falha ao salvar treino');
            }
        } catch (e) {
            Alert.alert('Erro', 'Falha de conexão com o servidor');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Text style={styles.backText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{isEditing ? 'Editar Treino' : 'Novo Plano Elite'}</Text>
                    <TouchableOpacity onPress={onSave} style={styles.saveBtn}>
                        <Text style={styles.saveBtnText}>SALVAR</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                    <View style={styles.formCard}>
                        {user.role === 'personal' && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>ID DO ALUNO</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: 2"
                                    placeholderTextColor="#4B5563"
                                    value={studentId}
                                    onChangeText={setStudentId}
                                    keyboardType="numeric"
                                />
                            </View>
                        )}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>TÍTULO DO TREINO</Text>
                            <TextInput
                                style={[styles.input, styles.titleInput]}
                                placeholder="Treino de Hipertrofia..."
                                placeholderTextColor="#4B5563"
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>OBSERVAÇÕES</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Notas de cadência, descanso..."
                                placeholderTextColor="#4B5563"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                            />
                        </View>
                    </View>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>GRADE DE EXERCÍCIOS</Text>
                        <TouchableOpacity onPress={addExercise} style={styles.addBtn}>
                            <Text style={styles.addBtnText}>+ ADD</Text>
                        </TouchableOpacity>
                    </View>

                    {exercises.map((ex: any, exIdx: number) => (
                        <View key={exIdx} style={styles.exCard}>
                            <View style={styles.exCardHeader}>
                                <View style={styles.exNumber}>
                                    <Text style={styles.exNumberText}>{exIdx + 1}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>NOME DO EXERCÍCIO</Text>
                                    <TextInput
                                        style={styles.exTitleInput}
                                        placeholder="Supino..."
                                        placeholderTextColor="#4B5563"
                                        value={ex.name}
                                        onChangeText={(v) => updateExerciseName(exIdx, v)}
                                    />
                                </View>
                            </View>

                            <View style={styles.setsHeader}>
                                <Text style={styles.setsLabel}>CONFIGURAÇÃO DE SÉRIES</Text>
                                <TouchableOpacity onPress={() => addSetBlock(exIdx)}>
                                    <Text style={styles.addSetText}>+ ADD BLOCO</Text>
                                </TouchableOpacity>
                            </View>

                            {ex.sets_config.map((set: any, setIdx: number) => (
                                <View key={setIdx} style={styles.setRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.miniLabel}>TIPO</Text>
                                        <TouchableOpacity style={styles.typeSelector}>
                                            <Text style={styles.typeText}>{set.type.toUpperCase()}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ width: 50 }}>
                                        <Text style={styles.miniLabel}>SETS</Text>
                                        <TextInput
                                            style={styles.miniInput}
                                            value={set.count.toString()}
                                            onChangeText={(v) => updateSetField(exIdx, setIdx, 'count', v)}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View style={{ width: 60 }}>
                                        <Text style={styles.miniLabel}>REPS</Text>
                                        <TextInput
                                            style={styles.miniInput}
                                            value={set.reps}
                                            onChangeText={(v) => updateSetField(exIdx, setIdx, 'reps', v)}
                                            placeholder="8-10"
                                            placeholderTextColor="#4B5563"
                                        />
                                    </View>
                                    {setIdx > 0 && (
                                        <TouchableOpacity onPress={() => removeSetBlock(exIdx, setIdx)} style={styles.removeSetBtn}>
                                            <Text style={styles.removeSetText}>✕</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}

                            <View style={styles.exActions}>
                                <TouchableOpacity onPress={() => duplicateExercise(exIdx)} style={styles.exActionBtn}>
                                    <Text style={styles.exActionText}>DUPLICAR</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => removeExercise(exIdx)} style={[styles.exActionBtn, { borderColor: '#ef4444' }]}>
                                    <Text style={[styles.exActionText, { color: '#ef4444' }]}>EXCLUIR</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}

                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#09090b' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderColor: '#1e1e1e'
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    backText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    saveBtn: {
        backgroundColor: '#8b5cf6',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 10
    },
    saveBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    scroll: { flex: 1, padding: 20 },
    formCard: {
        backgroundColor: '#18181b',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#27272a',
        marginBottom: 30
    },
    inputGroup: { marginBottom: 20 },
    label: { color: '#4B5563', fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 },
    input: {
        backgroundColor: '#09090b30',
        borderWidth: 1,
        borderColor: '#27272a',
        borderRadius: 12,
        padding: 15,
        color: '#fff',
        fontSize: 16
    },
    titleInput: { fontSize: 20, fontWeight: 'bold', borderColor: '#8b5cf630' },
    textArea: { height: 100, textAlignVertical: 'top' },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'black', fontStyle: 'italic' },
    addBtn: { backgroundColor: '#8b5cf6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    addBtnText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    exCard: {
        backgroundColor: '#18181b',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#27272a',
        marginBottom: 20
    },
    exCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    exNumber: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#27272a',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    exNumberText: { color: '#9CA3AF', fontWeight: 'bold' },
    exTitleInput: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        borderBottomWidth: 1,
        borderColor: '#27272a',
        paddingVertical: 5
    },
    setsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15
    },
    setsLabel: { color: '#4B5563', fontSize: 9, fontWeight: 'bold' },
    addSetText: { color: '#8b5cf6', fontSize: 9, fontWeight: 'bold' },
    setRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#09090b',
        padding: 12,
        borderRadius: 16,
        marginBottom: 10,
        gap: 10
    },
    miniLabel: { color: '#4B5563', fontSize: 8, fontWeight: 'bold', marginBottom: 4 },
    typeSelector: { paddingVertical: 5 },
    typeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    miniInput: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        borderBottomWidth: 1,
        borderColor: '#1e1e1e',
        paddingVertical: 2
    },
    removeSetBtn: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
    removeSetText: { color: '#4B5563', fontSize: 12 },
    exActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 15,
        gap: 10,
        borderTopWidth: 1,
        borderColor: '#27272a',
        paddingTop: 15
    },
    exActionBtn: {
        borderWidth: 1,
        borderColor: '#27272a',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8
    },
    exActionText: { color: '#9CA3AF', fontSize: 9, fontWeight: 'bold' }
});
