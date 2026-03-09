import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import ExecutionScreen from './src/screens/ExecutionScreen';
import WorkoutEditorScreen from './src/screens/WorkoutEditorScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={MainTabNavigator} />
        <Stack.Screen name="Execution" component={ExecutionScreen} />
        <Stack.Screen name="WorkoutEditor" component={WorkoutEditorScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}