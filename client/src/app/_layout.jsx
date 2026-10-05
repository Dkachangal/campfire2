import { Slot, useRouter, useRootNavigationState } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;

    const initAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userName = await AsyncStorage.getItem('userName');

        if (token && userName) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      } catch (e) {
        console.error("Init auth failed", e);
      } finally {
        setIsReady(true);
      }
    };

    initAuth();
  }, [navigationState?.key]);

  if (!isReady || !navigationState?.key) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#1A110D' }}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      {/* Ensures status bar icons (time, wifi) light up clearly over the dark top bar */}
      <StatusBar style="light" translucent />
      <Slot />
    </SafeAreaProvider>
  );
}
