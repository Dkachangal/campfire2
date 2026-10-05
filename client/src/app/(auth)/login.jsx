import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://campfire2-sndp.onrender.com/api/auth'; 

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }), 
      });
      
      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('userToken', data.token); 
        await AsyncStorage.setItem('userName', data.userName); // 👈 THIS FIXES THE BUG
        
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login Failed', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not connect to the server.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Campfire</Text>
      <Text style={styles.subtitle}>Welcome back to the circle.</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#8C7A70"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#8C7A70"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin}>
        <Text style={styles.btnText}>Ignite</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
        <Text style={styles.linkText}>New here? Join the camp.</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A110D', justifyContent: 'center', padding: 20 },
  brand: { fontSize: 48, fontWeight: 'bold', color: '#FF6B35', textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#D4C5B9', textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: '#2E221D', color: '#FFF', borderRadius: 12, padding: 16, marginBottom: 15, fontSize: 16 },
  primaryBtn: { backgroundColor: '#FF6B35', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  linkText: { color: '#FFB385', textAlign: 'center', marginTop: 20, fontSize: 16 },
});