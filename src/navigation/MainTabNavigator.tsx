import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import KanbanScreen from '../screens/KanbanScreen';
import WorkoutsScreen from '../screens/WorkoutsScreen';
import StudentsScreen from '../screens/StudentsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator({ route }: any) {
    const { token, user } = route?.params || {};

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarActiveTintColor: '#a78bfa',
                tabBarInactiveTintColor: '#4B5563',
                tabBarStyle: {
                    backgroundColor: '#09090b', // Ultra dark background
                    borderTopWidth: 1,
                    borderTopColor: '#18181b',
                    height: Platform.OS === 'ios' ? 88 : 68,
                    paddingBottom: Platform.OS === 'ios' ? 32 : 12,
                    paddingTop: 12,
                    elevation: 0,
                    shadowOpacity: 0,
                },
            }}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeScreen}
                initialParams={{ token, user }}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="home-variant" color={color} size={size + 6} />
                    ),
                }}
            />

            <Tab.Screen
                name="WorkoutsTab"
                component={WorkoutsScreen}
                initialParams={{ token, user }}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="dumbbell" color={color} size={size + 4} />
                    ),
                }}
            />

            <Tab.Screen
                name="KanbanTab"
                component={KanbanScreen}
                initialParams={{ token, user }}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="calendar-month" color={color} size={size + 4} />
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
                            <MaterialCommunityIcons name="account-group" color={color} size={size + 6} />
                        ),
                    }}
                />
            )}

            <Tab.Screen
                name="ProfileTab"
                component={ProfileScreen}
                initialParams={{ token, user }}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="account-circle-outline" color={color} size={size + 6} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
