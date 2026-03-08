import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import KanbanScreen from '../screens/KanbanScreen';
import WorkoutsScreen from '../screens/WorkoutsScreen';
import StudentsScreen from '../screens/StudentsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator({ route }: any) {
    const { token, user } = route?.params || {};

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarActiveTintColor: '#8b5cf6',
                tabBarInactiveTintColor: '#4B5563',
                tabBarStyle: {
                    backgroundColor: '#18181b', // Glass dark
                    borderTopWidth: 1,
                    borderTopColor: '#27272a',
                    height: Platform.OS === 'ios' ? 85 : 65,
                    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
                    paddingTop: 10,
                    elevation: 0,
                },
            }}
        >
            <Tab.Screen
                name="DashboardTab"
                component={HomeScreen}
                initialParams={{ token, user }}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="home-variant" color={color} size={size + 4} />
                    ),
                }}
            />

            <Tab.Screen
                name="WorkoutsTab"
                component={WorkoutsScreen}
                initialParams={{ token, user }}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="dumbbell" color={color} size={size + 2} />
                    ),
                }}
            />

            <Tab.Screen
                name="KanbanTab"
                component={KanbanScreen}
                initialParams={{ token, user }}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="calendar-month" color={color} size={size + 2} />
                    ),
                }}
            />

            {user?.role === 'personal' && (
                <Tab.Screen
                    name="StudentsTab"
                    component={StudentsScreen}
                    initialParams={{ token, user }}
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="account-group" color={color} size={size + 4} />
                        ),
                    }}
                />
            )}

            <Tab.Screen
                name="SettingsTab"
                component={SettingsScreen}
                initialParams={{ token, user }}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="cog" color={color} size={size + 2} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
