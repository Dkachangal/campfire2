import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
// import { API_URL } from '../../config';

export default function CreateScreen() {
  const API_URL = 'https://campfire2-sndp.onrender.com/api';
  const router = useRouter();
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    if (images.length >= 2) return; 
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Strict 1:1 square
      quality: 0.2, 
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setImages([...images, base64Image]);
    }
  };

  const handlePost = async () => {
    if (!content.trim() && images.length === 0) return;
    setLoading(true);
    
    const author = await AsyncStorage.getItem('userName');
    const payloadText = [content, ...images];

    await fetch(`${API_URL}/global/post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, text: payloadText })
    });
    
    setContent('');
    setImages([]);
    setLoading(false);
    router.replace('/(tabs)'); 
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.nav}>
        <Text style={styles.title}>New Spark</Text>
        <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={handlePost} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Ignite</Text>}
        </TouchableOpacity>
      </View>
      
      <TextInput
        style={styles.input}
        placeholder="What's burning in your mind?"
        placeholderTextColor="#A38F82"
        multiline
        autoFocus
        value={content}
        onChangeText={setContent}
      />

      <View style={styles.imageContainer}>
        {images.map((img, index) => (
          <Image key={index} source={{ uri: img }} style={styles.previewImage} />
        ))}
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.mediaBtn} onPress={pickImage}>
          <Text style={styles.mediaBtnText}>+ Add Photo 1:1 ({images.length}/2)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCF8F2', paddingHorizontal: 20 },
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 20 },
  title: { fontSize: 24, fontWeight: '900', color: '#3D2B1F' },
  btn: { backgroundColor: '#E05A10', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 25, shadowColor: '#E05A10', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  input: { color: '#3D2B1F', fontSize: 22, lineHeight: 32, minHeight: 150, textAlignVertical: 'top' },
  imageContainer: { flexDirection: 'row', gap: 15, marginVertical: 15 },
  previewImage: { width: 120, height: 120, borderRadius: 16, backgroundColor: 'rgba(224, 90, 16, 0.05)', borderWidth: 1, borderColor: 'rgba(224, 90, 16, 0.2)' },
  toolbar: { borderTopWidth: 1, borderTopColor: 'rgba(224, 90, 16, 0.1)', paddingTop: 20, marginTop: 'auto', marginBottom: 20 },
  mediaBtn: { alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: 'rgba(224, 90, 16, 0.08)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(224, 90, 16, 0.15)' },
  mediaBtnText: { color: '#E05A10', fontWeight: 'bold', fontSize: 15 }
});