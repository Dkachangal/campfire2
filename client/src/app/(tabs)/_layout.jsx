import { Tabs } from 'expo-router';
import { Text, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs screenOptions={{
      headerShown: false, 
      tabBarActiveTintColor: '#E05A10', // Vibrant Burnt Orange
      tabBarInactiveTintColor: '#C2A38F', // Soft sandy brown
      tabBarStyle: { 
        backgroundColor: '#FCF8F2', // Solid light cream
        borderTopWidth: 1,
        borderTopColor: 'rgba(224, 90, 16, 0.1)', 
        elevation: 0, // Removes Android shadow
        shadowOpacity: 0, // Removes iOS shadow
        
        // DYNAMIC HEIGHT: Adds custom layout height plus the physical button safe area at the bottom
        height: 60 + insets.bottom, 
        
        // PADDING: Safely pushes the interactive icons up, away from the hardware buttons
        paddingBottom: insets.bottom > 0 ? insets.bottom - 5 : 8,
        paddingTop: 8,
      },
      tabBarShowLabel: false,
      
      // Ensures the icons stay vertically aligned inside their designated slot
      tabBarIconStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      }
    }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 24, transform: [{ translateY: Platform.OS === 'android' ? -2 : 0 }] }}>🔥</Text> 
          )
        }} 
      />
      <Tabs.Screen 
        name="surge" 
        options={{ 
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 24, transform: [{ translateY: Platform.OS === 'android' ? -2 : 0 }] }}>⚡</Text> 
          )
        }} 
      />
      <Tabs.Screen 
        name="create" 
        options={{ 
          tabBarIcon: () => (
            <View style={{ 
              backgroundColor: 'rgba(224, 90, 16, 0.1)', 
              borderRadius: 20, 
              width: 40, 
              height: 40, 
              justifyContent: 'center', 
              alignItems: 'center', 
              borderWidth: 1, 
              borderColor: 'rgba(224, 90, 16, 0.2)',
              transform: [{ translateY: Platform.OS === 'android' ? -2 : 0 }]
            }}>
              <Text style={{ color: '#E05A10', fontSize: 24, fontWeight: 'bold', lineHeight: 26, textAlign: 'center' }}>+</Text>
            </View>
          ) 
        }} 
      />
      <Tabs.Screen 
        name="dms" 
        options={{ 
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 24, transform: [{ translateY: Platform.OS === 'android' ? -2 : 0 }] }}>💬</Text> 
          )
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 24, transform: [{ translateY: Platform.OS === 'android' ? -2 : 0 }] }}>👤</Text> 
          )
        }} 
      />
    </Tabs>
  );
}
