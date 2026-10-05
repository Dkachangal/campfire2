import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const HOBBIES = ['Singing', 'Dancing', 'Guitar', 'Piano', 'Gym', 'Yoga', 'Gaming', 'Coding', 'Photography', 'Art', 'Writing', 'Reading', 'Cooking', 'Baking', 'Skateboarding', 'Cycling', 'Hiking', 'Anime', 'Movies', 'Fashion'];

export default function HobbiesScreen() {
  const router = useRouter();
  const { email, password } = useLocalSearchParams();
  const [selected, setSelected] = useState([]);

  const toggleHobby = (hobby) => {
    if (selected.includes(hobby)) {
      setSelected(selected.filter(h => h !== hobby));
    } else {
      if (selected.length >= 5) return Alert.alert('Limit Reached', 'Select up to 5 hobbies.');
      setSelected([...selected, hobby]);
    }
  };

  const handleNext = () => {
    if (selected.length === 0) return Alert.alert('Wait!', 'Pick at least one hobby.');
    router.push({
      pathname: '/(auth)/setup',
      params: { email, password, hobbies: JSON.stringify(selected) }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What sparks your interest?</Text>
      <Text style={styles.subtitle}>Select up to 5 hobbies ({selected.length}/5)</Text>
      
      <FlatList
        data={HOBBIES}
        numColumns={2}
        keyExtractor={(item) => item}
        renderItem={({ item }) => {
          const isSelected = selected.includes(item);
          return (
            <TouchableOpacity 
              style={[styles.pill, isSelected && styles.pillActive]} 
              onPress={() => toggleHobby(item)}
            >
              <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>{item}</Text>
            </TouchableOpacity>
          );
        }}
      />
      <TouchableOpacity style={styles.btn} onPress={handleNext}>
        <Text style={styles.btnText}>Next: Setup Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0806', padding: 20, paddingTop: 60 },
  title: { fontSize: 28, color: '#FF6B35', fontWeight: 'bold' },
  subtitle: { color: '#8C7A70', marginBottom: 20 },
  pill: { flex: 1, margin: 5, padding: 15, borderRadius: 25, backgroundColor: '#1A110D', borderWidth: 1, borderColor: '#2E221D', alignItems: 'center' },
  pillActive: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  pillText: { color: '#D4C5B9', fontWeight: '600' },
  pillTextActive: { color: '#FFF' },
  btn: { backgroundColor: '#FF6B35', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20, marginBottom: 30 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});