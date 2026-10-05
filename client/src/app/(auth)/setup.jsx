import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const API_URL = 'https://campfire2-sndp.onrender.com/api/auth';

export default function SetupScreen() {
  const router = useRouter();
  const { email, password, hobbies } = useLocalSearchParams();
  const [userName, setUserName] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  
  // Set the default profile picture in state
  const [profilePicture, setProfilePicture] = useState('https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png');

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Force 1:1 crop for perfect circles
      quality: 0.2,   // Compress for MongoDB
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setProfilePicture(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleRegister = async () => {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, password, userName, name, bio, 
          hobbies: JSON.parse(hobbies),
          profilePicture // Send the uploaded picture instead of the hardcoded one
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        console.log("registered, saving data in async...");
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userName', data.userName);
        router.replace('/(tabs)');
      } else {
        Alert.alert('Registration Failed', data.message);
      }
    } catch (err) {
      Alert.alert('Error', 'Network request failed.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fuel the Fire</Text>
      <Text style={styles.subtitle}>Set up your profile identity.</Text>
      
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Image source={{ uri: profilePicture }} style={styles.pfp} />
        <Text style={styles.imagePickerText}>+ Add Photo</Text>
      </TouchableOpacity>
      
      <TextInput style={styles.input} placeholder="Username (@unique)" placeholderTextColor="#8C7A70" onChangeText={setUserName} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Display Name" placeholderTextColor="#8C7A70" onChangeText={setName} />
      <TextInput style={[styles.input, { height: 100 }]} placeholder="Bio" placeholderTextColor="#8C7A70" multiline onChangeText={setBio} />
      
      <TouchableOpacity style={styles.btn} onPress={handleRegister}>
        <Text style={styles.btnText}>Join Campfire</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0806', padding: 20, justifyContent: 'center' },
  title: { fontSize: 32, color: '#FF6B35', fontWeight: 'bold' },
  subtitle: { color: '#8C7A70', marginBottom: 20 },
  imagePicker: { alignItems: 'center', marginBottom: 25 },
  pfp: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#FF6B35', backgroundColor: '#1A110D' },
  imagePickerText: { color: '#FF6B35', marginTop: 10, fontWeight: 'bold' },
  input: { backgroundColor: '#1A110D', color: '#FFF', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#2E221D' },
  btn: { backgroundColor: '#FF6B35', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});