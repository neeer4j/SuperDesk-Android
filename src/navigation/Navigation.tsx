// Navigation setup for SuperDesk Mobile
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import RemoteScreen from '../screens/RemoteScreen';
import SessionScreen from '../screens/SessionScreen';

export type RootStackParamList = {
    Home: undefined;
    Remote: {
        sessionId: string;
        role: 'viewer' | 'host';
    };
    Session: {
        role: 'host';
    };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const Navigation: React.FC = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    contentStyle: { backgroundColor: '#0a0a0f' },
                }}
            >
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen
                    name="Remote"
                    component={RemoteScreen}
                    options={{
                        animation: 'fade',
                        gestureEnabled: false,
                    }}
                />
                <Stack.Screen name="Session" component={SessionScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default Navigation;
