import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const API_URL = 'https://campfire2-sndp.onrender.com/api/auth';

export default function VerifyScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams(); // Gets email from signup screen
  const [otp, setOtp] = useState('');

  const handleVerify = async () => {
    try {
      // Calls POST /verifyOTP[cite: 4]
      const response = await fetch(`${API_URL}/verifyOTP`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, userEnteredOTP: otp }), // Matches required body[cite: 1]
      });
      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Registered successfully! You can now log in.');
        router.replace('/(auth)/login');
      } else {
        Alert.alert('Verification Failed', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not connect to the server.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Verify OTP</Text>
      <Text style={styles.subtitle}>Enter the 6-digit code sent to {email}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        placeholderTextColor="#8C7A70"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
      />

      <TouchableOpacity style={styles.primaryBtn} onPress={handleVerify}>
        <Text style={styles.btnText}>Verify</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A110D', justifyContent: 'center', padding: 20 },
  brand: { fontSize: 32, fontWeight: 'bold', color: '#FF6B35', textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#D4C5B9', textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: '#2E221D', color: '#FFF', borderRadius: 12, padding: 16, marginBottom: 15, fontSize: 16, textAlign: 'center', letterSpacing: 5 },
  primaryBtn: { backgroundColor: '#FF6B35', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});