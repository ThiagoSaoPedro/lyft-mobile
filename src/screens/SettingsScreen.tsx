import React from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SettingsScreen({ route, navigation }: any) {
    const { user } = route?.params || {};

    const sections = [
        { title: "Perfil", icon: "account", desc: "Gerencie suas informações pessoais e credenciais." },
        { title: "Privacidade", icon: "shield", desc: "Controle quem pode ver seus dados." },
        { title: "Notificações", icon: "bell", desc: "Configure alertas de treinos e novidades." },
        { title: "Dispositivos", icon: "watch", desc: "Sincronize Apple Watch ou Garmin." },
    ];

    const handleLogout = () => {
        navigation.replace('Login');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#09090b" />
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="cog" size={24} color="#8b5cf6" style={{ marginRight: 10 }} />
                    <Text style={styles.title}>CONFIGURAÇÕES</Text>
                </View>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {sections.map((sec, i) => (
                    <View key={i} style={styles.settingsCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.iconBox}>
                                <MaterialCommunityIcons name={sec.icon as any} size={22} color="#8b5cf6" />
                            </View>
                            <MaterialCommunityIcons name="lock" size={16} color="#4B5563" />
                        </View>
                        <Text style={styles.cardTitle}>{sec.title}</Text>
                        <Text style={styles.cardDesc}>{sec.desc}</Text>
                        <View style={styles.badgeBox}>
                            <Text style={styles.badgeText}>EM BREVE NA V2.0</Text>
                        </View>
                    </View>
                ))}

                <View style={styles.promoCard}>
                    <View style={styles.promoContent}>
                        <Text style={styles.promoTitle}>PLANO DE ELITE ATIVO</Text>
                        <Text style={styles.promoDesc}>Você está usando a versão Pro do Lyft. Aproveite o app.</Text>
                    </View>
                    <TouchableOpacity style={styles.upgradeBtn}>
                        <Text style={styles.upgradeBtnText}>UPGRADE</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <MaterialCommunityIcons name="logout" size={20} color="#f87171" style={{ marginRight: 8 }} />
                    <Text style={styles.logoutBtnText}>ENCERRAR SESSÃO</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#09090b' },
    header: { padding: 24, paddingBottom: 10, marginTop: Platform.OS === 'android' ? 10 : 0 },
    title: { color: '#fff', fontSize: 18, fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: -0.5 },
    content: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },

    settingsCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        padding: 24,
        borderRadius: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)'
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    iconBox: {
        width: 44, height: 44, borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center', alignItems: 'center'
    },
    cardTitle: { color: '#fff', fontSize: 16, fontWeight: '900', textTransform: 'uppercase', marginBottom: 6 },
    cardDesc: { color: '#9CA3AF', fontSize: 13, marginBottom: 16, lineHeight: 20 },
    badgeBox: { alignSelf: 'flex-start', backgroundColor: 'rgba(139, 92, 246, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    badgeText: { color: '#8b5cf6', fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },

    promoCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        padding: 24,
        borderRadius: 32,
        marginTop: 10,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.2)',
        flexDirection: 'column',
    },
    promoContent: { marginBottom: 20 },
    promoTitle: { color: '#fff', fontSize: 18, fontWeight: '900', fontStyle: 'italic', marginBottom: 6 },
    promoDesc: { color: '#9CA3AF', fontSize: 12, lineHeight: 18 },
    upgradeBtn: { backgroundColor: '#fff', paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
    upgradeBtnText: { color: '#000', fontSize: 11, fontWeight: '900', letterSpacing: 2 },

    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(248, 113, 113, 0.1)',
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(248, 113, 113, 0.2)'
    },
    logoutBtnText: { color: '#f87171', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 }
});
