import React from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function StudentsScreen({ route }: any) {
    const { user } = route?.params || {};

    const mockStudents = [
        { id: 2, name: "John Doe", initials: "JD" },
        { id: 3, name: "Alice Miller", initials: "AM" }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#09090b" />
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="account-group" size={24} color="#8b5cf6" style={{ marginRight: 10 }} />
                    <Text style={styles.title}>GESTÃO DE ALUNOS</Text>
                </View>
                <TouchableOpacity style={styles.inviteBtn}>
                    <Text style={styles.inviteBtnText}>+ CONVIDAR</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <MaterialCommunityIcons name="magnify" size={20} color="#6B7280" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar pelo nome ou ID..."
                    placeholderTextColor="#6B7280"
                />
            </View>

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {mockStudents.map((student, i) => (
                    <View key={i} style={styles.studentCard}>
                        <View style={styles.studentInfoRow}>
                            <View style={styles.avatarBox}>
                                <Text style={styles.avatarText}>{student.initials}</Text>
                            </View>
                            <View style={styles.studentDetails}>
                                <Text style={styles.studentName}>{student.name}</Text>
                                <Text style={styles.studentMeta}>ATLETA PRO • ID: {student.id}</Text>
                            </View>
                        </View>
                        <View style={styles.studentActions}>
                            <TouchableOpacity style={styles.msgBtn}>
                                <MaterialCommunityIcons name="message-text-outline" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.dashboardBtn}>
                                <Text style={styles.dashboardBtnText}>VER DASHBOARD</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                <View style={styles.disclaimerBox}>
                    <Text style={styles.disclaimerText}>BASE DE DADOS SINCRONIZADA COM MEDIAPIPE</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#09090b' },
    header: { padding: 24, paddingBottom: 15, marginTop: Platform.OS === 'android' ? 10 : 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { color: '#fff', fontSize: 16, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: -0.5 },

    inviteBtn: { backgroundColor: 'rgba(255, 255, 255, 0.05)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
    inviteBtnText: { color: '#fff', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },

    searchContainer: { marginHorizontal: 20, marginBottom: 20, position: 'relative' },
    searchIcon: { position: 'absolute', left: 16, top: 16, zIndex: 10 },
    searchInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        paddingLeft: 45,
        paddingRight: 20,
        paddingVertical: 15,
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold'
    },

    content: { flex: 1, paddingHorizontal: 20 },

    studentCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.01)',
        padding: 20,
        borderRadius: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)'
    },
    studentInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    avatarBox: {
        width: 50, height: 50, borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center', alignItems: 'center', marginRight: 15
    },
    avatarText: { color: '#8b5cf6', fontSize: 18, fontWeight: '900' },
    studentDetails: { flex: 1 },
    studentName: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    studentMeta: { color: '#6B7280', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },

    studentActions: { flexDirection: 'row', gap: 12 },
    msgBtn: { backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 14, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    dashboardBtn: { flex: 1, backgroundColor: '#8b5cf6', padding: 14, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    dashboardBtnText: { color: '#fff', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },

    disclaimerBox: {
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        marginTop: 10,
        alignItems: 'center'
    },
    disclaimerText: { color: '#6B7280', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' }
});
