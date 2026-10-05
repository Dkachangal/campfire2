import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleNext = async () => {
    const res = await fetch('https://campfire2-sndp.onrender.com/api/auth/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    if (res.ok) {
      router.push({ pathname: '/(auth)/hobbies', params: { email, password } });
    } else {
      Alert.alert('Error', 'Email already in use.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ignite Your Campfire</Text>
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#8C7A70" onChangeText={setEmail} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#8C7A70" onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.btn} onPress={handleNext}><Text style={styles.btnText}>Next: Select Hobbies</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A110D', padding: 20, justifyContent: 'center' },
  title: { fontSize: 32, color: '#FF6B35', fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#2E221D', color: '#FFF', padding: 15, borderRadius: 10, marginBottom: 15 },
  btn: { backgroundColor: '#FF6B35', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});