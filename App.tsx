// SuperDesk Mobile - Main App
import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Navigation from './src/navigation/Navigation';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Require cycle:',
  'new NativeEventEmitter',
]);

const App: React.FC = () => {
  useEffect(() => {
    // App initialization logic
    console.log('🚀 SuperDesk Mobile started');
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0a0a0f"
        translucent={false}
      />
      <Navigation />
    </GestureHandlerRootView>
  );
};

export default App;
